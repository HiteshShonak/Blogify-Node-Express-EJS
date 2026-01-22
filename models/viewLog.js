const { Schema, model } = require('mongoose');

const viewLogSchema = new Schema({
    blogId: {
        type: Schema.Types.ObjectId,
        ref: 'blog',
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: false, // Optional: might be a guest
    },
    ipAddress: {
        type: String,
        required: true, // Use IP for guests
    },
}, { timestamps: true });

// TTL INDEX (Time To Live)
// This automatically deletes the log from the database after 1 hour (3600 seconds).
// This keeps your database clean and handles the logic for you!
viewLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const ViewLog = model('viewLog', viewLogSchema);

module.exports = ViewLog;