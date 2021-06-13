const redis = require('redis');
const redisPort = 6379;

const redisClient = redis.createClient(redisPort);

module.exports = redisClient;
