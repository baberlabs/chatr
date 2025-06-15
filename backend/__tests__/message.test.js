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
  jest,
} from "@jest/globals";
import cloudinary from "cloudinary";

import app from "../src/app.js";
import { text } from "express";

let mongo;

jest.mock("cloudinary", () => ({
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

      userOneId = resOne.body.user._id;
      userTwoId = resTwo.body.user._id;

      const loginData = { email: users[0].email, password: users[0].password };
      const loginRes = await request(app).post(loginEndpoint).send(loginData);
      expect(loginRes.status).toBe(200);

      const chatRes = await request(app)
        .post(chatEndpoint)
        .set("Cookie", loginRes.headers["set-cookie"])
        .send({ receiverId: userTwoId });
      expect(chatRes.status).toBe(201);
      chatId = chatRes.body.data._id;

      cookies = loginRes.headers["set-cookie"];
      expect(cookies).toBeDefined();

      cloudinary.uploader.upload.mockReset();
    });

    it("should return `401` if not authenticated", async () => {
      const res = await request(app).post(endpoint).send({ text: "Hello" });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorised - No Token");
    });

    it("should return `400` if `chatId` is not provided", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ text });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Missing Chat ID");
    });

    it("should return `400` for invalid `chatId` format", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId: "invalid-chat-id", text: "Hello" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid Chat ID");
    });

    it("should return `404` if `chatId` does not exist", async () => {
      const nonExistentChatId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId: nonExistentChatId, text: "Hello" });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Chat Not Found");
    });

    it("should return `403` if user is not a participant in the chat", async () => {
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
      expect(res.body.message).toBe("You are not a participant of this chat");
    });

    it("should return 400 if both text and image are missing", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Message content is missing");
    });

    it("should return 400 if text is empty or only whitespace", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, text: "   " });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Message content is missing");
    });

    it("should return 400 if text exceeds 1000 characters", async () => {
      const longText = "A".repeat(1050);
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, text: longText });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Message text exceeds maximum length of 1000 characters"
      );
    });

    it("should return 400 if image is not valid base64", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, image: "not-a-valid-base64" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid Image Format");
    });

    it("should return 201 when sending text-only message using chatId", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ chatId, text: "Hello, this is a text message!" });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Message sent successfully",
        data: {
          chatId,
          text: "Hello, this is a text message!",
          senderId: userOneId,
          seen: false,
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
        message: "Message sent successfully",
        data: {
          chatId,
          text: "Hello with leading and trailing spaces!",
          senderId: userOneId,
          seen: false,
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
        message: "Message sent successfully",
        data: {
          chatId,
          text: "This message should not be seen yet.",
          senderId: userOneId,
          seen: false,
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
        message: "Message sent successfully",
        data: {
          chatId,
          image: mockImageUrl,
          senderId: userOneId,
          seen: false,
        },
      });
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(base64Image, {
        resource_type: "image",
        folder: "chat_images",
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
        message: "Message sent successfully",
        data: {
          chatId,
          text: "Hello with an image!",
          image: mockImageUrl,
          senderId: userOneId,
          seen: false,
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
      expect(res.body.message).toBe("Image upload failed");
    });
  });
});
