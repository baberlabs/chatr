import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import app from "../src/app.js";

let mongo;

beforeAll(async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

describe("Chat Routes", () => {
  const users = [
    {
      fullName: "User One",
      email: "userone@email.com",
      password: "strongPassword123",
    },
    {
      fullName: "User Two",
      email: "usertwo@email.com",
      password: "strongPassword123",
    },
  ];

  const regEndpoint = "/api/v1/auth/register";
  const loginEndpoint = "/api/v1/auth/login";

  let cookies, userOneId, userTwoId;

  beforeEach(async () => {
    const resOne = await request(app).post(regEndpoint).send(users[0]);
    const resTwo = await request(app).post(regEndpoint).send(users[1]);
    expect(resOne.status).toBe(201);
    expect(resTwo.status).toBe(201);
    userOneId = resOne.body.user._id;
    userTwoId = resTwo.body.user._id;
    const resLogin = await request(app)
      .post(loginEndpoint)
      .send({ email: users[0].email, password: users[0].password });
    expect(resLogin.status).toBe(200);
    cookies = resLogin.headers["set-cookie"];
    expect(cookies).toBeDefined();
  });

  describe.only("POST /api/v1/chats", () => {
    const endpoint = "/api/v1/chats";

    it("should return `401` if user is not authenticated", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ receiverId: userTwoId });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorised - No Token");
    });

    it("should return `400` if `receiverId` is missing", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Missing User ID");
    });

    it("should return `400` if `receiverId` is invalid", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: "invalid-receiver-id" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid User ID");
    });

    it("should return `404` if receiver user does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: nonExistentId });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User Not Found");
    });

    it("should return `201` if a new one-on-one chat is created", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Chat created successfully",
        data: {
          _id: expect.any(String),
          isGroup: false,
          participants: expect.arrayContaining([userOneId, userTwoId]),
          chatName: null,
          groupAdmin: null,
        },
      });
    });

    it("should return `200` if an existing one-on-one chat is reused", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Chat created successfully",
        data: {
          _id: expect.any(String),
          isGroup: false,
          participants: expect.arrayContaining([userOneId, userTwoId]),
          chatName: null,
          groupAdmin: null,
        },
      });
      const res2 = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId });
      expect(res2.status).toBe(200);
      expect(res2.body).toMatchObject({
        message: "Chat already exists",
        data: {
          _id: res.body.data._id,
          isGroup: false,
          participants: expect.arrayContaining([userOneId, userTwoId]),
          chatName: null,
          groupAdmin: null,
        },
      });
    });
  });
});
