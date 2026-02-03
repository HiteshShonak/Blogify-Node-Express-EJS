const Blog = require('../models/blog');
const ViewLog = require('../models/viewLog');
const Comment = require('../models/comment');
const { uploadToCloudinary, cloudinary } = require('../services/upload');

// Extract Cloudinary public ID from image URL
function getPublicIdFromUrl(url) {
    try {
        if (!url) return null;

        const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);

        if (matches && matches[1]) {
            return matches[1];
        }

        const parts = url.split('/');
        const fileName = parts.pop().split('.')[0];
        const folder = parts.pop();
        return `${folder}/${fileName}`;

    } catch (error) {
        console.error("Error extracting Public ID:", error);
        return null;
    }
}

async function handleGetAddBlog(req, res) {
    return res.render('addBlog', {
        user: req.user,
        apiKey: process.env.TINYMCE_API_KEY
    });
}

async function handlePostAddBlog(req, res) {
    const { title, body, status, slug } = req.body;

    if (!req.user) return res.status(401).json({ error: "Not logged in" });
    if (!title || !body) return res.status(400).json({ error: "Title and Body are required." });
    if (!slug) return res.status(400).json({ error: "Slug is missing." });
    if (!req.file) return res.status(400).json({ error: "Cover image is required." });

    let uploadedPublicId = null;

    try {
        // Upload cover image
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        uploadedPublicId = result.public_id;

        const blogData = {
            title,
            body,
            urlSlug: slug,
            status: status || 'active',
            createdBy: req.user._id,
            coverImageURL: result.secure_url
        };

        const blog = await Blog.create(blogData);
        return res.status(201).json({ status: "success", redirect: `/blog/${blog.urlSlug}` });

    } catch (error) {
        // Rollback image upload if blog creation fails
        if (uploadedPublicId) {
            cloudinary.uploader.destroy(uploadedPublicId).catch(err =>
                console.error("Cleanup Error:", err)
            );
        }

        if (error.code === 11000) {
            return res.status(400).json({ error: "This URL Slug is taken." });
        }
        console.error("Add Blog Error:", error);
        return res.status(500).json({ error: error.message });
    }
}

async function handleGetEditBlog(req, res) {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.redirect('/');

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }

        return res.render('editBlog', {
            user: req.user,
            blog: blog,
            apiKey: process.env.TINYMCE_API_KEY
        });
    } catch (err) {
        return res.redirect('/');
    }
}

async function handlePostEditBlog(req, res) {
    const { title, body, status, slug } = req.body;
    let uploadedPublicId = null;

    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const oldImageURL = blog.coverImageURL;

        blog.title = title;
        blog.body = body;
        blog.status = status;
        blog.urlSlug = slug;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
            uploadedPublicId = result.public_id;
            blog.coverImageURL = result.secure_url;
        }

        await blog.save();

        // Clean up old cover image after update
        if (req.file && oldImageURL && !oldImageURL.includes('default-cover')) {
            const publicId = getPublicIdFromUrl(oldImageURL);
            if (publicId) {
                cloudinary.uploader.destroy(publicId).catch(err =>
                    console.error("Old Image Cleanup Error:", err)
                );
            }
        }

        return res.status(200).json({ status: "success", redirect: `/blog/${blog.urlSlug}` });

    } catch (error) {
        // Rollback new image if update fails
        if (uploadedPublicId) {
            cloudinary.uploader.destroy(uploadedPublicId).catch(err =>
                console.error("New Image Cleanup Error:", err)
            );
        }

        if (error.code === 11000) return res.status(400).json({ error: "Slug is already taken." });
        console.error("Edit Blog Error:", error);
        return res.status(500).json({ error: "Update failed." });
    }
}

async function handleGetAllBlogs(req, res) {
    const search = req.query.search;
    let query = { status: 'active' };

    if (search) {
        query = {
            $and: [
                { status: 'active' },
                { $text: { $search: search } }
            ]
        };
    }

    try {
        const blogs = await Blog.find(query)
            .populate('createdBy')
            .sort({ createdAt: -1 });

        res.render('allBlogs', {
            user: req.user,
            blogs: blogs,
            searchQuery: search || ''
        });

    } catch (error) {
        res.redirect('/');
    }
}

async function handleGetBlogBySlug(req, res) {
    try {
        const blog = await Blog.findOne({ urlSlug: req.params.slug }).populate('createdBy');
        if (!blog) return res.status(404).render('404', { user: req.user });

        const comments = await Comment.find({ blogId: blog._id }).populate('createdBy');

        const ip = req.ip;
        const userId = req.user ? req.user._id : null;

        const hasViewed = await ViewLog.findOne({
            blogId: blog._id, ipAddress: ip, ...(userId && { userId })
        });

        if (!hasViewed) {
            blog.views += 1;
            blog.updateTrendingScore();
            await blog.save();
            await ViewLog.create({ blogId: blog._id, ipAddress: ip, userId: userId });
        }

        return res.render('blog', {
            user: req.user,
            blog: blog,
            comments: comments
        });

    } catch (error) {
        return res.redirect('/');
    }
}

async function handlePostComment(req, res) {
    try {
        await Comment.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id,
        });
        const blog = await Blog.findById(req.params.blogId);
        return res.redirect(`/blog/${blog.urlSlug}`);
    } catch (error) {
        return res.redirect('/');
    }
}

async function handleGetDeleteComment(req, res) {
    try {
        const comment = await Comment.findById(req.params.commentId).populate('blogId');
        if (!comment) return res.redirect('back');

        const isMyComment = comment.createdBy.toString() === req.user._id.toString();
        const isMyBlog = comment.blogId.createdBy.toString() === req.user._id.toString();

        if (isMyComment || isMyBlog) {
            await Comment.findByIdAndDelete(req.params.commentId);
        }

        const blog = await Blog.findById(req.params.blogId);
        return res.redirect(`/blog/${blog.urlSlug}`);

    } catch (error) {
        return res.redirect('/');
    }
}

async function handleGetLike(req, res) {
    try {
        const blog = await Blog.findById(req.params.blogId);
        const userId = req.user._id;

        const index = blog.likes.indexOf(userId);
        let isLiked = false;

        if (index === -1) {
            blog.likes.push(userId);
            isLiked = true;
        } else {
            blog.likes.splice(index, 1);
            isLiked = false;
        }

        blog.updateTrendingScore();
        await blog.save();

        return res.json({ status: 'success', likes: blog.likes.length, isLiked });

    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
}

async function handleGetDeleteBlog(req, res) {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) return res.status(404).redirect('/');

        const isAuthor = blog.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN';

        if (!isAuthor && !isAdmin) {
            return res.status(403).redirect('/');
        }

        if (blog.coverImageURL && !blog.coverImageURL.includes('default-cover')) {
            const publicId = getPublicIdFromUrl(blog.coverImageURL);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId).catch(err => console.error(err));
            }
        }

        await Blog.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ blogId: req.params.id });

        return res.redirect('/');

    } catch (error) {
        console.error("Delete Blog Error:", error);
        return res.redirect('/');
    }
}

module.exports = {
    handleGetAddBlog,
    handlePostAddBlog,
    handleGetEditBlog,
    handlePostEditBlog,
    handleGetAllBlogs,
    handleGetBlogBySlug,
    handlePostComment,
    handleGetDeleteComment,
    handleGetLike,
    handleGetDeleteBlog
};