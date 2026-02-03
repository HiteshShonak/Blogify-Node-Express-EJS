const Blog = require("../models/blog");
const { Resend } = require("resend");

async function handleGetHome(req, res) {
    try {
        const trendingBlogs = await Blog.find({ status: 'active' })
            .populate('createdBy')
            .sort({ trendingScore: -1 })
            .limit(6);

        res.render('home', {
            user: req.user,
            blogs: trendingBlogs
        });
    } catch (error) {
        console.error("Home Error:", error);
        // Show empty home if database fails
        res.render('home', { user: req.user, blogs: [] });
    }
}

async function handleGetAbout(req, res) {
    res.render('about', { user: req.user });
}

async function handleGetContact(req, res) {
    res.render('contact', { user: req.user });
}

async function handlePostContact(req, res) {
    const { name, email, topic, message } = req.body;

    if (!process.env.RESEND_API_KEY) {
        console.error("Missing RESEND_API_KEY environment variable");
        return res.status(500).json({ error: "Server Email Configuration Missing" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        // Send admin notification
        await resend.emails.send({
            from: 'Blogify <onboarding@resend.dev>',
            to: process.env.GMAIL_USER || 'contact.blogify@gmail.com',
            subject: `Blogify Contact: ${topic}`,
            html: `
                <h3>New Message from ${name}</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Topic:</strong> ${topic}</p>
                <hr>
                <p>${message}</p>
            `
        });

        // Send user confirmation
        await resend.emails.send({
            from: 'Blogify <onboarding@resend.dev>',
            to: email,
            subject: 'Thank you for contacting Blogify',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2>Thank You, ${name}!</h2>
                    <p>We've received your message about: <strong>${topic}</strong></p>
                    <p>Our team will get back to you within 24 hours.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is an automated confirmation. Please do not reply to this email.
                    </p>
                </div>
            `
        });

        return res.json({ status: 'success', message: 'Email sent successfully!' });
    } catch (error) {
        console.error("Contact Email Error:", error);
        return res.status(500).json({ error: "Failed to send email. Check server logs." });
    }
}

async function handlePostSubscribe(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    if (!process.env.RESEND_API_KEY) {
        console.error("Subscription Error: Missing RESEND_API_KEY environment variable");
        return res.status(500).json({ error: "Server Configuration Error" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        await resend.emails.send({
            from: 'Blogify Team <onboarding@resend.dev>',
            to: email,
            subject: "Welcome to the Blogify Community",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #111827; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Blogify.</h1>
                    </div>
                    <div style="padding: 40px; background-color: #ffffff;">
                        <h2 style="color: #111827; margin-top: 0;">You're on the list!</h2>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Hi there,
                        </p>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Thank you for subscribing to our newsletter. You've just joined a community of thinkers, writers, and storytellers.
                        </p>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Expect the best stories, curated insights, and platform updates delivered right to your inbox. We promise to keep it quality-focused—no spam, ever.
                        </p>
                        <br>
                        <a href="${process.env.BASE_URL || 'http://localhost:8000'}/blog/all" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Start Reading</a>
                    </div>
                    <div style="background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                        © 2025 Blogify Platform. All rights reserved.
                    </div>
                </div>
            `
        });

        return res.json({ status: 'success', message: 'Subscribed successfully!' });
    } catch (error) {
        console.error("Subscription Email Error:", error);
        return res.status(500).json({ error: "Failed to subscribe. Check server logs." });
    }
}

async function handleGetHealth(req, res) {
    return res.status(200).json({ status: 'active', server: 'Blogify' });
}

module.exports = {
    handleGetHome,
    handleGetAbout,
    handleGetContact,
    handlePostContact,
    handlePostSubscribe,
    handleGetHealth
};
