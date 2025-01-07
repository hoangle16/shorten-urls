const redis = require("redis");

const client = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

client.connect();

client.on("connect", () => {
  console.log("Connection to redis");
});

client.on("error", (err) => {
  console.error(`Error connecting to redis: ${err}`);
});

client.on("end", () => {
  console.log("Redis connection closed");
});

client.on("reconnecting", () => {
  console.log("Reconnecting to Redis...");
});

process.on("SIGINT", async () => {
  await client.disconnect();
  console.log("Disconnected from Redis");
  process.exit(0);
});

module.exports = client;
