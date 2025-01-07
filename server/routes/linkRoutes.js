const express = require("express");
const {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeRoles,
} = require("../middlewares/auth");
const router = express.Router();
const { roles } = require("../consts/consts");
const linkController = require("../controllers/linkController");
const {
  userIdValidate,
  linkIdValidate,
  passwordValidate,
  updateLinkValidation,
  createLinkValidation,
} = require("../validators/linkValidator");
const validateRequest = require("../middlewares/validateRequest");

router.get(
  "/api/links",
  authenticateToken,
  authorizeRoles(roles.admin),
  linkController.getLinks
);

router.get(
  "/api/links/users/:userId",
  authenticateToken,
  userIdValidate,
  validateRequest,
  linkController.getLinksByUserId
);

router.get("/:shortUrl", linkController.getLinkByShortUrl);

router.post(
  "/:shortUrl/protected",
  passwordValidate,
  validateRequest,
  linkController.getProtectedLinkByShortUrl
);

// TODO: maybe remove this
router.get("/:shortUrl/protected", (req, res) => {
  res.send("This is a protected link");
});

router.get(
  "/api/links/:linkId",
  authenticateToken,
  linkIdValidate,
  validateRequest,
  linkController.getLinkById
);

router.post(
  "/api/links",
  optionalAuthenticateToken,
  createLinkValidation,
  validateRequest,
  linkController.createLink
);

//TODO: update link router
router.put(
  "/api/links/:linkId",
  authenticateToken,
  updateLinkValidation,
  validateRequest,
  linkController.updateLink
);

router.delete(
  "/api/links/:linkId",
  authenticateToken,
  linkIdValidate,
  validateRequest,
  linkController.deleteLink
);

router.delete(
  "/api/links",
  authenticateToken,
  authorizeRoles(roles.admin),
  linkController.deleteLinks
);

module.exports = router;
