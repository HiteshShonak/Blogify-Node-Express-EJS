const { Router } = require("express");
const User = require("../models/user");
const { createToken } = require("../services/authentication"); 
const { restrictTo } = require("../middlewares/auth");
const Blog = require('../models/blog');

const router = Router();

router.get("/signup", restrictTo(['GUEST']), (req, res) => {
  return res.render("signup");
});
router.get("/login", restrictTo(['GUEST']), (req, res) => {
  return res.render("login");
});

router.get('/get-started', (req, res) => {
    res.render('gateway.ejs', { user: req.user });
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const newUser = await User.create({ fullName, email, password });
    const token = createToken(newUser); 
    
    res.cookie("uid", token);
    return res.status(201).json({ status: "success", redirect: "/" });

  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ error: "Email is already registered." });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createToken(user);
    res.cookie("uid", token);
    
    return res.status(200).json({ status: "success", redirect: "/" });

  } catch (error) {
    return res.status(500).json({ error: "Something went wrong." });
  }
});

router.get("/logout", restrictTo(['USER', 'ADMIN']), (req, res) => {
    res.clearCookie("uid").redirect("/");
});


router.get('/profile', restrictTo(["USER", "ADMIN"]), async (req, res) => {
    try {
        // 1. Fetch all blogs by this user (Sorted by newest)
        const allBlogs = await Blog.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

        // 2. Separate Active vs Drafts
        const activeBlogs = allBlogs.filter(b => b.status === 'active');
        const draftBlogs = allBlogs.filter(b => b.status === 'draft');

        // 3. Calculate Stats
        const totalViews = allBlogs.reduce((acc, blog) => acc + blog.views, 0);
        const totalLikes = allBlogs.reduce((acc, blog) => acc + blog.likes.length, 0);

        // 4. Find Best Performing Post (Highest Trending Score)
        // We sort a copy of the array so we don't mess up the date sorting
        const bestBlog = [...activeBlogs].sort((a, b) => b.trendingScore - a.trendingScore)[0];

        res.render('profile', {
            user: req.user,
            activeBlogs,
            draftBlogs,
            stats: {
                views: totalViews,
                likes: totalLikes,
                posts: activeBlogs.length
            },
            bestBlogId: bestBlog ? bestBlog._id.toString() : null
        });

    } catch (error) {
        console.error("Profile Error:", error);
        res.redirect('/');
    }
});

module.exports = router;

module.exports = router;