const Blog = require('../models/blog.js');
const ViewLog = require('../models/viewLog');

async function handleGetBlogById(req, res) {
    const { id } = req.params;
    const user = req.user; // Might be null if guest
    const ip = req.ip; // Express gives us the IP address automatically

    try {
        const blog = await Blog.findById(id).populate('createdBy');
        if (!blog) return res.status(404).send("Blog not found");

        // === VIEW COUNTING LOGIC ===
        
        // 1. Define who is viewing (User ID or IP)
        const viewerQuery = { 
            blogId: id, 
            ipAddress: ip, 
            ...(user && { userId: user._id }) // If logged in, add userId to query
        };

        // 2. Check if they viewed in the last hour
        // (Since we used TTL index in the model, if the record exists, it IS within 1 hour)
        const hasViewed = await ViewLog.findOne(viewerQuery);

        if (!hasViewed) {
            // A. Increment Views
            blog.views += 1;

            // B. Recalculate Trending Score
            // Formula: (Views * 1) + (Likes * 5) + (Comments * 10)
            const likeCount = blog.likes.length;
            const commentCount = blog.comments.length;
            blog.trendingScore = (blog.views * 1) + (likeCount * 5) + (commentCount * 10);

            await blog.save();

            // C. Create the Log (This starts the 1-hour timer)
            await ViewLog.create(viewerQuery);
        }

        // === RENDER PAGE ===
        // Fetch comments separately if needed (recommended)
        // const comments = await Comment.find({ blogId: id }).populate('createdBy');

        return res.render('blog', {
            user: req.user,
            blog: blog,
            // comments: comments
        });

    } catch (error) {
        console.error("Error fetching blog:", error);
        return res.redirect('/');
    }
}