const authService = require("../services/authService");
const mailService = require("../services/mailService");
const { generateVerificationToken, CustomError } = require("../helpers/utils");
const asyncHandler = require("express-async-handler");

const register = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;
  const verificationToken = generateVerificationToken();
  await authService.registerUser(
    username,
    email,
    password,
    firstName,
    lastName,
    verificationToken
  );

  const verifyLink = `${process.env.BASE_URL}/api/users/verify?token=${verificationToken}`;
  await mailService.sendVerifiedEmail(email, verifyLink);

  res.status(201).json({ message: "User registered successfully" });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const {
    user,
    accessToken: token,
    refreshToken,
  } = await authService.loginUser(username, password);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // TODO:
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });

  res.json({ user, token });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
});

const renewTokens = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new CustomError("No refresh token provided", 403);
  }
  const payload = authService.verifyRefreshToken(refreshToken);
  const { accessToken, refreshToken: newRefreshToken } =
    await authService.generateTokens(
      { id: payload.id, role: payload.role },
      true
    );

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });

  res.json({ token: accessToken });
});

module.exports = {
  register,
  login,
  logout,
  renewTokens,
};
