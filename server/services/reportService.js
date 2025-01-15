const { default: mongoose } = require("mongoose");
const { CustomError } = require("../helpers/utils");
const Link = require("../models/Link");
const Report = require("../models/Report");
const { updateLinkStatus } = require("./linkService");
const socketService = require("../config/socket");

// TODO: save email of the reporter
const createReport = async ({
  linkId,
  shortUrl,
  type,
  description,
  reportedBy = null,
}) => {
  const link = await Link.findOne({ $or: [{ _id: linkId }, { shortUrl }] });
  if (!link) {
    throw new CustomError("Link not found");
  }

  const report = new Report({
    linkId: link._id,
    type,
    description,
    reportedBy,
    status: "pending",
  });

  await report.save();
  return report;
};

const getReports = async ({
  search,
  status,
  type,
  sortBy = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 10,
}) => {
  const query = {};

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { "link.shortUrl": { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    query.status = status;
  }

  if (type) {
    query.type = type;
  }

  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.aggregate([
      {
        $lookup: {
          from: "links",
          localField: "linkId",
          foreignField: "_id",
          as: "link",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reportedBy",
          foreignField: "_id",
          as: "reporter",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "resolvedBy",
          foreignField: "_id",
          as: "resolver",
        },
      },
      {
        $addFields: {
          link: { $arrayElemAt: ["$link", 0] },
          reportedBy: { $arrayElemAt: ["$reporter.username", 0] },
          resolvedBy: { $arrayElemAt: ["$resolver.username", 0] },
        },
      },
      { $match: query },
      {
        $project: {
          reporter: 0,
          resolver: 0,
        },
      },
      { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
      { $skip: skip },
      { $limit: limit },
    ]),
    Report.aggregate([
      {
        $lookup: {
          from: "links",
          localField: "linkId",
          foreignField: "_id",
          as: "link",
        },
      },
      {
        $addFields: {
          link: { $arrayElemAt: ["$link", 0] },
        },
      },
      { $match: query },
      { $count: "total" },
    ]).then((result) => result[0]?.total || 0),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    reports,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      limit,
    },
  };
};

const getReportsByLinkId = async (linkId) => {
  const reports = await Report.find({ linkId })
    .populate("reportedBy", "username")
    .populate("resolvedBy", "username")
    .sort({ createdAt: -1 });

  return reports;
};

const getReportById = async (reportId) => {
  const report = await Report.findById(reportId)
    .populate("linkId")
    .populate("reportedBy", "username")
    .populate("resolvedBy", "username");

  if (!report) {
    throw new CustomError("Report not found", 404);
  }

  return report;
};

// Send results to the reporter
const updateReportStatus = async ({
  reportId,
  status,
  action,
  isChangeRelated,
  adminNotes,
  resolvedBy,
}) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new CustomError("Report not found", 404);
  }
  console.log("isChangeRelated", isChangeRelated);
  if (isChangeRelated) {
    const relatedReports = await Report.updateMany(
      { linkId: report.linkId, _id: { $ne: reportId }, status: "pending" },
      { status, adminNotes, resolvedBy, resolvedDate: new Date() }
    );
    console.log(`Updated ${relatedReports.modifiedCount} related reports.`);
  }

  report.status = status;
  report.adminNotes = adminNotes;

  if (status === "resolved" || status === "rejected") {
    if (action) {
      switch (action) {
        case "warning":
          // TODO: send notification to user
          const link = await Link.findById(report.linkId);
          const isNoticed = socketService.sendNotificationToUser(
            link.userId.toString(),
            "notification",
            {
              message: `Warning: The link ${link.shortUrl} you created has violated our policies. Please review and ensure that your links fully comply with our guidelines. If violations persist, your account may be suspended. For further details, please contact support.`,
            }
          );

          if (!isNoticed) {
            console.error("Failed to send notification to user.");
          }
          break;
        case "disable":
          await updateLinkStatus(report.linkId, true);
          break;
        default:
          throw new CustomError("Invalid action specified", 400);
      }
    }
    report.resolvedBy = resolvedBy;
    report.resolvedDate = new Date();
  } else {
    report.resolvedBy = null;
    report.resolvedDate = null;
  }

  await report.save();
  return report;
};

const getReportStats = async () => {
  const stats = await Report.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        resolved: {
          $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
        },
        rejected: {
          $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
        },
        reviewed: {
          $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        pending: 1,
        resolved: 1,
        rejected: 1,
        reviewed: 1,
      },
    },
  ]);

  return (
    stats[0] || {
      total: 0,
      pending: 0,
      resolved: 0,
      rejected: 0,
      reviewed: 0,
    }
  );
};

const deleteReport = async (reportId) => {
  const report = await Report.findByIdAndDelete(reportId);
  if (!report) {
    throw new CustomError("Report not found", 404);
  }
  return report;
};

const deleteReports = async (reportIds) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = await Report.deleteMany({ _id: { $in: reportIds } });
    await session.commitTransaction();

    return results;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

module.exports = {
  createReport,
  getReports,
  getReportsByLinkId,
  getReportById,
  updateReportStatus,
  getReportStats,
  deleteReport,
  deleteReports,
};
