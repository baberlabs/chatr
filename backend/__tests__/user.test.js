import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { beforeEach, describe, jest } from "@jest/globals";

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

describe("User Routes", () => {
  describe("GET /api/v1/users", () => {
    const endpoint = "/api/v1/users";

    const users = [
      {
        fullName: "User One",
        email: "user1@example.com",
        password: "Password123",
      },
      {
        fullName: "User Two",
        email: "user2@example.com",
        password: "Password123",
      },
      {
        fullName: "User Three",
        email: "user3@example.com",
        password: "Password123",
      },
    ];

    beforeEach(async () => {
      for (const user of users) {
        await request(app).post("/api/v1/auth/register").send(user);
      }

      // Login with the first user to get cookies
      const res = await request(app).post("/api/v1/auth/login").send({
        email: users[0].email,
        password: users[0].password,
      });

      cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get(endpoint);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorised - No Token");
    });

    it("should return all users expect the requesting user", async () => {
      const res = await request(app).get(endpoint).set("Cookie", cookies);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBe(users.length - 1);

      for (const user of res.body.users) {
        expect(user).toMatchObject({
          _id: expect.any(String),
          fullName: expect.any(String),
          email: expect.any(String),
          profilePic: expect.any(String),
          isVerified: expect.any(Boolean),
        });

        expect(user).not.toHaveProperty("password");
      }
    });
  });

  describe("GET /api/v1/users/:id", () => {
    const endpointBase = "/api/v1/users";

    const users = [
      {
        fullName: "User One",
        email: "user1@example.com",
        password: "Password123",
      },
      {
        fullName: "User Two",
        email: "user2@example.com",
        password: "Password123",
      },
    ];

    let cookies;
    let userOneId;
    let userTwoId;

    beforeEach(async () => {
      const res1 = await request(app)
        .post("/api/v1/auth/register")
        .send(users[0]);
      const res2 = await request(app)
        .post("/api/v1/auth/register")
        .send(users[1]);

      userOneId = res1.body.user._id;
      userTwoId = res2.body.user._id;

      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: users[0].email, password: users[0].password });

      cookies = loginRes.header["set-cookie"];
      expect(cookies).toBeDefined();
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get(`${endpointBase}/${userTwoId}`);
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorised - No Token");
    });

    it("should return 400 for invalid user ID format", async () => {
      const res = await request(app)
        .get(`${endpointBase}/invalid-id-format`)
        .set("Cookie", cookies);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid User ID");
    });

    it("should return 404 if user does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .get(`${endpointBase}/${nonExistentId}`)
        .set("Cookie", cookies);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User Not Found");
    });

    it("should return user data if authenticated and valid ID", async () => {
      const res = await request(app)
        .get(`${endpointBase}/${userTwoId}`)
        .set("Cookie", cookies);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        _id: userTwoId,
        fullName: users[1].fullName,
        email: users[1].email,
        profilePic: "",
        isVerified: false,
      });

      expect(res.body.user).not.toHaveProperty("password");
    });
  });
});
