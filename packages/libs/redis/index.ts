import Redis from "ioredis";
//connect
const redis = new Redis(process.env.REDIS_URL!);

export default redis;
