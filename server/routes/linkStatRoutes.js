const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const router = express.Router();
const linkStatController = require("../controllers/linkStatController");
// validator
const validateRequest = require("../middlewares/validateRequest");
const {
  linkStatValidate,
  rangeDateValidate,
} = require("../validators/linkStatValidator");
const { roles } = require("../consts/consts");

// TODO: should refactor this

router.get(
  "/link-stats/by-link/:linkId",
  authenticateToken,
  linkStatValidate,
  validateRequest,
  linkStatController.getStatsByLinkId
);

router.get(
  "/link-stats/list/:linkId",
  authenticateToken,
  rangeDateValidate,
  validateRequest,
  linkStatController.getStatListByLinkId
);

router.get(
  "/link-stats/by-user/clicks",
  rangeDateValidate,
  validateRequest,
  authenticateToken,
  linkStatController.getClickStatsByUser
);

// TODO: maybe change later
router.get(
  "/link-stats/by-user/stats",
  rangeDateValidate,
  validateRequest,
  authenticateToken,
  linkStatController.getStatsByUser
);

router.delete(
  "/stats/:statId",
  authenticateToken,
  linkStatController.deleteLinkStat
);

router.delete("/stats", authenticateToken, authorizeRoles(roles.admin), linkStatController.deleteLinkStats);

module.exports = router;
