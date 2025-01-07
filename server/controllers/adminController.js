const asyncHandler = require("express-async-handler");
const adminService = require("../services/adminService");

const getAdminDashboardOverview = asyncHandler(async (req, res) => {
  const data = await adminService.getAdminDashboardOverview();

  return res.json(data);
});

const getAdminDashboardChart = asyncHandler(async (req, res) => {
  const { range, startDate, endDate } = req.query;

  const data = await adminService.getAdminDashboardChart({
    range,
    startDate,
    endDate,
  });

  return res.json(data);
});

module.exports = {
  getAdminDashboardOverview,
  getAdminDashboardChart,
};
