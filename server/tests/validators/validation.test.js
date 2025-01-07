const express = require("express");
const request = require("supertest");
const {
  loginValidate,
  registerValidate,
} = require("../../validators/authValidator");
const validateRequest = require("../../middlewares/validateRequest");

describe("Validation Middleware", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe("loginValidate", () => {
    beforeEach(() => {
      app.post("/api/login", loginValidate, validateRequest, (req, res) => {
        res.status(200).json({ message: "Login successful" });
      });
    });

    it("should pass validation with valid data", async () => {
      const response = await request(app)
        .post("/api/login")
        .send({ username: "testuser", password: "testpass" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
    });

    it("should fail if username is missing", async () => {
      const response = await request(app)
        .post("/api/login")
        .send({ password: "testpass" });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("User name is required");
    });

    it("should fail if password is missing", async () => {
      const response = await request(app)
        .post("/api/login")
        .send({ username: "testuser" });
      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Password is required");
    });
  });

  describe("registerValidate", () => {
    beforeEach(() => {
      app.post(
        "/api/register",
        registerValidate,
        validateRequest,
        (req, res) => {
          res.status(201).json({ message: "Registration successful" });
        }
      );
    });

    it("should pass validation with valid data", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          username: "testuser",
          email: "test@example.com",
          password: "testpass",
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Registration successful");
    });

    it("should fail if username is missing", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({ email: "test@example.com", password: "testpass" });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("User name is required");
    });
  });
});
