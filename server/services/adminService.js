const { Model } = require("mongoose");
const { CustomError } = require("../helpers/utils");
const Domain = require("../models/Domain");
const Link = require("../models/Link");
const LinkStat = require("../models/LinkStat");
const User = require("../models/User");
const dayjs = require("dayjs");
const weekOfYear = require("dayjs/plugin/weekOfYear");
const StreamTransport = require("nodemailer/lib/stream-transport");
dayjs.extend(weekOfYear);

const getAdminDashboardOverview = async () => {
  const currentDate = dayjs().startOf("day");

  const [totalDomains, todayDomains] = await Promise.all([
    Domain.countDocuments(),
    Domain.countDocuments({ createdAt: { $gte: currentDate } }),
  ]);

  const [totalLinks, todayLinks] = await Promise.all([
    Link.countDocuments(),
    Link.countDocuments({ createdAt: { $gte: currentDate } }),
  ]);

  const [totalClicks, todayClicks] = await Promise.all([
    LinkStat.countDocuments(),
    LinkStat.countDocuments({ createdAt: { $gte: currentDate } }),
  ]);

  const [totalUsers, todayUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: currentDate } }),
  ]);

  return {
    domains: {
      total: totalDomains,
      today: todayDomains,
    },
    links: {
      total: totalLinks,
      today: todayLinks,
    },
    clicks: {
      total: totalClicks,
      today: todayClicks,
    },
    users: {
      total: totalUsers,
      today: todayUsers,
    },
  };
};

const getAdminDashboardChart = async ({
  range = "day",
  startDate,
  endDate,
}) => {
  if (!["day", "week", "month"].includes(range)) {
    throw new CustomError("Invalid range. Use 'day', 'week', or 'month'.");
  }

  const now = dayjs();
  if (!startDate) {
    startDate =
      range === "day"
        ? now.subtract(6, "day").startOf("day")
        : range === "week"
        ? now.subtract(3, "week").startOf("week")
        : now.subtract(2, "month").startOf("month");
  }

  if (!endDate) {
    endDate = now.endOf("day");
  }

  const start = dayjs(startDate).startOf(range);
  const end = dayjs(endDate).endOf(range);

  if (!start.isValid() || !end.isValid()) {
    throw new CustomError("Invalid startDate or ennDate.");
  }

  const groupFormat =
    range === "day"
      ? {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        }
      : range === "week"
      ? { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } }
      : { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };

  const getGrowthData = async (model) => {
    return model.aggregate([
      { $match: { createdAt: { $gte: start.toDate(), $lte: end.toDate() } } },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          ...(range === "day" && { "_id.day": 1 }),
          ...(range === "week" && { "_id.week": 1 }),
        },
      },
    ]);
  };

  const [domains, links, users, clicks] = await Promise.all([
    getGrowthData(Domain),
    getGrowthData(Link),
    getGrowthData(User),
    getGrowthData(LinkStat),
  ]);

  const formatData = (data) =>
    data.map((item) => ({
      date:
        range === "day"
          ? dayjs()
              .year(item._id.year)
              .month(item._id.month - 1)
              .date(item._id.day)
              .format("YYYY-MM-DD")
          : range === "week"
          ? `Week ${item._id.week}, ${item._id.year}`
          : dayjs()
              .year(item._id.year)
              .month(item._id.month - 1)
              .format("YYYY-MM"),
      count: item.count,
    }));

  const filledDomains = fillMissingDates({
    data: formatData(domains),
    startDate,
    endDate,
    range,
  });

  const filledLinks = fillMissingDates({
    data: formatData(links),
    startDate,
    endDate,
    range,
  });

  const filledUsers = fillMissingDates({
    data: formatData(users),
    startDate,
    endDate,
    range,
  });

  const filledClicks = fillMissingDates({
    data: formatData(clicks),
    startDate,
    endDate,
    range,
  });

  return {
    links: filledLinks,
    clicks: filledClicks,
    users: filledUsers,
    domains: filledDomains
  };
};

const fillMissingDates = ({ data, startDate, endDate, range = "day" }) => {
  const filledData = [];
  const start = dayjs(startDate).startOf(range);
  const end = dayjs(endDate).endOf(range);

  let current = start;

  while (current.isBefore(end) || current.isSame(end)) {
    const formattedDate =
      range === "day"
        ? current.format("YYYY-MM-DD")
        : range === "week"
        ? `Week ${current.week()}, ${current.year()}`
        : current.format("YYYY-MM");
    const existingEntry = data.find((item) => item.date === formattedDate);

    filledData.push({
      date: formattedDate,
      count: existingEntry ? existingEntry.count : 0,
    });

    current = current.add(1, range);
  }

  return filledData;
};

module.exports = {
  getAdminDashboardOverview,
  getAdminDashboardChart,
};
