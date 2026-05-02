import Redis from "ioredis";

// create a Redis connection
const redis = new Redis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
});

redis.on("connect", () => {
    console.log("Connected to Redis ✅");
});

redis.on("error", (error) => {
    console.error("Redis connection error:", error);
});

export default redis;