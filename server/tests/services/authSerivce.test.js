process.env.JWT_SECRET = "my-secret-key";

const mongoose = require("mongoose");
const { registerUser, loginUser } = require("../../services/authService");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const { CustomError } = require("../../helpers/utils");

jest.mock("../../models/User");
jest.mock("jsonwebtoken");

describe("authService.js", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/shortenUrlTest");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
  describe("registerUser", () => {
    it("should throw an error if username or email already exists", async () => {
      User.findOne.mockResolvedValueOnce({ username: "testuser" });

      await expect(
        registerUser("testuser", "test@example.com", "password123")
      ).rejects.toThrow("Username or email already exists");
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ username: "testuser" }, { email: "test@example.com" }],
      });
    });

    it("should save and return the new user", async () => {
      User.findOne.mockResolvedValueOnce(null);
      User.prototype.save = jest.fn().mockResolvedValueOnce(true);

      const newUser = await registerUser(
        "testuser",
        "test@example.com",
        "password123",
        "John",
        "Doe"
      );

      expect(newUser).toBeDefined();
      expect(User.prototype.save).toHaveBeenCalled();
      expect(User).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        verificationToken: null,
      });
    });
  });

  describe("loginUser", () => {
    it("should throw an error if user is not found", async () => {
      User.findOne.mockImplementation(() => ({
        select: jest.fn().mockResolvedValueOnce(null),
      }));

      await expect(loginUser("testuser", "password123")).rejects.toThrow(
        "Invalid credentials"
      );
      expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
    });

    it("should throw an error if email is not verified", async () => {
      User.findOne.mockImplementation(() => ({
        select: jest.fn().mockResolvedValueOnce({ isVerify: false }),
      }));

      await expect(loginUser("testuser", "password123")).rejects.toThrow(
        "Email not verified"
      );
      expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
    });

    it("should throw an error if password dose not match", async () => {
      const mockUser = {
        isVerify: true,
        comparePassword: jest.fn().mockResolvedValueOnce(false),
      };

      User.findOne.mockImplementation(() => ({
        select: jest.fn().mockResolvedValueOnce(mockUser),
      }));

      await expect(loginUser("testuser", "password123")).rejects.toThrow(
        "Invalid credentials"
      );
      expect(mockUser.comparePassword).toHaveBeenCalledWith("password123");
    });

    it("should return a token if login is successful", async () => {
      const mockUser = {
        isVerify: true,
        comparePassword: jest.fn().mockResolvedValueOnce(true),
        id: "12345",
        role: "user",
      };

      const mockToken = "mock-token";

      User.findOne.mockImplementation(() => ({
        select: jest.fn().mockResolvedValueOnce(mockUser),
      }));

      jwt.sign.mockResolvedValueOnce(mockToken);

      const token = await loginUser("testuser", "password123");

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "12345", role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
    });
  });
});
