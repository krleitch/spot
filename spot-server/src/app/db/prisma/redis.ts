
import { createClient } from 'redis';
// const redisPort = 6379;

// todo fix this, and move this
const redisClient = createClient();
redisClient.connect();

export default redisClient;