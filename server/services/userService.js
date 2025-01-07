const User = require("../models/User");
const Link = require("../models/Link");
const LinkStat = require("../models/LinkStat");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { CustomError } = require("../helpers/utils");
const { roles, userSortKey } = require("../consts/consts");
const dayjs = require("dayjs");

const getUsers = async ({
  search,
  isVerify,
  role,
  sortBy = "createdAt",
  sortOrder = "asc",
  page,
  limit,
  currentAdminId,
}) => {
  if (role && !Object.values(roles).includes(role)) {
    throw new CustomError("Invalid role", 400);
  }

  if (sortBy && !userSortKey.includes(sortBy)) {
    throw new CustomError(
      `Invalid sort property. Sort property must in ${userSortKey.toString()}`,
      400
    );
  }
  const query = {
    _id: { $ne: new mongoose.Types.ObjectId(`${currentAdminId}`) },
  };
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
    ];
  }

  if (isVerify !== undefined && isVerify !== null) {
    query.isVerify = isVerify;
  }

  if (role) {
    query.role = role;
  }

  const sortOption = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const users = await User.find(query)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit);

  const totalItems = await User.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
    },
  };
};

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new CustomError("User not found", 404);

  const todayStart = dayjs().startOf("day").toDate();
  const todayEnd = dayjs().endOf("day").toDate();
  const userStats = await Link.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(`${userId}`),
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
          {
            $unwind: "$clicks",
          },
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
    user,
    stats: {
      totalLinks: totalLinks[0]?.count || 0,
      newLinksToday: newLinksToday[0]?.count || 0,
      totalClicks: totalClicks[0]?.totalClicks || 0,
      newClicksToday: newClicksToday[0]?.totalClicks || 0,
    },
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new CustomError("User not found", 404);
  return user;
};

const updateUser = async (userId, user) => {
  const updatedUser = await User.findByIdAndUpdate(userId, user, { new: true });
  if (!updatedUser) throw new CustomError("User not found", 404);
  return updatedUser;
};

const deleteUser = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);
    if (!user) throw new CustomError("User not found", 404);

    const links = await Link.find({ userId }).session(session);
    const linkIds = links.map((link) => link._id);

    await Promise.all([
      LinkStat.deleteMany({ linkId: { $in: linkIds } }).session(session),
      Link.deleteMany({ userId }).session(session),
      user.deleteOne().session(session),
    ]);

    await session.commitTransaction();
    return user;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const deleteUsers = async (userIds) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const users = await User.find({ _id: { $in: userIds } }).session(session);

    if (users.length !== userIds.length) {
      const foundIds = users.map((user) => user._id.toString());
      const missingIds = userIds.filter(
        (id) => !foundIds.includes(id.toString())
      );
      throw new CustomError(
        `Some users not found: ${missingIds.join(", ")}`,
        404
      );
    }

    const links = await Link.find({ userId: { $in: userIds } }).session(
      session
    );
    const linkIds = links.map((link) => link._id);

    await Promise.all([
      LinkStat.deleteMany({ linkId: { $in: linkIds } }).session(session),
      Link.deleteMany({ userId: { $in: userIds } }).session(session),
      User.deleteMany({ _id: { $in: userIds } }).session(session),
    ]);

    await session.commitTransaction();
    return users;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const verifyEmail = async (token) =>
  await User.findOneAndUpdate(
    { verificationToken: token },
    { verificationToken: null, isVerify: true },
    { new: true }
  );

const saveToken = async (key, token) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key);
  const filter = isEmail
    ? { email: key }
    : mongoose.Types.ObjectId.isValid(key)
    ? { _id: key }
    : { username: key };
  return await User.findOneAndUpdate(
    filter,
    { verificationToken: token },
    { new: true }
  );
};

const verifyToken = async (token) => {
  const user = await User.findOne({ verificationToken: token }).select(
    "+verificationToken"
  );
  if (!user) throw new CustomError("Invalid token", 400);
  return user;
};

const hashPassword = async (password) => await bcrypt.hash(password, 10);

const resetPassword = async (token, password) => {
  const hashedPassword = await hashPassword(password);
  const user = await User.findOneAndUpdate(
    { verificationToken: token },
    { password: hashedPassword, verificationToken: null },
    { new: true }
  );
  if (!user) throw new CustomError("Invalid token", 400);
  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new CustomError("User not found", 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new CustomError("Invalid current password", 400);

  const hashedPassword = await hashPassword(newPassword);
  return await User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { new: true }
  );
};

module.exports = {
  getUsers,
  getUser,
  getProfile,
  updateUser,
  deleteUser,
  deleteUsers,
  verifyEmail,
  saveToken,
  verifyToken,
  resetPassword,
  changePassword,
};
