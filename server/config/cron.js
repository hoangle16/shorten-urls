const cron = require("node-cron");
const Link = require("../models/Link");
const redisClient = require("../config/redis");
const moment = require("moment");

const LOCK_KEY = "cronJobLock";
cron.schedule("*/15 * * * *", async () => {
  const lock = await redisClient.set(LOCK_KEY, "locked", { NX: true, EX: 60 });

  if (lock) {
    try {
      console.log(
        `${moment().format("YYYY-MM-DD HH:mm:ss")} Deleting expired link`
      );
      await checkExpiredLinks();
    } catch (error) {
      console.error(`Error deleting expired links: ${error.message}`);
    } finally {
      await redisClient.del(LOCK_KEY);
    }
  } else {
    console.log(
      "Another instance is already running the cron job. Skipping..."
    );
  }
});

const checkExpiredLinks = async () => {
  const links = await Link.find({ expiryDate: { $lte: new Date() } });

  for (const link of links) {
    await redisClient.del(`link:${link.shortUrl}`);
    await link.deleteOne();
  }
};

module.exports = cron;
