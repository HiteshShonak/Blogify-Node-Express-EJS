
# Blog App

A robust blogging platform focused on performance, reading experience, and content management. Built with Node.js, MongoDB, and Express.

## Features

- **Smart Image Optimization**: Client-side compression (browser-image-compression), secure uploads (Multer), and dynamic delivery via Cloudinary for optimal quality and speed.
- **Email Contact System**: Users can contact the admin directly via Nodemailer integration.
- **Authentication & Security**: Secure signup/login with Bcrypt, JWT-based sessions in HTTP-only cookies, and user-friendly password toggle.
- **Rich Content Editor**: TinyMCE WYSIWYG editor, auto-save drafts to localStorage, and a draft/publish system.
- **Engagement & Analytics**: Live AJAX likes, full comment system, and unique view counter for each post.
- **Full-Text Search**: Quickly find posts by title or content.

## Tech Stack

**Backend:**
- Node.js, Express
- MongoDB, Mongoose
- Dotenv

**Security & Auth:**
- Bcrypt, JWT, Cookie-Parser

**Files & Media:**
- Multer, Cloudinary

**Utilities:**
- Nodemailer, EJS, Nodemon

**Frontend:**
- TailwindCSS, Browser-Image-Compression, TinyMCE

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/blog-app.git
   cd blog-app
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=8000
   MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/blogApp?retryWrites=true&w=majority
   COOKIE_SECRET=your_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   TINYMCE_API_KEY=your_tinymce_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```
4. **Start the server**
   ```bash
   npm start
   ```
5. **Open the app**
   Visit [http://localhost:8000](http://localhost:8000) in your browser.

---

## About This Project

- Built primarily to showcase backend development skills and server-side rendering.
- Uses **EJS** as the templating engine for dynamic HTML generation.
- Created by [HiteshShonak](https://github.com/HiteshShonak).