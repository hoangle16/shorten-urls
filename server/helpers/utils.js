const redisClient = require("../config/redis");
const crypto = require("crypto");
const geoip = require("geoip-lite");
const { default: mongoose } = require("mongoose");

/**
 *
 * @param {string} key
 * @param {function} fetchFunc
 * @returns
 */
const cacheGetOrSet = async (key, fetchFunc) => {
  const cached = await redisClient.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetchFunc();
  await redisClient.set(key, JSON.stringify(data), { EX: 60 * 5 });
  return data;
};

/**
 * @param {string} key - token or userId
 */
const setBlacklistToken = async (key) => {
  const cacheKey = mongoose.isObjectIdOrHexString(key)
    ? `blacklist:userId:${key}`
    : `blacklist:token:${key}`;
  await redisClient.set(cacheKey, "banned", { EX: 60 * 15 });
};

/**
 * @param {string} key - token or userId
 */
const removeBlacklistToken = async (key) => {
  const cacheKey = mongoose.isObjectIdOrHexString(key)
    ? `blacklist:userId:${key}`
    : `blacklist:token:${key}`;
  await redisClient.del(cacheKey);
};

/**
 * @param {string} key - token or userId
 * @returns true if the key is blacklisted, otherwise false
 */
const isTokenBlacklisted = async (key) => {
  const cacheKey = mongoose.isObjectIdOrHexString(key)
    ? `blacklist:userId:${key}`
    : `blacklist:token:${key}`;
  const isBanned = await redisClient.get(cacheKey);
  return isBanned === "banned";
};

/**
 *
 * @param {string} key
 * @param {function} UpdateFunc
 * @returns
 */
const updateCacheAfterModification = async (key, UpdateFunc) => {
  await redisClient.del(key);
  const data = await UpdateFunc();
  await redisClient.set(key, JSON.stringify(data), { EX: 60 * 5 });
  return data;
};

/**
 *
 * @param {string} key
 * @param {function} deleteFunc
 * @returns
 */
const UpdateCacheAfterDelete = async (key, deleteFunc) => {
  const data = await deleteFunc();
  await redisClient.del(key);
  return data;
};

const updateCacheAfterDeleteMany = async (keys, deleteFunc) => {
  for (const key of keys) {
    await redisClient.del(key);
  }
  const data = await deleteFunc();
  return data;
};

/**
 *
 * @param {Object} link
 * @param {string} key
 */
const checkLinkExpiry = async (link, key) => {
  if (link.expiryDate && Date.now() > new Date(link.expiryDate).getTime()) {
    await redisClient.del(key);
    return true;
  }
  return false;
};

const generateShortLink = (req) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const baseUrl = fullUrl.match(/^(https?:\/\/[^\/]+\/[^\/]+)/)[0];
  return baseUrl;
};

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

class CustomError extends Error {
  constructor(message, statusCode, extraData = null) {
    super(message);
    this.statusCode = statusCode;
    this.extraData = extraData;
  }
}

const getCountryFromIP = (ip) => {
  const geo = geoip.lookup(ip);
  return geo ? geo.country : "Unknown";
};

const extractShortCode = (url) => {
  try {
    let cleanUrl = url.replace(/^(https?:)?\/\//, "");
    const parts = cleanUrl.split("/");
    return parts.length > 1 ? parts[1] : "Unknown";
  } catch (err) {
    throw new CustomError("Invalid URL: " + url, 400);
  }
};

module.exports = {
  cacheGetOrSet,
  setBlacklistToken,
  removeBlacklistToken,
  isTokenBlacklisted,
  updateCacheAfterModification,
  checkLinkExpiry,
  generateShortLink,
  generateVerificationToken,
  CustomError,
  getCountryFromIP,
  extractShortCode,
  UpdateCacheAfterDelete,
  updateCacheAfterDeleteMany,
};
