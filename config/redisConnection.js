import redis from "redis";

let redisClient = null;

const connectRedis = async () => {
  redisClient = redis.createClient({
    password: process.env.REDIS_DB_PASS,
    socket: {
      host: process.env.REDIS_DB_HOST,
      port: process.env.REDIS_DB_PORT,
    },
  });

  redisClient.on("error", (error) => {
    console.log("Error occured while connecting to Redis", error);
  });

  redisClient.on("connect", () => {
    console.log(
      `Redis connected successfully to PORT ${process.env.REDIS_DB_PORT} [HOST - ${process.env.REDIS_DB_HOST}]`
    );
  });

  await redisClient.connect();
};

export { redisClient, connectRedis };