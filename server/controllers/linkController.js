const linkService = require("../services/linkService");
const redisClient = require("../config/redis");
const { roles } = require("../consts/consts");
const {
  cacheGetOrSet,
  checkLinkExpiry,
  generateShortLink,
  extractShortCode,
  updateCacheAfterModification,
  updateCacheAfterDeleteMany,
} = require("../helpers/utils");
const asyncHandler = require("express-async-handler");
const { CustomError } = require("../helpers/utils");
const uap = require("ua-parser-js");
const linkStatService = require("../services/linkStatService");
const { default: mongoose } = require("mongoose");

const getLinks = asyncHandler(async (req, res) => {
  const {
    search,
    hasPassword,
    isExpired,
    isDisabled,
    createdBy,
    sortBy,
    sortOrder,
    page = 1,
    limit = 10,
  } = req.query;
  // const links = await cacheGetOrSet("links", linkService.getLinks);
  const links = await linkService.getLinks({
    search,
    hasPassword,
    isExpired,
    isDisabled,
    createdBy,
    sortBy,
    sortOrder,
    page,
    limit,
  });
  return res.json(links);
});

const getLinksByUserId = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  if (req.user.role !== roles.admin && req.user.id !== userId) {
    throw new CustomError("Forbidden", 403);
  }

  const { search, isExpired, hasPassword, sortBy, sortOrder, page, limit } =
    req.query;

  // const cacheKey = `link:${userId}-${search}-${isExpired}-${hasPassword}-${sortBy}-${sortOrder}-${page}-${limit}`;
  // TODO: fixed catch method
  // const links = await cacheGetOrSet(cacheKey, () =>
  //   linkService.getLinksByUserId({
  //     userId,
  //     search,
  //     isExpired,
  //     hasPassword,
  //     sortBy,
  //     sortOrder,
  //     page,
  //     limit,
  //   })
  // );

  const links = await linkService.getLinksByUserId({
    userId,
    search,
    isExpired,
    hasPassword,
    sortBy,
    sortOrder,
    page,
    limit,
  });
  return res.json(links);
});

const getLinkByShortUrl = asyncHandler(async (req, res) => {
  const ua = uap(req.headers["user-agent"]);
  const referrer = req.headers["referer"] ?? "Direct";
  const ip = req.ip;
  const os = ua.os.name;
  const browser = ua.browser.name;

  const shortUrl = generateShortLink(req);

  const cacheKey = `link:${shortUrl}`;
  let link = await cacheGetOrSet(cacheKey, () =>
    linkService.getLinkByShortUrl(shortUrl)
  );

  if (await checkLinkExpiry(link, cacheKey)) {
    throw new CustomError("Link has expired", 410);
  }

  // save link stat
  await linkStatService.createLinkStat(link._id, referrer, ip, os, browser);

  const shortCode = extractShortCode(link.shortUrl);

  link.password
    ? res.redirect(`${process.env.CLIENT_URL}/${shortCode}/protected`)
    : res.redirect(link.originalUrl);
});

const getProtectedLinkByShortUrl = asyncHandler(async (req, res) => {
  let shortUrl = generateShortLink(req);

  const cacheKey = `link:${shortUrl}`;
  let link = await cacheGetOrSet(cacheKey, () =>
    linkService.getLinkByShortUrl(shortUrl)
  );

  if (await checkLinkExpiry(link, cacheKey)) {
    throw new CustomError("Link has expired", 410);
  }

  if (link?.password !== req.body.password?.toString()) {
    throw new CustomError("Invalid password", 403);
  }
  res.json({ redirectUrl: link.originalUrl });
});

const getLinkById = asyncHandler(async (req, res) => {
  // const cacheKey = `link:${req.params.linkId}`;
  // const link = await cacheGetOrSet(cacheKey, () =>
  //   linkService.getLinkById(req.params.linkId)
  // );
  const link = await linkService.getLinkById(req.params.linkId);

  if (!link) {
    throw new CustomError("Link not found", 404);
  }
  res.json(link);
});

const createLink = asyncHandler(async (req, res) => {
  const {
    originalUrl,
    customAddress,
    password,
    expiryDate,
    description,
    domainId,
  } = req.body;
  const userId = req.user?.id || null;
  const newLink = await linkService.createLink(
    originalUrl,
    customAddress,
    password,
    expiryDate,
    description,
    userId,
    domainId
  );
  await redisClient.set(`link:${newLink.id}`, JSON.stringify(newLink));
  res.status(201).json(newLink);
});

const updateLink = asyncHandler(async (req, res) => {
  const linkId = new mongoose.Types.ObjectId(req.params.linkId);
  const { customAddress, password, expiryDate, description, domainId } =
    req.body;

  const cacheKey = `link:${req.params.linkId}`;
  const updatedLink = await updateCacheAfterModification(cacheKey, () =>
    linkService.updateLink({
      linkId,
      customAddress,
      password,
      expiryDate,
      description,
      domainId,
    })
  );

  return res.json(updatedLink);
});

const deleteLink = asyncHandler(async (req, res) => {
  const deletedLink = await linkService.deleteLink(req.params.linkId);
  if (!deletedLink) {
    throw new CustomError("Link not found", 404);
  }
  await redisClient.del(`link:${deletedLink.id}`);
  res.status(204).send();
});

const deleteLinks = asyncHandler(async (req, res) => {
  const { linkIds } = req.body;

  if (!Array.isArray(linkIds) || linkIds.length === 0) {
    throw new CustomError(
      "Invalid input: linkIds must be a non-empty array",
      400
    );
  }

  if (linkIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new CustomError("Invalid linkId format in the array", 400);
  }

  const cachedKeys = linkIds.map((id) => `link:${id}`);
  await updateCacheAfterDeleteMany(cachedKeys, () =>
    linkService.deleteLinks(linkIds)
  );

  res.json({ message: "Links deleted successfully" });
});

const updateLinkStatus = asyncHandler(async (req, res) => {
  const { linkId } = req.params;
  const { isDisabled, message } = req.body;
  const updatedLink = await linkService.updateLinkStatus(
    linkId,
    isDisabled,
    message
  );

  return res.json(updatedLink);
});

module.exports = {
  getLinks,
  getLinksByUserId,
  getLinkByShortUrl,
  getProtectedLinkByShortUrl,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
  deleteLinks,
  updateLinkStatus,
};
