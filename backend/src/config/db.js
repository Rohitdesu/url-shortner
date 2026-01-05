const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            console.log('MongoDB already connected');
            return;
        }

        if (cachedPromise) {
            await cachedPromise;
            return;
        }

        cachedPromise = mongoose.connect(process.env.MONGO_URI);

        const conn = await cachedPromise;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        cachedPromise = null;
    }
};

module.exports = connectDB;
