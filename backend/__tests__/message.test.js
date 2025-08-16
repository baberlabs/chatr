import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import app from "../src/app.js";
import cloudinary from "../src/utils/cloudinary.js";
import { ErrorCodes } from "../src/errors.js";
import { LIMITS } from "../src/services/infrastructure/validation.service.js";

let mongo;

jest.mock("../src/utils/cloudinary.js", () => ({
  uploader: {
    upload: jest.fn(),
  },
}));

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

describe("Message Routes", () => {
  describe("POST /api/v1/messages", () => {
    const endpoint = "/api/v1/messages";

    const users = [
      {
        fullName: "User One",
        email: "user1@email.com",
        password: "User1Password",
      },
      {
        fullName: "User Two",
        email: "user2@email.com",
        password: "User2Password",
      },
    ];

    let cookies;
    let userOneId;
    let userTwoId;
    let chatId;

    beforeEach(async () => {
      const regEndpoint = "/api/v1/auth/register";
      const loginEndpoint = "/api/v1/auth/login";
      const chatEndpoint = "/api/v1/chats";

      const resOne = await request(app).post(regEndpoint).send(users[0]);
      const resTwo = await request(app).post(regEndpoint).send(users[1]);

      expect(resOne.status).toBe(201);
      expect(resTwo.status).toBe(201);

      userOneId = resOne.body.data.user._id;
      userTwoId = resTwo.body.data.user._id;

      const loginData = { email: users[0].email, password: users[0].password };
      const loginRes = await request(app).post(loginEndpoint).send(loginData);
      expect(loginRes.status).toBe(200);

      const chatRes = await request(app)
        .post(chatEndpoint)
        .set("Cookie", loginRes.headers["set-cookie"])
        .send({ receiverId: userTwoId });
      expect(chatRes.status).toBe(201);
      chatId = chatRes.body.data.chat._id;

      cookies = loginRes.headers["set-cookie"];
      expect(cookies).toBeDefined();

      cloudinary.uploader.upload.mockReset();
    });

    it("should return `401` if not authenticated", async () => {
      const res = await request(app).post(endpoint).send({ text: "Hello" });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ErrorCodes.AUTH_TOKEN_REQUIRED);
    });

    it("should return `400` if `chatId` is not provided", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ text: "Hello" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.CHAT_ID_REQUIRED);
    });

    it("should return `400` for invalid `chatId` format", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId: "invalid-chat-id", text: "Hello" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.CHAT_ID_INVALID);
    });

    it("should return `404` if `chatId` does not exist", async () => {
      const nonExistentChatId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId: nonExistentChatId, text: "Hello" });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe(ErrorCodes.CHAT_NOT_FOUND);
    });

    it("should return `403` if user is not a participant in the chat", async () => {
      const resLogout = await request(app).post("/api/v1/auth/logout");
      expect(resLogout.status).toBe(200);

      const userThree = {
        fullName: "User Three",
        email: "userthree@email.com",
        password: "User3Password",
      };
      const resThree = await request(app)
        .post("/api/v1/auth/register")
        .send(userThree);
      expect(resThree.status).toBe(201);

      const resLogin = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: userThree.email, password: userThree.password });
      expect(resLogin.status).toBe(200);

      const userThreeCookies = resLogin.headers["set-cookie"];
      expect(userThree).toBeDefined();

      const res = await request(app)
        .post(endpoint)
        .set("Cookie", userThreeCookies)
        .send({ chatId, text: "Hello" });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe(ErrorCodes.CHAT_ACCESS_DENIED);
    });

    it("should return 400 if both text and image are missing", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.MESSAGE_CONTENT_REQUIRED);
    });

    it("should return 400 if text is empty or only whitespace", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, text: "   " });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.MESSAGE_CONTENT_REQUIRED);
    });

    it("should return 400 if text exceeds 1000 characters", async () => {
      const longText = "A".repeat(1050);
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, text: longText });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.MESSAGE_TEXT_TOO_LONG);
    });

    it("should return 400 if image is not valid base64", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, image: "not-a-valid-base64" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.MESSAGE_IMAGE_INVALID);
    });

    it("should return 201 when sending text-only message using chatId", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, text: "Hello, this is a text message!" });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Message sent",
        data: {
          message: {
            chatId,
            text: "Hello, this is a text message!",
            senderId: userOneId,
            seen: false,
          },
        },
      });
    });

    it("should return 201 and trim whitespace from text", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({
          chatId,
          text: "   Hello with leading and trailing spaces!   ",
        });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Message sent",
        data: {
          message: {
            chatId,
            text: "Hello with leading and trailing spaces!",
            senderId: userOneId,
            seen: false,
          },
        },
      });
    });

    it("should return 201 and set seen: false by default", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, text: "This message should not be seen yet." });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Message sent",
        data: {
          message: {
            chatId,
            text: "This message should not be seen yet.",
            senderId: userOneId,
            seen: false,
          },
        },
      });
    });

    it("should return 201 after uploading base64 image to Cloudinary", async () => {
      const mockImageUrl =
        "https://res.cloudinary.com/demo/image/upload/sample.jpg";
      cloudinary.uploader.upload.mockResolvedValue({
        secure_url: mockImageUrl,
      });
      const base64Image =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFqgJ/jk8Z6gAAAABJRU5ErkJggg==";
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, image: base64Image });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Message sent",
        data: {
          message: {
            chatId,
            image: mockImageUrl,
            senderId: userOneId,
            seen: false,
          },
        },
      });
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(base64Image, {
        resource_type: "image",
        folder: "chat_images",
        max_file_size: LIMITS.imageBytes,
      });
    });

    it("should return 201 when sending message with both text and image", async () => {
      const mockImageUrl =
        "https://res.cloudinary.com/demo/image/upload/sample.jpg";
      cloudinary.uploader.upload.mockResolvedValue({
        secure_url: mockImageUrl,
      });
      const base64Image =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFqgJ/jk8Z6gAAAABJRU5ErkJggg==";
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, text: "Hello with an image!", image: base64Image });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Message sent",
        data: {
          message: {
            chatId,
            text: "Hello with an image!",
            image: mockImageUrl,
            senderId: userOneId,
            seen: false,
          },
        },
      });
    });

    it("should return 500 if Cloudinary upload fails", async () => {
      cloudinary.uploader.upload.mockRejectedValue(new Error("Upload failed"));
      const base64Image =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFqgJ/jk8Z6gAAAABJRU5ErkJggg==";
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, image: base64Image });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe(ErrorCodes.MESSAGE_IMAGE_UPLOAD_FAILED);
    });
  });

  describe("GET /api/v1/messages/:chatId", () => {
    const endpoint = "/api/v1/messages";

    const users = [
      {
        fullName: "User One",
        email: "userone@email.com",
        password: "UserOnePassword",
      },
      {
        fullName: "User Two",
        email: "usertwo@email.com",
        password: "UserTwoPassword",
      },
      {
        fullName: "User Three",
        email: "userthree@email.com",
        password: "UserThreePassword",
      },
    ];

    let userOneId;
    let userTwoId;
    let userThreeId;
    let chatId;
    let cookies;

    beforeEach(async () => {
      const regEndpoint = "/api/v1/auth/register";
      const loginEndpoint = "/api/v1/auth/login";
      const chatEndpoint = "/api/v1/chats";
      const resOne = await request(app).post(regEndpoint).send(users[0]);
      const resTwo = await request(app).post(regEndpoint).send(users[1]);
      const resThree = await request(app).post(regEndpoint).send(users[2]);
      expect(resOne.status).toBe(201);
      expect(resTwo.status).toBe(201);
      expect(resThree.status).toBe(201);
      userOneId = resOne.body.data.user._id;
      userTwoId = resTwo.body.data.user._id;
      userThreeId = resThree.body.data.user._id;
      const loginData = { email: users[0].email, password: users[0].password };
      const loginRes = await request(app).post(loginEndpoint).send(loginData);
      expect(loginRes.status).toBe(200);
      cookies = loginRes.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const chatRes = await request(app)
        .post(chatEndpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId });
      expect(chatRes.status).toBe(201);
      chatId = chatRes.body.data.chat._id;
      expect(chatId).toBeDefined();
    });

    it("should return `401` if user is not authenticated", async () => {
      const res = await request(app).get(`${endpoint}/${chatId}`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ErrorCodes.AUTH_TOKEN_REQUIRED);
    });

    it("should return `400` if `chatId` is not a valid Mongo ID", async () => {
      const res = await request(app)
        .get(`${endpoint}/invalid-chat-id`)
        .set("Cookie", cookies);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.CHAT_ID_INVALID);
    });

    it("should return `404` if chat with `chatId` does not exist", async () => {
      const nonExistendChatId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .get(`${endpoint}/${nonExistendChatId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe(ErrorCodes.CHAT_NOT_FOUND);
    });

    it("should return `403` if user is not a participant in the chat", async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: users[2].email, password: users[2].password });
      expect(loginRes.status).toBe(200);
      const userThreeCookies = loginRes.headers["set-cookie"];
      const res = await request(app)
        .get(`${endpoint}/${chatId}`)
        .set("Cookie", userThreeCookies);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe(ErrorCodes.CHAT_ACCESS_DENIED);
    });

    it("should return `200` and an empty array if no messages exist for the chat", async () => {
      const res = await request(app)
        .get(`${endpoint}/${chatId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: "Messages retrieved",
        data: {
          messages: [],
        },
      });
    });

    it("should return `200` and an array of messages for a valid chatId", async () => {
      const message1 = { chatId, text: "Hello from User One!" };
      const message2 = { chatId, text: "Hello from User Two!" };
      const resMessageUser1 = await request(app)
        .post("/api/v1/messages")
        .set("Cookie", cookies)
        .send(message1);
      expect(resMessageUser1.status).toBe(201);
      expect(resMessageUser1.body).toMatchObject({
        message: "Message sent",
        data: {
          message: {
            chatId,
            text: "Hello from User One!",
            senderId: userOneId,
            seen: false,
          },
        },
      });
      const resLoginUser2 = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: users[1].email, password: users[1].password });
      expect(resLoginUser2.status).toBe(200);
      const userTwoCookies = resLoginUser2.headers["set-cookie"];
      const resMessageUser2 = await request(app)
        .post("/api/v1/messages")
        .set("Cookie", userTwoCookies)
        .send(message2);
      expect(resMessageUser2.status).toBe(201);
      expect(resMessageUser2.body).toMatchObject({
        message: "Message sent",
        data: {
          message: {
            chatId,
            text: "Hello from User Two!",
            senderId: userTwoId,
            seen: false,
          },
        },
      });
      const res = await request(app)
        .get(`${endpoint}/${chatId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(200);
      expect(res.body.data.messages).toHaveLength(2);
      expect(res.body).toMatchObject({
        message: "Messages retrieved",
        data: {
          messages: [
            {
              _id: expect.any(String),
              chatId,
              senderId: userOneId,
              text: "Hello from User One!",
              seen: false,
              createdAt: expect.any(String),
            },
            {
              _id: expect.any(String),
              chatId,
              senderId: userTwoId,
              text: "Hello from User Two!",
              seen: false,
              createdAt: expect.any(String),
            },
          ],
        },
      });
    });

    it("should return `200` and messages sorted by createdAt in ascending order", async () => {
      const message1 = { chatId, text: "Hello from User One!" };
      const message2 = { chatId, text: "Hello from User Two!" };
      const resMessageUser1 = await request(app)
        .post("/api/v1/messages")
        .set("Cookie", cookies)
        .send(message1);
      expect(resMessageUser1.status).toBe(201);
      expect(resMessageUser1.body).toMatchObject({
        message: "Message sent",
        data: {
          message: {
            chatId,
            text: "Hello from User One!",
            senderId: userOneId,
            seen: false,
          },
        },
      });
      const resLoginUser2 = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: users[1].email, password: users[1].password });
      expect(resLoginUser2.status).toBe(200);
      const userTwoCookies = resLoginUser2.headers["set-cookie"];
      const resMessageUser2 = await request(app)
        .post("/api/v1/messages")
        .set("Cookie", userTwoCookies)
        .send(message2);
      expect(resMessageUser2.status).toBe(201);
      expect(resMessageUser2.body).toMatchObject({
        message: "Message sent",
        data: {
          message: {
            chatId,
            text: "Hello from User Two!",
            senderId: userTwoId,
            seen: false,
          },
        },
      });
      const res = await request(app)
        .get(`${endpoint}/${chatId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(200);
      expect(res.body.data.messages).toHaveLength(2);
      expect(res.body).toMatchObject({
        message: "Messages retrieved",
        data: {
          messages: [
            {
              _id: expect.any(String),
              chatId,
              senderId: userOneId,
              text: "Hello from User One!",
              seen: false,
              createdAt: expect.any(String),
            },
            {
              _id: expect.any(String),
              chatId,
              senderId: userTwoId,
              text: "Hello from User Two!",
              seen: false,
              createdAt: expect.any(String),
            },
          ],
        },
      });
    });

    it("should return `200` and messages with correct fields", async () => {
      const message1 = { chatId, text: "Hello from User One!" };
      const message2 = { chatId, text: "Hello from User Two!" };
      const resMessageUser1 = await request(app)
        .post("/api/v1/messages")
        .set("Cookie", cookies)
        .send(message1);
      expect(resMessageUser1.status).toBe(201);
      expect(resMessageUser1.body).toMatchObject({
        message: "Message sent",
        data: {
          message: {
            chatId,
            text: "Hello from User One!",
            senderId: userOneId,
            seen: false,
          },
        },
      });
      const resLoginUser2 = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: users[1].email, password: users[1].password });
      expect(resLoginUser2.status).toBe(200);
      const userTwoCookies = resLoginUser2.headers["set-cookie"];
      const resMessageUser2 = await request(app)
        .post("/api/v1/messages")
        .set("Cookie", userTwoCookies)
        .send(message2);
      expect(resMessageUser2.status).toBe(201);
      expect(resMessageUser2.body).toMatchObject({
        message: "Message sent",
        data: {
          message: {
            chatId,
            text: "Hello from User Two!",
            senderId: userTwoId,
            seen: false,
          },
        },
      });
      const res = await request(app)
        .get(`${endpoint}/${chatId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(200);
      expect(res.body.data.messages).toHaveLength(2);
      expect(res.body).toMatchObject({
        message: "Messages retrieved",
        data: {
          messages: [
            {
              _id: expect.any(String),
              chatId,
              senderId: userOneId,
              text: "Hello from User One!",
              seen: false,
              createdAt: expect.any(String),
            },
            {
              _id: expect.any(String),
              chatId,
              senderId: userTwoId,
              text: "Hello from User Two!",
              seen: false,
              createdAt: expect.any(String),
            },
          ],
        },
      });
    });
  });

  describe("DELETE /api/v1/messages/:messageId", () => {
    const endpoint = "/api/v1/messages";
    const users = [
      {
        fullName: "User One",
        email: "userone@example.com",
        password: "password123",
      },
      {
        fullName: "User Two",
        email: "usertwo@example.com",
        password: "password123",
      },
    ];
    let userOneId;
    let userTwoId;
    let chatId;
    let cookies;
    let messageId;

    beforeEach(async () => {
      const regEndpoint = "/api/v1/auth/register";
      const loginEndpoint = "/api/v1/auth/login";
      const chatEndpoint = "/api/v1/chats";

      const resOne = await request(app).post(regEndpoint).send(users[0]);
      const resTwo = await request(app).post(regEndpoint).send(users[1]);

      expect(resOne.status).toBe(201);
      expect(resTwo.status).toBe(201);

      userOneId = resOne.body.data.user._id;
      userTwoId = resTwo.body.data.user._id;

      const loginData = { email: users[0].email, password: users[0].password };
      const loginRes = await request(app).post(loginEndpoint).send(loginData);
      expect(loginRes.status).toBe(200);

      cookies = loginRes.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const chatRes = await request(app)
        .post(chatEndpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId });
      expect(chatRes.status).toBe(201);
      chatId = chatRes.body.data.chat._id;

      const messageRes = await request(app)
        .post("/api/v1/messages")
        .set("Cookie", cookies)
        .send({ chatId, text: "Hello, this is a test message!" });
      expect(messageRes.status).toBe(201);
      messageId = messageRes.body.data.message._id;
    });

    it("should return `401` if user is not authenticated", async () => {
      const res = await request(app).delete(`${endpoint}/${messageId}`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ErrorCodes.AUTH_TOKEN_REQUIRED);
    });

    it("should return `400` if `messageId` is not a valid Mongo ID", async () => {
      const invalidMessageId = "invalid-message-id";
      const res = await request(app)
        .delete(`${endpoint}/${invalidMessageId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ErrorCodes.MESSAGE_ID_INVALID);
    });

    it("should return `404` if message with given id does not exist", async () => {
      const nonExistentMessageId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .delete(`${endpoint}/${nonExistentMessageId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe(ErrorCodes.MESSAGE_NOT_FOUND);
    });

    it("should return `403` if user is not the sender of the message", async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: users[1].email, password: users[1].password });
      expect(loginRes.status).toBe(200);
      const userTwoCookies = loginRes.headers["set-cookie"];
      const res = await request(app)
        .delete(`${endpoint}/${messageId}`)
        .set("Cookie", userTwoCookies);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe(ErrorCodes.MESSAGE_ACCESS_DENIED);
    });

    it("should return `200` and delete the message successfully", async () => {
      const res = await request(app)
        .delete(`${endpoint}/${messageId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: "Message deleted",
        data: {
          message: {
            _id: messageId,
            chatId,
            senderId: userOneId,
            text: "Hello, this is a test message!",
          },
        },
      });
    });

    it("should remove the message from database after deletion", async () => {
      await request(app)
        .delete(`${endpoint}/${messageId}`)
        .set("Cookie", cookies);
      const res = await request(app)
        .get(`/api/v1/messages/${chatId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Messages retrieved");
      expect(res.body.data.messages).toHaveLength(0);
    });
  });
});
