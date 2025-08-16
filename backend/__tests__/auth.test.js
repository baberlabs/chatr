import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { beforeEach, describe, jest } from "@jest/globals";

import app from "../src/app.js";
import { ErrorCodes } from "../src/errors.js";

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
      expect(res.body.error.code).toBe(ErrorCodes.USER_FULLNAME_REQUIRED);
    });

    it("should fail if email is missing", async () => {
      const { email, ...payload } = validPayload;
      const res = await request(app).post(endpoint).send(payload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.USER_EMAIL_REQUIRED);
    });

    it("should fail if password is missing", async () => {
      const { password, ...payload } = validPayload;
      const res = await request(app).post(endpoint).send(payload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.USER_PASSWORD_REQUIRED);
    });

    it("should fail if email is invalid", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ ...validPayload, email: "not-an-email" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.USER_EMAIL_INVALID);
    });

    it("should fail if password is too short", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ ...validPayload, password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.USER_PASSWORD_TOO_SHORT);
    });

    it("should fail if fullName is too short", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ ...validPayload, fullName: "Ab" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.USER_FULLNAME_TOO_SHORT);
    });

    it("should fail if fullName is too long", async () => {
      const longName = "Abc".repeat(20);
      const res = await request(app)
        .post(endpoint)
        .send({ ...validPayload, fullName: longName });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.USER_FULLNAME_TOO_LONG);
    });

    it("should register a user with valid data", async () => {
      const res = await request(app).post(endpoint).send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("User registered");
      expect(res.body.data).toMatchObject({
        user: {
          fullName: validPayload.fullName,
          email: validPayload.email,
          isVerified: false,
        },
      });
      expect(res.body.data.user._id).toBeDefined();
      expect(mongoose.isValidObjectId(res.body.data.user._id)).toBe(true);
      expect(res.body.data.user).not.toHaveProperty("password");
    });

    it("should trim leading/trailing whitespace from input", async () => {
      const res = await request(app).post(endpoint).send({
        fullName: "    Test User    ",
        email: "      test@example.com     ",
        password: "    strongPassword123      ",
      });

      expect(res.status).toBe(201);
      expect(res.body.data.user.fullName).toBe("Test User");
      expect(res.body.data.user.email).toBe("test@example.com");
    });

    it("should fail if email already exists", async () => {
      // First time email is used
      await request(app).post(endpoint).send(validPayload);

      // Second time the same email is used
      const res = await request(app)
        .post(endpoint)
        .send({ ...validPayload, fullName: "Another User" });

      expect(res.status).toBe(409); // conflict error
      expect(res.body.error.code).toBe(ErrorCodes.USER_EMAIL_ALREADY_EXISTS);
    });

    it("should register a user with valid data and set JWT cookie", async () => {
      const res = await request(app).post(endpoint).send(validPayload);

      expect(res.status).toBe(201);

      expect(res.body).toMatchObject({
        message: "User registered",
        data: {
          user: {
            fullName: validPayload.fullName,
            email: validPayload.email,
            profilePic: "",
            isVerified: false,
          },
        },
      });

      // JWT Cookie
      const cookie = res.headers["set-cookie"];
      expect(cookie).toBeDefined();
      expect(cookie[0]).toMatch(/jwt=/);
    });
  });

  describe("GET /api/v1/auth/status", () => {
    const endpoint = "/api/v1/auth/status";

    it("should return 401 if no cookie is sent", async () => {
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ErrorCodes.AUTH_TOKEN_REQUIRED);
    });

    it("should return 401 if JWT is invalid", async () => {
      const res = await request(app)
        .get(endpoint)
        .set("Cookie", ["jwt=invalid.token.here"]);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ErrorCodes.AUTH_TOKEN_INVALID);
    });

    it("should return 200 and user data if JWT is valid", async () => {
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          fullName: "Status Test User",
          email: "status@test.com",
          password: "validPassword123",
        });

      const cookies = registerRes.header["set-cookie"];
      expect(cookies).toBeDefined();

      const res = await request(app).get(endpoint).set("Cookie", cookies);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User authenticated");
      expect(res.body.data.user).toMatchObject({
        _id: expect.any(String),
        fullName: "Status Test User",
        email: "status@test.com",
        isVerified: false,
      });
    });
  });

  describe("POST /api/v1/auth/login", () => {
    const endpoint = "/api/v1/auth/login";

    const validUser = {
      fullName: "Login Test User",
      email: "login@test.com",
      password: "validPassword123",
    };

    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(validUser);
    });

    it("should fail if email is missing", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ password: validUser.password });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.USER_EMAIL_REQUIRED);
    });

    it("should fail if password is missing", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ email: validUser.email });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.USER_PASSWORD_REQUIRED);
    });

    it("should fail if email is invalid", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ email: "not-an-email", password: validUser.password });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.USER_EMAIL_INVALID);
    });

    it("should fail if user does not exist", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ email: "not@registered.com", password: validUser.password });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ErrorCodes.AUTH_CREDENTIALS_INVALID);
    });

    it("should fail if password is incorrect", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ email: validUser.email, password: "incorrectPassword123" });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ErrorCodes.AUTH_CREDENTIALS_INVALID);
    });

    it("should login successfully with correct credentials and set JWT cookie", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: "User logged in",
        data: {
          user: {
            fullName: validUser.fullName,
            email: validUser.email,
            profilePic: "",
            isVerified: false,
          },
        },
      });

      expect(res.body.data.user._id).toBeDefined();
      expect(res.body.data.user).not.toHaveProperty("password");

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/jwt=/);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    const endpoint = "/api/v1/auth/logout";

    const validUser = {
      fullName: "Logout Tester",
      email: "logout@tester.com",
      password: "strongPassword123",
    };

    let cookies;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(validUser);

      cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
    });

    it("should clear the JWT cookie on logout", async () => {
      const res = await request(app).post(endpoint).set("Cookie", cookies);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User logged out");

      const clearedCookie = res.headers["set-cookie"][0];
      expect(clearedCookie).toMatch(/jwt=;/);
      expect(clearedCookie).toMatch(/Expires=Thu, 01 Jan 1970/);
      expect(clearedCookie).toMatch(/HttpOnly/);
      expect(clearedCookie).toMatch(/SameSite=Strict/);
    });

    it("should return 200 even if no cookie is sent", async () => {
      const res = await request(app).post(endpoint);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User logged out");

      const clearedCookie = res.headers["set-cookie"][0];
      expect(clearedCookie).toMatch(/jwt=;/);
      expect(clearedCookie).toMatch(/Expires=Thu, 01 Jan 1970/);
      expect(clearedCookie).toMatch(/HttpOnly/);
      expect(clearedCookie).toMatch(/SameSite=Strict/);
    });
  });
});
