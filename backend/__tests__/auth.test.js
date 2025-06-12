import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";

import app from "../src/app.js";

let mongo;

beforeAll(async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

describe("Auth Routes", () => {
  describe("POST /api/v1/auth/register", () => {
    const endpoint = "/api/v1/auth/register";

    const validPayload = {
      fullName: "Test User",
      email: "test@example.com",
      password: "strongPassword123",
    };

    it("should fail if fullName is missing", async () => {
      const { fullName, ...payload } = validPayload;
      const res = await request(app).post(endpoint).send(payload);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("Full name is required");
    });

    it("should fail if email is missing", async () => {
      const { email, ...payload } = validPayload;
      const res = await request(app).post(endpoint).send(payload);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("Email is required");
    });

    it("should fail if password is missing", async () => {
      const { password, ...payload } = validPayload;
      const res = await request(app).post(endpoint).send(payload);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("Password is required");
    });

    it("should fail if email is invalid", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ ...validPayload, email: "not-an-email" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("Invalid email");
    });

    it("should fail if password is too short", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ ...validPayload, password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Password should be at least 8 characters long"
      );
    });

    it("should fail if fullName is too short", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ ...validPayload, fullName: "Ab" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Full name should be at least 3 characters long"
      );
    });

    it("should fail if fullName is too long", async () => {
      const longName = "Abc".repeat(20);
      const res = await request(app)
        .post(endpoint)
        .send({ ...validPayload, fullName: longName });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Full name should be less than 50 characters long"
      );
    });

    it("should register a user with valid data", async () => {
      const res = await request(app).post(endpoint).send(validPayload);

      expect(res.status).toBe(201);

      expect(res.body).toMatchObject({
        message: "User registered successfully",
        user: {
          fullName: validPayload.fullName,
          email: validPayload.email,
          isVerified: false,
        },
      });

      expect(res.body.user._id).toBeDefined();
      expect(mongoose.isValidObjectId(res.body.user._id)).toBe(true);

      expect(res.body.user).not.toHaveProperty("password");
      expect(res.body.user).not.toHaveProperty("verificationCode");
      expect(res.body.user).not.toHaveProperty("verificationCodeExpires");
    });

    it("should trim leading/trailing whitespace from input", async () => {
      const res = await request(app).post(endpoint).send({
        fullName: "    Test User    ",
        email: "      test@example.com     ",
        password: "    strongPassword123      ",
      });

      expect(res.status).toBe(201);
      expect(res.body.user.fullName).toBe("Test User");
      expect(res.body.user.email).toBe("test@example.com");
    });

    it("should fail if email already exists", async () => {
      // First time email is used
      await request(app).post(endpoint).send(validPayload);

      // Second time the same email is used
      const res = await request(app)
        .post(endpoint)
        .send({ ...validPayload, fullName: "Another User" });

      expect(res.status).toBe(409); // conflict error
      expect(res.body.message).toBe("Email already exists");
    });

    it("should register a user with valid data and set JWT cookie", async () => {
      const res = await request(app).post(endpoint).send(validPayload);

      expect(res.status).toBe(201);

      expect(res.body).toMatchObject({
        message: "User registered successfully",
        user: {
          fullName: validPayload.fullName,
          email: validPayload.email,
          isVerified: false,
        },
      });

      // JWT Cookie
      const cookie = res.headers["set-cookie"];
      expect(cookie).toBeDefined();
      expect(cookie[0]).toMatch(/jwt=/);
    });
  });
});
