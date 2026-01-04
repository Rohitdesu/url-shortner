const redis = require('redis');

let redisClient;

const connectRedis = async () => {
    try {
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
    }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
