process.env.JWT_SECRET = "my-secret-key";

const express = require("express");
const request = require("supertest");
const {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeRoles,
} = require("../../middlewares/auth");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

const app = express();

app.use(express.json());
app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).send("Access granted");
});
app.get("/optional", optionalAuthenticateToken, (req, res) => {
  res.status(200).json({ user: req.user });
});
app.get("/admin", authenticateToken, authorizeRoles("admin"), (req, res) => {
  res.status(200).send("Admin access granted");
});

describe("authMiddleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("authenticateToken", () => {
    it("should return 401 if no token is provided", async () => {
      const response = await request(app).get("/protected");
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Access denied. No token provided.");
    });

    it("should return 403 if token is invalid", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(403);
      expect(response.text).toBe("Invalid token");
    });

    it("should call next if token is valid", async () => {
      jwt.verify.mockReturnValue({ id: "123", role: "user" });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.text).toBe("Access granted");
      expect(jwt.verify).toHaveBeenCalledWith(
        "Bearer valid-token",
        process.env.JWT_SECRET
      );
    });
  });

  describe("optionalAuthenticateToken", () => {
    it("should set req.user to null if no token is provided", async () => {
      const response = await request(app).get("/optional");
      expect(response.status).toBe(200);
      expect(response.body.user).toBeNull();
    });

    it("should set req.user to decoded token if token is valid", async () => {
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { id: "123", role: "user" });
      });

      const response = await request(app)
        .get("/optional")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({ id: "123", role: "user" });
    });

    it("should set req.user to null if token is invalid", async () => {
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error("Invalid token"), null);
      });

      const response = await request(app)
        .get("/optional")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(200);
      expect(response.body.user).toBeNull();
    });
  });

  describe("authorizeRoles", () => {
    it("should return 403 if user role is not authorized", async () => {
      jwt.verify.mockReturnValue({ id: "123", role: "user" });

      const response = await request(app)
        .get("/admin")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(403);
      expect(response.text).toBe("Access Denied. Insufficient permissions");
    });

    it("should call next if user role is authorized", async () => {
      jwt.verify.mockReturnValue({ id: "123", role: "admin" });

      const response = await request(app)
        .get("/admin")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.text).toBe("Admin access granted");
    });
  });
});
