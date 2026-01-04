const express = require('express');
const router = express.Router();
const { shortenUrl, getUrls, getAnalytics, deleteUrl } = require('../controllers/urlController');
const { protect } = require('../middleware/auth');
const apiLimiter = require('../middleware/rateLimiter');

// Public shorten (or protected?)
// Req: "Anyone can shorten URLs (no login required) ... Link URLs to user accounts"
// So we need a middleware that OPTIONALLY gets user.
// `protect` enforces user. We might need `optionalProtect` or just handle it in controller.
// But `protect` returns 401 if no token.
// Middleware to attach user if token exists, but not fail if not?
const optionalProtect = async (req, res, next) => {
    // Basic logic: if auth header, try to protect. If error/no header, just next().
    // But `protect` implementation sends 401. 
    // I'll make a specialized middleware inside `auth.js` or just simple inline here for now.
    // Actually standard `protect` is strict. 

    // For now, I'll allow shortenUrl to be public, but check `req.headers`.
    // Let's modify `auth.js` to add `optionalProtect` or do it here.
    // Simplified: check `req.headers.authorization` manually in controller or use a new middleware.
    // I'll use a clone of protect logic but without 401.
    const jwt = require('jsonwebtoken');
    const User = require('../models/User'); // Path relative to this file? No, relative to this file is '../models...'

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
        } catch (error) {
            // Invalid token, just ignore? Or warn?
            // Usually ignore for public routes
        }
    }
    next();
};

router.post('/shorten', apiLimiter, optionalProtect, shortenUrl);
router.get('/all', protect, getUrls);
router.get('/analytics/:shortCode', protect, getAnalytics);
router.delete('/:id', protect, deleteUrl);

module.exports = router;
