const redis = require('redis');

let redisClient;

const connectRedis = async () => {
    try {
        if (!process.env.REDIS_URL) {
            console.log('REDIS_URL not found, skipping Redis connection');
            return;
        }

        redisClient = redis.createClient({
            url: process.env.REDIS_URL
        });

        redisClient.on('error', (err) => console.log('Redis Client Error', err));
        redisClient.on('connect', () => console.log('Redis Client Connected'));

        await redisClient.connect();
    } catch (error) {
        console.error(`Redis Connection Error: ${error.message}`);
        // We might not want to exit process on Redis failure depending on requirements,
        // but for now we log it. The app can technically run without cache but with degraded perf.
        redisClient = null;
    }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
