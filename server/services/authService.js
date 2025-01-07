const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { CustomError } = require("../helpers/utils");

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new CustomError("JWT_SECRET not defined in environment variables", 500);
}

const registerUser = async (
  username,
  email,
  password,
  firstName = null,
  lastName = null,
  verificationToken = null
) => {
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new CustomError("Username or email already exists", 400);
  }

  const newUser = new User({
    username,
    email,
    password,
    firstName,
    lastName,
    verificationToken,
  });

  await newUser.save();
  return newUser;
};

const loginUser = async (username, password) => {
  const user = await User.findOne({ username }).select("+password");
  if (!user) {
    throw new CustomError("Invalid credentials", 400);
  }
  if (!user.isVerify) {
    throw new CustomError("Email not verified", 403, { email: user.email });
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new CustomError("Invalid credentials", 400);
  }

  const sanitizedUser = {
    _id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerify: user.isVerify,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
  };

  const { accessToken, refreshToken } = await generateTokens({
    id: user._id,
    role: user.role,
  });

  user.refreshToken = refreshToken;

  await user.save();

  return { user: sanitizedUser, accessToken, refreshToken };
};

const logout = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { refreshToken: null },
    { new: true }
  );
  if (!user) throw new CustomError("User not found", 404);
  return user;
};

const generateTokens = async (payload, saveToken = false) => {
  const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
  if (saveToken) {
    const user = await User.findById(payload.id).select("+refreshToken");
    user.refreshToken = refreshToken;
    await user.save();
  }

  return { accessToken, refreshToken };
};

const verifyRefreshToken = (refreshToken) => {
  return jwt.verify(refreshToken, jwtSecret);
};

module.exports = {
  registerUser,
  loginUser,
  logout,
  generateTokens,
  verifyRefreshToken,
};
