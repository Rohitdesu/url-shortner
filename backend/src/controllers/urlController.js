const Url = require('../models/Url');
const { generateShortCode } = require('../utils/shortCode');
const { validateUrl } = require('../utils/validators');
const { getRedisClient } = require('../config/redis');

// @desc    Create short URL
// @route   POST /api/url/shorten
// @access  Public/Private
exports.shortenUrl = async (req, res) => {
    try {
        const { originalUrl, customCode, expiresAt } = req.body;

        // Validation
        if (!validateUrl(originalUrl)) {
            return res.status(400).json({ success: false, message: 'Invalid URL' });
        }

        let shortCode;

        if (customCode) {
            // Check availability
            const exists = await Url.findOne({ shortCode: customCode });
            if (exists) {
                return res.status(400).json({ success: false, message: 'Short code already taken' });
            }
            shortCode = customCode;
        } else {
            shortCode = await generateShortCode();
            // Ensure uniqueness (rare collision check)
            let exists = await Url.findOne({ shortCode });
            while (exists) {
                shortCode = await generateShortCode();
                exists = await Url.findOne({ shortCode });
            }
        }

        const urlData = {
            originalUrl,
            shortCode,
            expiresAt
        };

        if (req.user) {
            urlData.userId = req.user.id;
        }

        const url = await Url.create(urlData);

        // Cache in Redis (1 hour)
        const redisClient = getRedisClient();
        if (redisClient && redisClient.isOpen) {
            await redisClient.set(shortCode, originalUrl, {
                EX: 3600
            });
        }

        const baseUrl = process.env.BASE_URL;
        const shortUrl = `${baseUrl}/${shortCode}`;

        res.status(201).json({
            success: true,
            shortUrl,
            shortCode,
            originalUrl: url.originalUrl
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Redirect to original URL
// @route   GET /:shortCode
// @access  Public
exports.redirectUrl = async (req, res) => {
    try {
        const { shortCode } = req.params;
        const redisClient = getRedisClient();

        // 1. Check Redis Cache
        if (redisClient && redisClient.isOpen) {
            const cachedUrl = await redisClient.get(shortCode);
            if (cachedUrl) {
                // Async: Record click analytics for cached hit
                // We don't await this to keep redirect fast
                recordClick(shortCode, req).catch(err => console.error('Analytics Error:', err));
                return res.redirect(cachedUrl);
            }
        }

        // 2. Check Database
        const url = await Url.findOne({ shortCode });

        if (!url) {
            return res.status(404).json({ success: false, message: 'URL not found' });
        }

        // Check active and expiration
        if (!url.isActive) {
            return res.status(410).json({ success: false, message: 'URL is inactive' });
        }
        if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
            return res.status(410).json({ success: false, message: 'URL has expired' });
        }

        // 3. Cache and Redirect
        if (redisClient && redisClient.isOpen) {
            await redisClient.set(shortCode, url.originalUrl, {
                EX: 3600
            });
        }

        // Record click
        await recordClick(shortCode, req, url); // Pass url object to avoid re-fetch if possible

        return res.redirect(url.originalUrl);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Helper to record clicks
async function recordClick(shortCode, req, urlObj = null) {
    const clickData = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer || req.headers.referrer // 'referer' is the standard header name
    };

    if (urlObj) {
        urlObj.clicks += 1;
        urlObj.clickHistory.push(clickData);
        await urlObj.save();
    } else {
        await Url.updateOne(
            { shortCode },
            {
                $inc: { clicks: 1 },
                $push: { clickHistory: clickData }
            }
        );
    }
}


// @desc    Get all URLs for user
// @route   GET /api/url/all
// @access  Private
exports.getUrls = async (req, res) => {
    try {
        const urls = await Url.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: urls.length,
            urls
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get analytics for a URL
// @route   GET /api/url/analytics/:shortCode
// @access  Private (Owner only?) 
// Req says "Protected route (login required)". Usually owner only.
exports.getAnalytics = async (req, res) => {
    try {
        const url = await Url.findOne({ shortCode: req.params.shortCode });

        if (!url) {
            return res.status(404).json({ success: false, message: 'URL not found' });
        }

        // Check ownership? 
        // If user is logged in, check if they own it? 
        // If the URL has no user (guest), maybe allows anyone?
        // For now, if url.userId exists, strictly check ownership.
        if (url.userId && url.userId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Process analytics
        // "Clicks per day (chart)", "Top referrers", "Browser breakdown"
        // We will just return the raw data + clickHistory and let frontend process or do some aggregation here.
        // The requirements example response includes "clicksByDate".

        // Aggregate clicks by date
        const clicksByDate = {};
        url.clickHistory.forEach(click => {
            const date = click.timestamp.toISOString().split('T')[0];
            clicksByDate[date] = (clicksByDate[date] || 0) + 1;
        });

        res.status(200).json({
            success: true,
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            totalClicks: url.clicks,
            createdAt: url.createdAt,
            clickHistory: url.clickHistory, // Might be large!
            clicksByDate
            // Flattening referrer/browser stats can also be done here
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete URL
// @route   DELETE /api/url/:id
// @access  Private
exports.deleteUrl = async (req, res) => {
    try {
        const url = await Url.findById(req.params.id);

        if (!url) {
            return res.status(404).json({ success: false, message: 'URL not found' });
        }

        if (url.userId && url.userId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Remove from Redis
        const redisClient = getRedisClient();
        if (redisClient && redisClient.isOpen) {
            await redisClient.del(url.shortCode);
        }

        await url.deleteOne();

        res.status(200).json({ success: true, message: 'URL deleted' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
