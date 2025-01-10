const reportService = require("../services/reportService");
const asyncHandler = require("express-async-handler");

const createReport = asyncHandler(async (req, res) => {
  const { linkId, shortUrl, type, description } = req.body;
  const reportedBy = req.user?.id;
  console.log("reportedBy", reportedBy);

  const report = await reportService.createReport({
    linkId,
    shortUrl,
    type,
    description,
    reportedBy,
  });

  res.status(201).json(report);
});

const getReports = asyncHandler(async (req, res) => {
  const { search, status, type, sortBy, sortOrder, page, limit } = req.query;
  const reports = await reportService.getReports({
    search,
    status,
    type,
    sortBy,
    sortOrder,
    page,
    limit,
  });
  res.json(reports);
});

const getReportsByLinkId = asyncHandler(async (req, res) => {
  const { linkId } = req.params;
  const reports = await reportService.getReportsByLinkId(linkId);
  res.json(reports);
});

const getReportById = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const report = await reportService.getReportById(reportId);
  res.json(report);
});

const updateReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status, action, isChangeRelated, adminNotes } = req.body;
  console.log("isChangeRelated in controller", isChangeRelated);
  const resolvedBy = req.user?.id;
  const report = await reportService.updateReportStatus({
    reportId,
    status,
    action,
    isChangeRelated,
    adminNotes,
    resolvedBy,
  });

  res.json(report);
});

const getReportStats = asyncHandler(async (req, res) => {
  const stats = await reportService.getReportStats();
  res.json(stats);
});

const deleteReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  await reportService.deleteReport(reportId);
  res.status(204).json({ message: "Report deleted successfully" });
});

const deleteReports = asyncHandler(async (req, res) => {
  const { reportIds } = req.body;
  await reportService.deleteReports(reportIds);
  res.status(204).json({ message: "Reports deleted successfully" });
});

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
