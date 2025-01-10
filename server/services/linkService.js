const Link = require("../models/Link");
const Domain = require("../models/Domain");
const { CustomError } = require("../helpers/utils");
const mongoose = require("mongoose");
const { linkSortKey } = require("../consts/consts");
const LinkStat = require("../models/LinkStat");
const dayjs = require("dayjs");
const Report = require("../models/Report");

const generateShortUrl = (domain) => {
  return `${domain}/${Math.random().toString(36).substring(2, 8)}`;
};

const getLinks = async ({
  search,
  hasPassword,
  isExpired,
  isDisabled,
  createdBy,
  sortBy = "createdAt",
  sortOrder = "asc",
  page,
  limit,
}) => {
  if (sortBy && !linkSortKey.includes(sortBy)) {
    throw new CustomError(
      `Invalid sort property. Sort property must in ${userSortKey.toString()}`,
      400
    );
  }

  const query = {};
  if (search) {
    query.$or = [
      { originalUrl: { $regex: search, $options: "i" } },
      { shortUrl: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (hasPassword !== undefined && hasPassword !== null) {
    if (hasPassword) {
      query.password = { $nin: [null, ""] };
    } else {
      query.password = { $in: [null, ""] };
    }
  }

  if (isExpired !== undefined && isExpired !== null) {
    const currentDate = new Date();
    if (isExpired) {
      query.expiryDate = { $lt: currentDate };
    } else {
      query.$or = [{ expiryDate: { $gt: currentDate } }, { expiryDate: null }];
    }
  }

  if (isDisabled !== undefined && isDisabled !== null) {
    query.isDisabled = isDisabled;
  }

  if (createdBy) {
    query.userId = new mongoose.Types.ObjectId(`${createdBy}`);
  }
  console.log(query);

  const sortField = sortBy;
  const sortOrderValue = sortOrder === "asc" ? 1 : -1;

  const links = await Link.aggregate([
    { $match: query },
    {
      $addFields: {
        sortFieldForSort:
          sortField === "expiryDate"
            ? { $ifNull: ["$expiryDate", new Date(9999, 11, 31)] }
            : `$${sortField}`,
      },
    },
    {
      $sort: {
        sortFieldForSort: sortOrderValue,
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $addFields: { createdBy: { $arrayElemAt: ["$userDetails.username", 0] } },
    },
    {
      $project: {
        sortFieldForSort: 0,
        userDetails: 0,
      },
    },
  ]);

  const totalItems = await Link.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    links,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
    },
  };
};

const getLinksByUserId = async ({
  userId,
  search,
  isExpired,
  hasPassword,
  isDisabled,
  sortBy = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 10,
}) => {
  const query = { userId: new mongoose.Types.ObjectId(`${userId}`) };
  if (search) {
    query.$or = [
      { originalUrl: { $regex: search, $options: "i" } },
      { shortUrl: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (isExpired !== undefined) {
    const currentDate = new Date();
    if (isExpired) {
      query.expiryDate = { $lt: currentDate };
    } else {
      query.$or = [{ expiryDate: { $gt: currentDate } }, { expiryDate: null }];
    }
  }

  if (hasPassword != undefined) {
    if (hasPassword) {
      query.password = { $nin: [null, ""] };
    } else {
      query.password = { $in: [null, ""] };
    }
  }

  if (isDisabled !== undefined && isDisabled !== null) {
    query.isDisabled = isDisabled;
  }

  const skip = (page - 1) * limit;

  const sort = {
    [sortBy]: sortOrder === "desc" ? -1 : 1,
  };

  const links = await Link.aggregate([
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
      $addFields: {
        clicks: { $size: "$stats" },
      },
    },
    {
      $unset: "stats",
    },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await Link.countDocuments(query);

  const totalPages = Math.ceil(total / limit);

  return {
    links,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      limit,
    },
  };
};

const getLinkByShortUrl = async (shortUrl) => {
  if (shortUrl.endsWith("/")) {
    shortUrl = shortUrl.slice(0, -1);
  }

  const link = await Link.findOne({ shortUrl });
  if (!link) {
    throw new CustomError("Link not found", 404);
  }

  if (link.isDisabled) {
    throw new CustomError("Link has disabled", 400);
  }

  return link;
};

const getLinkById = async (linkId) => {
  const link = await Link.findById(linkId)
    .populate({
      path: "userId",
      select: "username",
    })
    .lean();

  if (!link) {
    throw new CustomError("Link not found", 404);
  }
  const startDay = dayjs().startOf("date").toDate();
  const endDay = dayjs().endOf("date").toDate();
  const result = await LinkStat.aggregate([
    {
      $facet: {
        totalStats: [{ $match: { linkId: link._id } }, { $count: "total" }],
        statsToday: [
          {
            $match: {
              linkId: link._id,
              createdAt: { $gte: startDay, $lte: endDay },
            },
          },
          { $count: "totalToday" },
        ],
      },
    },
  ]);
  const totalStats = result[0]?.totalStats[0]?.total || 0;
  const statsToday = result[0]?.statsToday[0]?.totalToday || 0;
  const transformedLink = {
    ...link,
    createdBy: link.userId?.username,
    userId: link.userId?._id,
  };
  return {
    link: transformedLink,
    stats: {
      totalClicks: totalStats,
      newClicksToday: statsToday,
    },
  };
};

const createLink = async (
  originalUrl,
  customAddress = null,
  password = null,
  expiryDate = null,
  description = null,
  userId = null,
  domainId
) => {
  const domain = await Domain.findById(domainId);
  if (!domain) {
    throw new CustomError("Invalid domain ID", 400);
  }

  let shortUrl = `${domain.domain}/${customAddress}`;
  if (!customAddress) {
    let isUnique = false;
    while (!isUnique) {
      shortUrl = generateShortUrl(domain.domain);
      const existingLink = await Link.findOne({ shortUrl });
      if (!existingLink) {
        isUnique = true;
      }
    }
  } else {
    const existingLink = await Link.findOne({
      shortUrl: shortUrl,
    });
    if (existingLink) {
      throw new CustomError("Custom address already in use", 400);
    }
  }

  // const expiry = expiryDate || new Date(Date.now() + 3600000 * 24 * 30);

  const link = new Link({
    originalUrl,
    shortUrl,
    password,
    expiryDate,
    description,
    userId,
    domainId,
  });

  await link.save();

  return link;
};

const updateLink = async ({
  linkId,
  customAddress = null,
  password = null,
  expiryDate = null,
  description = null,
  domainId,
}) => {
  const domain = await Domain.findById(domainId);
  if (!domain) {
    throw new CustomError("Invalid domain ID", 400);
  }

  const link = await Link.findById(linkId);
  if (!link) {
    throw new CustomError("Link not found", 404);
  }

  if (link.domainId !== domainId || customAddress) {
    let shortUrl = `${domain.domain}/${customAddress}`;
    if (!customAddress) {
      let isUnique = false;
      while (!isUnique) {
        shortUrl = generateShortUrl(domain.domain);
        const existingLink = await Link.findOne({ shortUrl });
        if (!existingLink) {
          isUnique = true;
        }
      }
    } else {
      const existingLink = await Link.findOne({
        shortUrl: shortUrl,
      });
      if (existingLink) {
        throw new CustomError("Custom address already in use", 400);
      }
    }

    link.shortUrl = shortUrl;
  }

  link.password = password;
  link.expiryDate = expiryDate;
  link.description = description;
  link.domainId = domainId;

  await link.save();

  return link;
};

const deleteLink = async (linkId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const link = await Link.findById(linkId).session(session);
    if (!link) throw new CustomError("Link not found", 404);

    await Promise.all([
      LinkStat.deleteMany({ linkId }).session(session),
      Report.deleteMany({ linkId }).session(session),
      link.deleteOne().session(session),
    ]);

    await session.commitTransaction();
    return link;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const deleteLinks = async (linkIds) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const links = await Link.find({ _id: { $in: linkIds } }).session(session);

    if (links.length !== linkIds.length) {
      const foundIds = links.map((link) => link._id.toString());
      const missingIds = linkIds.filter(
        (id) => !foundIds.includes(id.toString())
      );
      throw new CustomError(
        `Some links not found: ${missingIds.join(", ")}`,
        404
      );
    }

    await Promise.all([
      LinkStat.deleteMany({ linkId: { $in: linkIds } }).session(session),
      Report.deleteMany({ linkId: { $in: linkIds } }).session(session),
      Link.deleteMany({ _id: { $in: linkIds } }).session(session),
    ]);

    await session.commitTransaction();
    return links;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const updateLinkStatus = async (linkId, isDisabled, message) => {
  const link = await Link.findById(linkId);

  if (!link) {
    throw new CustomError("Link not found", 404);
  }

  link.isDisabled = isDisabled;
  await link.save();

  // TODO: send a notification to user (link.userId)
  // notifyUser(link.userId, updatedStatus, message);

  return {
    link,
    status: isDisabled ? "disabled" : "enabled",
  };
};

module.exports = {
  getLinks,
  getLinksByUserId,
  getLinkByShortUrl,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
  deleteLinks,
  updateLinkStatus,
};
