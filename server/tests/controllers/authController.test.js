const authController = require("../../controllers/authController");
const authService = require("../../services/authService");
const mailService = require("../../services/mailService");
const { generateVerificationToken } = require("../../helpers/utils");

jest.mock("../../services/authService");
jest.mock("../../services/mailService");
jest.mock("../../helpers/utils");
jest.mock("../../config/redis", () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
}));

describe("Auth Controller", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock request and response
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock process.env
    process.env.BASE_URL = "http://test.com";
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    jest.clearAllMocks();
  });

  describe("register", () => {
    const mockUser = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    };

    const mockVerificationToken = "mock-token-123";

    beforeEach(() => {
      mockRequest.body = mockUser;
      generateVerificationToken.mockReturnValue(mockVerificationToken);
    });

    it("should register a new user successfully", async () => {
      // Arrange
      authService.registerUser.mockResolvedValue(undefined);
      mailService.sendVerifiedEmail.mockResolvedValue(undefined);

      // Act
      await authController.register(mockRequest, mockResponse);

      // Assert
      expect(generateVerificationToken).toHaveBeenCalled();
      expect(authService.registerUser).toHaveBeenCalledWith(
        mockUser.username,
        mockUser.email,
        mockUser.password,
        mockUser.firstName,
        mockUser.lastName,
        mockVerificationToken
      );

      const expectedVerifyLink = `${process.env.BASE_URL}/api/users/verify?token=${mockVerificationToken}`;
      expect(mailService.sendVerifiedEmail).toHaveBeenCalledWith(
        mockUser.email,
        expectedVerifyLink
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User registered successfully",
      });
    });

    it("should handle registration failure from auth service", async () => {
      // Arrange
      const error = new Error("Registration failed");
      authService.registerUser.mockRejectedValue(error);

      // Act & Assert
      await expect(
        authController.register(mockRequest, mockResponse)
      ).rejects.toThrow("Registration failed");
    });

    it("should handle email sending failure", async () => {
      // Arrange
      authService.registerUser.mockResolvedValue(undefined);
      const error = new Error("Email sending failed");
      mailService.sendVerifiedEmail.mockRejectedValue(error);

      // Act & Assert
      await expect(
        authController.register(mockRequest, mockResponse)
      ).rejects.toThrow("Email sending failed");
    });
  });

  describe("login", () => {
    const mockCredentials = {
      username: "testuser",
      password: "password123",
    };

    const mockToken = "mock-jwt-token";

    beforeEach(() => {
      mockRequest.body = mockCredentials;
    });

    it("should login user successfully", async () => {
      // Arrange
      authService.loginUser.mockResolvedValue(mockToken);

      // Act
      await authController.login(mockRequest, mockResponse);

      // Assert
      expect(authService.loginUser).toHaveBeenCalledWith(
        mockCredentials.username,
        mockCredentials.password
      );
      expect(mockResponse.json).toHaveBeenCalledWith({ token: mockToken });
    });

    it("should handle login failure", async () => {
      // Arrange
      const error = new Error("Invalid credentials");
      authService.loginUser.mockRejectedValue(error);

      // Act & Assert
      await expect(
        authController.login(mockRequest, mockResponse)
      ).rejects.toThrow("Invalid credentials");
    });
  });
});

