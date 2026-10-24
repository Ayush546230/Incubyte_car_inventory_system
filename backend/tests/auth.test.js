import request from "supertest";
import app from "../server.js";
import { connectTestDB, closeTestDB } from "./setup.js";
import User from "../models/userModel.js";

describe("User Authentication API (TDD Kata)", () => {
  beforeAll(async () => {
    await connectTestDB();
  }, 30000);

  afterAll(async () => {
    await closeTestDB();
  });

  const testUser = {
    name: "TDD Test User",
    email: `tdd_user_${Date.now()}@example.com`,
    password: "Password@123",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully and return token", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    });

    it("should reject registration if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "incomplete@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject registration with invalid email format", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "User", email: "not-an-email", password: "Password@123" });

      expect(res.status).toBe(400);
    });

    it("should reject registration if password is less than 8 characters", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "User", email: "shortpass@example.com", password: "123" });

      expect(res.status).toBe(400);
    });

    it("should reject duplicate email registration", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(409);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should log in an existing user and return a JWT token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword999",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/admin-login", () => {
    it("should log in with valid admin credentials", async () => {
      const res = await request(app)
        .post("/api/auth/admin-login")
        .send({
          email: "admin@rydex.com",
          password: "admin123",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.role).toBe("admin");
      expect(res.body.token).toBeDefined();
    });

    it("should reject invalid admin credentials", async () => {
      const res = await request(app)
        .post("/api/auth/admin-login")
        .send({
          email: "admin@rydex.com",
          password: "wrong_admin_password",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
