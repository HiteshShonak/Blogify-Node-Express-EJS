const { Schema, model } = require('mongoose');

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    urlSlug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    body: {
        type: String,
        required: true,
    },
    coverImageURL: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'draft'],
        default: 'active'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user', 
        required: true,
    },

    views: {
        type: Number,
        default: 0,
    },
    
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],

    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comment' 
    }],

    trendingScore: {
        type: Number,
        default: 0,
    }

}, { timestamps: true });

blogSchema.index({ createdAt: -1 });
blogSchema.index({ trendingScore: -1 });
blogSchema.index({ title: 'text', body: 'text' });


blogSchema.methods.updateTrendingScore = function() {
    const viewWeight = 1;
    const likeWeight = 5;
    const commentWeight = 10;

    this.trendingScore = (this.views * viewWeight) + 
                         (this.likes.length * likeWeight) + 
                         (this.comments.length * commentWeight);
};

const Blog = model('blog', blogSchema);

module.exports = Blog;