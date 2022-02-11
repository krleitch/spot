import { createClient } from 'redis';
const redisPort = 6379;

const redisClient = createClient(redisPort);

export default redisClient;
