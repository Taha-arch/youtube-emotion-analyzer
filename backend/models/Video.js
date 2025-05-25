const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    thumbnail: String,
    viewCount: Number,
    likeCount: Number,
    commentCount: Number,
    channelId: String,
    channelTitle: String,
    publishedAt: Date,
    lastAnalyzed: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Video', videoSchema); 