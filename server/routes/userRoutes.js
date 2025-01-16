const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const {
  emailValidate,
  tokenValidate,
  resetPasswordValidate,
  changePasswordValidate,
  userQueryValidate,
  userIdValidate,
  userIdsValidate,
} = require("../validators/userValidator");
const { roles } = require("../consts/consts");
const validateRequest = require("../middlewares/validateRequest");
const upload = require("../middlewares/upload");

router.put(
  "/users/avatar",
  authenticateToken,
  upload.single("avatar"),
  userController.updateAvatar
);

router.put(
  "/users/ban/:userId/:isBanned",
  authenticateToken,
  authorizeRoles(roles.admin),
  userController.updateUserBanStatus
);

router.delete("/users/avatar", authenticateToken, userController.deleteAvatar);

router.get(
  "/users",
  authenticateToken,
  authorizeRoles(roles.admin),
  userQueryValidate,
  validateRequest,
  userController.getUsers
);

router.get("/users/profile", authenticateToken, userController.getProfile);

router.put("/users/:userId", authenticateToken, userController.updateUser);

router.delete(
  "/users/:userId",
  authenticateToken,
  authorizeRoles(roles.admin),
  userIdValidate,
  validateRequest,
  userController.deleteUser
);

router.delete(
  "/users",
  authenticateToken,
  authorizeRoles(roles.admin),
  userIdsValidate,
  validateRequest,
  userController.deleteUsers
);

router.post(
  "/users/change-password",
  authenticateToken,
  changePasswordValidate,
  validateRequest,
  userController.changePassword
);

// auth
router.get(
  "/users/verify",
  tokenValidate,
  validateRequest,
  userController.verifyEmail
);

router.post(
  "/users/reverify",
  emailValidate,
  validateRequest,
  userController.reSendVerifyEmail
);

router.post(
  "/users/forgot-password",
  emailValidate,
  validateRequest,
  userController.forgotPassword
);

router.get(
  "/users/check-forgot-password",
  tokenValidate,
  validateRequest,
  userController.checkForgotPasswordToken
);

router.post(
  "/users/reset-password",
  resetPasswordValidate,
  validateRequest,
  userController.resetPassword
);

router.get(
  "/users/:userId",
  authenticateToken,
  userIdValidate,
  validateRequest,
  userController.getUser
);

module.exports = router;
