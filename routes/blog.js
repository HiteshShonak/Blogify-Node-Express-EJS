const { Router } = require('express');
const multer = require('multer');
const { upload } = require('../services/upload');
const { restrictTo } = require('../middlewares/auth');
const {
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
} = require('../controller/blog');

const router = Router();


// Add New Blog
router.get('/add-blog', restrictTo(["USER", "ADMIN"]), handleGetAddBlog);

router.post('/add-blog', restrictTo(["USER", "ADMIN"]), upload.single('coverImage'), handlePostAddBlog);

// Edit Blog
router.get('/edit/:id', restrictTo(["USER", "ADMIN"]), handleGetEditBlog);

router.post('/edit/:id', restrictTo(["USER", "ADMIN"]), upload.single('coverImage'), handlePostEditBlog);

// Explore / Search
router.get('/all', handleGetAllBlogs);

// View Blog
router.get('/:slug', handleGetBlogBySlug);

// Post Comment
router.post('/comment/:blogId', restrictTo(["USER", "ADMIN"]), handlePostComment);

// Delete Comment
router.get('/comment/delete/:commentId/:blogId', restrictTo(["USER", "ADMIN"]), handleGetDeleteComment);

// Toggle Like
router.get('/like/:blogId', restrictTo(["USER", "ADMIN"]), handleGetLike);

// Delete Blog Post
router.get('/delete/:id', restrictTo(["USER", "ADMIN"]), handleGetDeleteBlog);

// Multer Error Handler
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Max 5MB allowed.' });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Unexpected file field.' });
        }
    }

    if (error.message && error.message.includes('Invalid file type')) {
        return res.status(400).json({ error: error.message });
    }

    next(error);
});

module.exports = router;
