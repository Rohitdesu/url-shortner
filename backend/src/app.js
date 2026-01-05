const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to Databases
connectDB();
connectRedis();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'URL Shortener API is running' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/url', require('./routes/urlRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));

// Redirect Route (Root level)
const { redirectUrl } = require('./controllers/urlController');
app.get('/:shortCode', redirectUrl);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

// Only listen if run directly (development or standalone server), not when imported by Vercel
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
