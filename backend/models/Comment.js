const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        index: true,
    },
    commentId: {
        type: String,
        required: true,
        unique: true,
    },
    text: {
        type: String,
        required: true,
    },
    author: String,
    authorChannelId: String,
    likeCount: Number,
    publishedAt: Date,
    emotion: {
        type: String,
        enum: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love', 'neutral'],
        required: true,
    },
    emotionConfidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
    },
    emotionAnalysis: {
        preprocessedText: String,
        features: [Number], // For storing feature vectors
        modelVersion: String,
        analyzedAt: {
            type: Date,
            default: Date.now,
        },
    },
}, {
    timestamps: true,
});

// Index for faster queries
commentSchema.index({ videoId: 1, emotion: 1 });
commentSchema.index({ videoId: 1, publishedAt: -1 });
commentSchema.index({ videoId: 1, likeCount: -1 });
commentSchema.index({ videoId: 1, emotionConfidence: -1 });

module.exports = mongoose.model('Comment', commentSchema); 