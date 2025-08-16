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
import { ErrorCodes } from "../src/errors.js";

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
    userOneId = resOne.body.data.user._id;
    userTwoId = resTwo.body.data.user._id;
    const resLogin = await request(app)
      .post(loginEndpoint)
      .send({ email: users[0].email, password: users[0].password });
    expect(resLogin.status).toBe(200);
    cookies = resLogin.headers["set-cookie"];
    expect(cookies).toBeDefined();
  });

  describe("GET /api/v1/chats", () => {
    const endpoint = "/api/v1/chats";
    it("should return `401` if user is not authenticated", async () => {
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ErrorCodes.AUTH_TOKEN_REQUIRED);
    });
    it("should return `200` and an empty array if no chats exist", async () => {
      const res = await request(app).get(endpoint).set("Cookie", cookies);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: "Chats retrieved",
        data: {
          chats: [],
        },
      });
    });
    it("should return `200` and an array of chats if chats exist", async () => {
      const chatRes = await request(app)
        .post("/api/v1/chats")
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId });
      expect(chatRes.status).toBe(201);
      const chatId = chatRes.body.data.chat._id;
      const res = await request(app).get(endpoint).set("Cookie", cookies);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: "Chats retrieved",
        data: {
          chats: expect.arrayContaining([
            expect.objectContaining({
              _id: chatId,
              isGroup: false,
              participants: expect.arrayContaining([userOneId, userTwoId]),
              chatName: null,
              groupAdmin: null,
            }),
          ]),
        },
      });
    });
  });

  describe("POST /api/v1/chats", () => {
    const endpoint = "/api/v1/chats";

    it("should return `401` if user is not authenticated", async () => {
      const res = await request(app)
        .post(endpoint)
        .send({ receiverId: userTwoId });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ErrorCodes.AUTH_TOKEN_REQUIRED);
    });

    it("should return `400` if `receiverId` is missing", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.USER_ID_REQUIRED);
    });

    it("should return `400` if `receiverId` is invalid", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: "invalid-receiver-id" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.USER_ID_INVALID);
    });

    it("should return `404` if receiver user does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: nonExistentId });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe(ErrorCodes.USER_NOT_FOUND);
    });

    it("should return `201` if a new one-on-one chat is created", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Chat created",
        data: {
          chat: {
            _id: expect.any(String),
            isGroup: false,
            participants: expect.arrayContaining([userOneId, userTwoId]),
            chatName: null,
            groupAdmin: null,
            latestMessage: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        },
      });
    });

    it("should return `409` if chat already exists", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId });
      expect(res.status).toBe(201);
      const res2 = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId });
      expect(res2.status).toBe(409);
      expect(res2.body.error.code).toBe(ErrorCodes.CHAT_ALREADY_EXISTS);
    });
  });

  describe("GET /api/v1/chats/:chatId", () => {
    const endpointBase = "/api/v1/chats";

    let chatId;

    beforeEach(async () => {
      const chatRes = await request(app)
        .post("/api/v1/chats")
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId });
      expect(chatRes.status).toBe(201);
      chatId = chatRes.body.data.chat._id;
    });

    it("should return `401` is user is not authenticated", async () => {
      const res = await request(app).get(`${endpointBase}/${chatId}`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ErrorCodes.AUTH_TOKEN_REQUIRED);
    });

    it("should return `400` if `chatId` is invalid", async () => {
      const res = await request(app)
        .get(`${endpointBase}/invalid-chat-id`)
        .set("Cookie", cookies);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.CHAT_ID_INVALID);
    });

    it("should return `404` if `chatId` does not exist", async () => {
      const nonExistentChatId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .get(`${endpointBase}/${nonExistentChatId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe(ErrorCodes.CHAT_NOT_FOUND);
    });

    it("should return `403` if user is not a participant in the chat", async () => {
      const userThree = {
        fullName: "User Three",
        email: "userthree@email.com",
        password: "strongPassword123",
      };
      const resThree = await request(app).post(regEndpoint).send(userThree);
      expect(resThree.status).toBe(201);
      const resLogin = await request(app)
        .post(loginEndpoint)
        .send({ email: userThree.email, password: userThree.password });
      expect(resLogin.status).toBe(200);
      const userThreeCookies = resLogin.headers["set-cookie"];
      const res = await request(app)
        .get(`${endpointBase}/${chatId}`)
        .set("Cookie", userThreeCookies);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe(ErrorCodes.CHAT_ACCESS_DENIED);
    });

    it("should return `200` and return chat data if user is a participant", async () => {
      const res = await request(app)
        .get(`${endpointBase}/${chatId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: "Chat retrieved",
        data: {
          chat: {
            _id: chatId,
            isGroup: false,
            participants: expect.arrayContaining([userOneId, userTwoId]),
            chatName: null,
            groupAdmin: null,
          },
        },
      });
    });
  });
});
