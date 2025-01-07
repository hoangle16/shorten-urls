const LinkStat = require("../models/LinkStat");
const { getCountryFromIP } = require("../helpers/utils");
const dayjs = require("dayjs");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);
const Link = require("../models/Link");
const { default: mongoose } = require("mongoose");

const createLinkStat = async (linkId, referrer, ip, os, browser) => {
  const country = getCountryFromIP(ip);

  const linkStat = new LinkStat({
    linkId,
    referrer,
    ip,
    os,
    browser,
    country,
  });
  await linkStat.save();
  return linkStat;
};

const getStatsByLinkId = async ({
  linkId,
  startDate,
  endDate,
  groupBy = "date",
}) => {
  const filters = { linkId };
  if (startDate && endDate) {
    filters.createdAt = {
      $gte: dayjs(startDate).startOf("day").toDate(),
      $lte: dayjs(endDate).endOf("day").toDate(),
    };
  }
  const validGroups = ["country", "os", "browser", "referrer", "date"];
  if (!validGroups.includes(groupBy)) {
    throw new Error("Invalid groupBy parameter");
  }

  const groupField =
    groupBy === "date"
      ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
      : `$${groupBy}`;

  const aggregationResult = await LinkStat.aggregate([
    { $match: filters },
    { $group: { _id: groupField, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  if (groupBy === "date") {
    return fillMissingDates(
      aggregationResult.map((item) => ({
        _id: item._id,
        totalClicks: item.count,
      })),
      startDate,
      endDate
    ).map(({ date, clicks }) => ({
      name: date,
      value: clicks,
    }));
  }

  return aggregationResult.map((item) => ({
    name: item._id,
    value: item.count,
  }));
};

const getStatListByLinkId = async ({
  linkId,
  os,
  browser,
  country,
  startDate,
  endDate,
  sortBy = "createdAt",
  sortOrder = "asc",
  page = 1,
  limit = 10,
  isAdminCall = false,
}) => {
  const startTime = startDate
    ? dayjs(startDate).startOf("day").toDate()
    : dayjs().subtract(15, "days").startOf("day").toDate();
  const endTime = endDate
    ? dayjs(endDate).endOf("day").toDate()
    : dayjs().endOf("day").toDate();

  page = Math.max(1, page);
  limit = Math.max(1, limit);

  const query = {
    linkId: new mongoose.Types.ObjectId(`${linkId}`),
    ...(os && { os: { $regex: os, $options: "i" } }),
    ...(browser && { browser: { $regex: browser, $options: "i" } }),
    ...(country && { country: { $regex: country, $options: "i" } }),
  };

  if (!isAdminCall) {
    query.createdAt = {
      $gte: startTime,
      $lte: endTime,
    };
  }
  console.log(query);
  const totalItems = await LinkStat.countDocuments(query);

  const totalPages = Math.ceil(totalItems / limit);

  const stats = await LinkStat.find(query)
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    stats,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
    },
  };
};

const getClickStatsByUser = async ({ userId, startDate, endDate }) => {
  const todayStart = dayjs().startOf("day").toDate();
  const todayEnd = dayjs().endOf("day").toDate();

  const timeFilters = {};
  if (startDate) {
    timeFilters.$gte = dayjs(startDate).startOf("day").toDate();
  }
  if (endDate) {
    timeFilters.$lte = dayjs(endDate).endOf("day").toDate();
  }

  const stats = await LinkStat.aggregate([
    {
      $lookup: {
        from: "links",
        localField: "linkId",
        foreignField: "_id",
        as: "linkDetails",
      },
    },
    { $unwind: "$linkDetails" },
    {
      $match: {
        "linkDetails.userId": userId,
        ...(Object.keys(timeFilters).length > 0 && {
          createdAt: timeFilters,
        }),
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalClicks: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const userStats = await Link.aggregate([
    {
      $match: {
        userId,
      },
    },
    {
      $facet: {
        totalLinks: [{ $count: "count" }],
        newLinksToday: [
          {
            $match: {
              createdAt: {
                $gte: todayStart,
                $lte: todayEnd,
              },
            },
          },
          { $count: "count" },
        ],
        totalClicks: [
          {
            $lookup: {
              from: "linkstats",
              localField: "_id",
              foreignField: "linkId",
              as: "clicks",
            },
          },
          { $unwind: "$clicks" },
          {
            $group: {
              _id: null,
              totalClicks: { $sum: 1 },
            },
          },
        ],
        newClicksToday: [
          {
            $lookup: {
              from: "linkstats",
              localField: "_id",
              foreignField: "linkId",
              as: "clicks",
            },
          },
          { $unwind: "$clicks" },
          {
            $match: {
              "clicks.createdAt": {
                $gte: todayStart,
                $lte: todayEnd,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalClicks: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const {
    totalLinks = [],
    newLinksToday = [],
    totalClicks = [],
    newClicksToday = [],
  } = userStats[0] || {};

  return {
    stats: fillMissingDates(stats, startDate, endDate),
    totalLinks: totalLinks[0]?.count || 0,
    newLinksToday: newLinksToday[0]?.count || 0,
    totalClicks: totalClicks[0]?.totalClicks || 0,
    newClicksToday: newClicksToday[0]?.totalClicks || 0,
  };
};

const getStatsByUser = async ({
  userId,
  os,
  browser,
  country,
  startDate,
  endDate,
  sortBy = "statCreatedAt",
  sortOrder = "asc",
  page = 1,
  limit = 10,
}) => {
  const startTime = startDate
    ? dayjs(startDate).startOf("day").toDate()
    : dayjs().subtract(15, "days").startOf("day").toDate();
  const endTime = endDate
    ? dayjs(endDate).endOf("day").toDate()
    : dayjs().endOf("day").toDate();

  page = Math.max(1, page);
  limit = Math.max(1, limit);

  const query = {
    userId: new mongoose.Types.ObjectId(`${userId}`),
    createdAt: {
      $gte: startTime,
      $lte: endTime,
    },
  };

  const sort = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const totalItems = await Link.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "linkstats",
        localField: "_id",
        foreignField: "linkId",
        as: "stats",
      },
    },
    { $unwind: "$stats" },
    {
      $match: {
        ...(os && { "stats.os": { $regex: os, $options: "i" } }),
        ...(browser && { "stats.browser": { $regex: browser, $options: "i" } }),
        ...(country && { "stats.country": { $regex: country, $options: "i" } }),
      },
    },
    {
      $count: "total",
    },
  ]).then((results) => (results.length > 0 ? results[0].total : 0));

  const totalPages = Math.ceil(totalItems / limit);

  const stats = await Link.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "linkstats",
        localField: "_id",
        foreignField: "linkId",
        as: "stats",
      },
    },
    {
      $unwind: "$stats",
    },
    {
      $match: {
        ...(os && { "stats.os": { $regex: os, $options: "i" } }),
        ...(browser && { "stats.browser": { $regex: browser, $options: "i" } }),
        ...(country && { "stats.country": { $regex: country, $options: "i" } }),
      },
    },
    {
      $project: {
        _id: -1,
        linkId: "$_id",
        originalUrl: 1,
        shortUrl: 1,
        password: 1,
        expiryDate: 1,
        createdAt: 1,
        userId: 1,
        statId: "$stats._id",
        ip: "$stats.ip",
        os: "$stats.os",
        browser: "$stats.browser",
        country: "$stats.country",
        referrer: "$stats.referrer",
        statCreatedAt: "$stats.createdAt",
      },
    },
    {
      $sort: sort,
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  return {
    stats,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
    },
  };
};

const deleteLinkStat = async (statId) => {
  const stat = await LinkStat.findByIdAndDelete(statId);
  return stat;
};

const deleteLinkStats = async (statIds) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await LinkStat.deleteMany({ _id: { $in: statIds } });
    await session.commitTransaction();

    return result;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const fillMissingDates = (stats, startDate, endDate) => {
  const start = startDate
    ? dayjs(startDate).startOf("day")
    : dayjs().subtract(1, "month").startOf("day");
  const end = endDate ? dayjs(endDate).endOf("day") : dayjs().endOf("day");
  const allDates = [];
  let currentDate = start.clone();
  while (currentDate.isSameOrBefore(end)) {
    allDates.push(currentDate.format("YYYY-MM-DD"));
    currentDate = currentDate.add(1, "day");
  }

  const statsMap = stats.reduce((acc, item) => {
    acc[item._id] = item.totalClicks;
    return acc;
  }, {});
  console.log("startMap", statsMap);
  return allDates.map((date) => ({
    date: date,
    clicks: statsMap[date] || 0,
  }));
};

module.exports = {
  createLinkStat,
  getStatsByLinkId,
  getStatListByLinkId,
  getClickStatsByUser,
  getStatsByUser,
  deleteLinkStat,
  deleteLinkStats,
};
