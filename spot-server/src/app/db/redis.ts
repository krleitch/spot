import { createClient } from 'redis';
// const redisPort = 6379;

const redisClient = createClient();
redisClient.connect();

export default redisClient;
