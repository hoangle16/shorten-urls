const { default: mongoose } = require("mongoose");
const linkStatService = require("../services/linkStatService");
const asyncHandler = require("express-async-handler");
const {
  CustomError,
  UpdateCacheAfterDelete,
  updateCacheAfterDeleteMany,
} = require("../helpers/utils");
const redisClient = require("../config/redis");
const { roles } = require("../consts/consts");

const getStatsByLinkId = asyncHandler(async (req, res) => {
  const linkId = new mongoose.Types.ObjectId(req.params.linkId);
  const { startDate, endDate, groupBy } = req.query;

  const linkStats = await linkStatService.getStatsByLinkId({
    linkId,
    startDate,
    endDate,
    groupBy,
  });

  return res.json(linkStats);
});

const getStatListByLinkId = asyncHandler(async (req, res) => {
  const { linkId } = req.params;
  const role = req.user.role;
  const {
    os,
    browser,
    country,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    page,
    limit,
  } = req.query;

  const stats = await linkStatService.getStatListByLinkId({
    linkId,
    os,
    browser,
    country,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    page,
    limit,
    isAdminCall: role === roles.admin,
  });

  return res.json(stats);
});

const getClickStatsByUser = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(`${req.user?.id}`);
  const { startDate, endDate } = req.query;
  const stats = await linkStatService.getClickStatsByUser({
    userId,
    startDate,
    endDate,
  });

  return res.json(stats);
});

const getStatsByUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    os,
    browser,
    country,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    page,
    limit,
  } = req.query;
  const stats = await linkStatService.getStatsByUser({
    userId,
    os,
    browser,
    country,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  return res.json(stats);
});

const deleteLinkStat = asyncHandler(async (req, res) => {
  const { statId } = req.params;

  const cachedKey = `stat:${statId}`;
  await UpdateCacheAfterDelete(cachedKey, () =>
    linkStatService.deleteLinkStat(statId)
  );

  return res.json({ message: "Stat deleted successfully" });
});

const deleteLinkStats = asyncHandler(async (req, res) => {
  const { statIds } = req.body;
  console.log(statIds);

  if (!Array.isArray(statIds) || statIds.length === 0) {
    throw new CustomError(
      "Invalid input: statsId must be a non-empty array",
      400
    );
  }

  if (statIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new CustomError("Invalid statId format in the array", 400);
  }

  const cachedKeys = statIds.map((id) => `stat:${id}`);
  await updateCacheAfterDeleteMany(cachedKeys, () =>
    linkStatService.deleteLinkStats(statIds)
  );

  res.json({ message: "Stats deleted successfully" });
});

module.exports = {
  getStatsByLinkId,
  getStatListByLinkId,
  getClickStatsByUser,
  getStatsByUser,
  deleteLinkStat,
  deleteLinkStats,
};
