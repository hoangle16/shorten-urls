const userService = require("../services/userService");
const {
  cacheGetOrSet,
  updateCacheAfterModification,
  generateVerificationToken,
  CustomError,
  UpdateCacheAfterDelete,
  updateCacheAfterDeleteMany,
} = require("../helpers/utils");
const mailService = require("../services/mailService");
const asyncHandler = require("express-async-handler");
const { roles } = require("../consts/consts");
const { default: mongoose } = require("mongoose");

const getUsers = asyncHandler(async (req, res) => {
  const currentAdminId = req.user.id;
  const {
    search,
    isVerify,
    role,
    sortBy,
    sortOrder,
    page = 1,
    limit = 10,
  } = req.query;
  // const users = await cacheGetOrSet(
  //   "users",
  //   userService.getUsers({
  //     search,
  //     isVerify,
  //     role,
  //     sortBy,
  //     sortOrder,
  //     page,
  //     limit,
  //   })
  // );
  const users = await userService.getUsers({
    search,
    isVerify,
    role,
    sortBy,
    sortOrder,
    page,
    limit,
    currentAdminId,
  });
  res.json(users);
});

const getUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (
    currentUser.role !== roles.admin &&
    currentUser.id !== req.params.userId
  ) {
    throw new CustomError("Forbidden", 403);
  }
  const cacheKey = `user:${req.params.userId}`;
  // const userData = await cacheGetOrSet(cacheKey, () =>
  //   userService.getUser(req.params.userId)
  // );
  const userData = await userService.getUser(req.params.userId);

  res.json(userData);
});

const getProfile = asyncHandler(async (req, res) => {
  const cacheKey = `user:${req.user.id}`;
  const user = await cacheGetOrSet(cacheKey, () =>
    userService.getProfile(req.user.id)
  );
  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const { lastName, firstName, isVerify, role } = req.body;
  const { userId } = req.params;

  if (req.user.role !== roles.admin && req.user.id != userId) {
    throw new CustomError("Forbidden");
  }
  let updateData = { lastName, firstName, isVerify };
  if (req.user.role === roles.admin) {
    updateData = { ...updateData, role };
  }
  const cacheKey = `user:${userId}`;
  const updatedUser = await updateCacheAfterModification(cacheKey, () =>
    userService.updateUser(userId, updateData)
  );

  res.json(updatedUser);
});

const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  res.json({ message: "Password changed successfully" });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (req.user.role !== roles.admin && req.user.id != userId) {
    throw new CustomError("Forbidden", 403);
  }
  const cacheKey = `user:${userId}`;
  await UpdateCacheAfterDelete(cacheKey, () => userService.deleteUser(userId));
  res.json({ message: "User deleted successfully" });
});

const deleteUsers = asyncHandler(async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new CustomError(
      "Invalid input: userIds must be a non-empty array",
      400
    );
  }

  if (userIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new CustomError("Invalid userId format in the array", 400);
  }
  const cachedKeys = userIds.map((id) => `user:${id}`);
  await updateCacheAfterDeleteMany(cachedKeys, () =>
    userService.deleteUsers(userIds)
  );

  res.json({ message: "Users deleted successfully" });
});

const verifyEmail = asyncHandler(async (req, res) => {
  console.log(req.query);
  await userService.verifyEmail(req.query.token);
  res.redirect(`${process.env.EMAIL_VERIFIED_URL}`);
});

const reSendVerifyEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const verificationToken = generateVerificationToken();
  const user = await userService.saveToken(email, verificationToken);
  if (!user) {
    throw new CustomError("No user found for the email provided.", 400);
  }
  const verifyLink = `${process.env.BASE_URL}/api/users/verify?token=${verificationToken}`;
  await mailService.sendVerifiedEmail(email, verifyLink);
  res.json({ message: "Verification email sent again" });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const verificationToken = generateVerificationToken();
  await userService.saveToken(email, verificationToken);
  // TODO: resetLink
  // const resetLink = `${process.env.BASE_URL}/api/users/check-forgot-password?token=${verificationToken}`;
  const resetLink = `${process.env.RESET_PASSWORD_URL}?token=${verificationToken}`;
  await mailService.sendResetPasswordEmail(email, resetLink);
  res.json({ message: "Password reset email sent" });
});

const checkForgotPasswordToken = asyncHandler(async (req, res) => {
  const user = await userService.verifyToken(req.query.token);
  res.redirect(
    `${process.env.BASE_URL}/api/users/reset-password?token=${user.verificationToken}`
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  await userService.resetPassword(req.query.token, req.body.password);
  res.json({ message: "Password reset successfully" });
});

module.exports = {
  getUsers,
  getUser,
  getProfile,
  updateUser,
  deleteUser,
  deleteUsers,
  verifyEmail,
  reSendVerifyEmail,
  forgotPassword,
  checkForgotPasswordToken,
  resetPassword,
  changePassword,
};
