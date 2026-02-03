const User = require("../models/user");
const { createToken } = require("../services/authentication");
const Blog = require('../models/blog');

async function handleGetSignup(req, res) {
  return res.render("signup");
}

async function handleGetLogin(req, res) {
  return res.render("login");
}

async function handleGetGetStarted(req, res) {
  res.render('gateway.ejs', { user: req.user });
}

async function handlePostSignup(req, res) {
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
}

async function handlePostLogin(req, res) {
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
}

async function handleGetLogout(req, res) {
  res.clearCookie("uid").redirect("/");
}

async function handleGetProfile(req, res) {
  try {
    // Get all user's blogs sorted by newest
    const allBlogs = await Blog.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    // Split into active vs drafts
    const activeBlogs = allBlogs.filter(b => b.status === 'active');
    const draftBlogs = allBlogs.filter(b => b.status === 'draft');

    // Calculate stats
    const totalViews = allBlogs.reduce((acc, blog) => acc + blog.views, 0);
    const totalLikes = allBlogs.reduce((acc, blog) => acc + blog.likes.length, 0);

    // Find best performing post
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
}

module.exports = {
  handleGetSignup,
  handleGetLogin,
  handleGetGetStarted,
  handlePostSignup,
  handlePostLogin,
  handleGetLogout,
  handleGetProfile,
};
