import redis from "redis";

let redisClient = null;

const connectRedis = async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => {
    console.log("Error occured while connecting to Redis", error);
  });

  redisClient.on("connect", () => {
    console.log("Redis connected successfully");
  });

  await redisClient.connect();
};

export { redisClient, connectRedis };