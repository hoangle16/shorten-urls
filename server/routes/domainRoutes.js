const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const {
  domainIdValidate,
  domainNameValidate,
} = require("../validators/domainValidator");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();
const { roles } = require("../consts/consts");
const domainController = require("../controllers/domainController");

router.get("/domains", domainController.getDomains);

router.get(
  "/domains/:domainId",
  domainIdValidate,
  validateRequest,
  domainController.getDomainById
);

router.post(
  "/domains",
  authenticateToken,
  authorizeRoles(roles.admin),
  domainNameValidate,
  validateRequest,
  domainController.createDomain
);

router.put(
  "/domains/:domainId",
  authenticateToken,
  authorizeRoles(roles.admin),
  domainIdValidate,
  domainNameValidate,
  validateRequest,
  domainController.updateDomain
);

router.delete(
  "/domains/:domainId",
  authenticateToken,
  authorizeRoles(roles.admin),
  domainIdValidate,
  validateRequest,
  domainController.deleteDomain
);

module.exports = router;
