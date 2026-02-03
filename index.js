require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT;
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user');
const { checkAuthentication } = require('./middlewares/auth');
const blogRouter = require('./routes/blog');
const staticRouter = require('./routes/staticRouter.js');
const Blog = require('./models/blog');

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB:', err);
});

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));
app.use(express.json());
app.use(express.static(path.resolve('./public')));
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(checkAuthentication);

app.use((req, res, next) => {
    res.locals.tinyMceKey = process.env.TINYMCE_API_KEY;
    next();
});

// Image optimizer helper
app.locals.optimizeImage = (url, type) => {
    if (!url || !url.includes('cloudinary.com')) return url;

    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    let params = '';
    switch (type) {
        case 'card':
            params = 'w_800,c_fill,q_auto:good,f_auto,e_sharpen:20';
            break;

        case 'detail':
            params = 'w_1920,c_limit,q_auto:good,f_auto,e_sharpen:20';
            break;

        case 'mobile':
            params = 'w_800,c_limit,q_auto:good,f_auto';
            break;

        default:
            params = 'q_auto,f_auto';
    }

    const part1 = url.slice(0, uploadIndex + 8);
    const part2 = url.slice(uploadIndex + 8);

    return `${part1}${params}/${part2}`;
};


app.use('/', staticRouter);
app.use('/user', userRouter);
app.use('/blog', blogRouter);

app.use((req, res) => {
    res.status(404).render('404', { user: req.user });
});

app.listen(port, () => {
    console.log(`Server Started!`);
    console.log(`http://localhost:${port}`);
});