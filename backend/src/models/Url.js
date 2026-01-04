const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: [true, 'Please add a URL']
    },
    shortCode: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional, as per schema design (maybe guest shortening allowed? Plan says "Link URLs to user accounts" but requirements say "Anyone can shorten URLs (no login required)" for home page)
    },
    clicks: {
        type: Number,
        default: 0
    },
    clickHistory: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String,
        userAgent: String,
        referrer: String
    }],
    expiresAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Url', urlSchema);
