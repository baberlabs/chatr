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

    beforeEach(async () => {
      const regEndpoint = "/api/v1/auth/register";

      const resOne = await request(app).post(regEndpoint).send(users[0]);
      const resTwo = await request(app).post(regEndpoint).send(users[1]);

      expect(resOne.status).toBe(201);
      expect(resTwo.status).toBe(201);

      userOneId = resOne.body.user._id;
      userTwoId = resTwo.body.user._id;

      const loginEndpoint = "/api/v1/auth/login";
      const loginData = { email: users[0].email, password: users[0].password };

      const loginRes = await request(app).post(loginEndpoint).send(loginData);

      expect(loginRes.status).toBe(200);

      cookies = loginRes.headers["set-cookie"];
      expect(cookies).toBeDefined();

      cloudinary.uploader.upload.mockReset();
    });

    it("should return 401 if not authorised", async () => {
      const res = await request(app).post(endpoint).send({ text: "Hello" });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorised - No Token");
    });

    it("should return 400 for missing receiverId", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ text: "Hello" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Missing User ID");
    });

    it("should return 400 for invalid receiverId format", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: "invalid-receiver-id", text: "Hello" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid User ID");
    });

    it("should return 404 if receiver user does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: nonExistentId, text: "Hello" });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User Not Found");
    });

    it("should return 400 if both text and image are missing", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Message content is missing");
    });

    it("should return 400 if text is empty string", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId, text: "" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Message content is missing");
    });

    it("should return 403 if sending a message to oneself", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userOneId, text: "Hello" });
      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Cannot send message to yourself");
    });

    it("should return 400 if text exceeds maximum allowed length", async () => {
      const longText = "A".repeat(1050);
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId, text: longText });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Text exceeds 1000 characters limit");
    });

    it("should send text message successfully", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId, text: "Hello, Mr User Two" });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Message sent successfully",
        data: {
          senderId: userOneId,
          receiverId: userTwoId,
          text: "Hello, Mr User Two",
        },
      });
    });

    it("should return 400 if image is not valid base64", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({ receiverId: userTwoId, image: "not-a-valid-base64" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid Image Format");
    });

    it("should return 500 if Cloudinary upload fails", async () => {
      cloudinary.uploader.upload.mockRejectedValue(new Error("Upload failed"));
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({
          receiverId: userTwoId,
          image:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFqgJ/jk8Z6gAAAABJRU5ErkJggg==",
        });
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Image upload failed");
    });

    it("should upload image to Cloudinary and send message", async () => {
      cloudinary.uploader.upload.mockResolvedValue({
        secure_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      });
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({
          receiverId: userTwoId,
          image:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFqgJ/jk8Z6gAAAABJRU5ErkJggg==",
        });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Message sent successfully",
        data: {
          _id: expect.any(String),
          senderId: userOneId,
          receiverId: userTwoId,
          image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
          seen: false,
        },
      });
    });

    it("should send message with both text and image", async () => {
      cloudinary.uploader.upload.mockResolvedValue({
        secure_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      });
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({
          receiverId: userTwoId,
          text: "Hello, this is my image",
          image:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFqgJ/jk8Z6gAAAABJRU5ErkJggg==",
        });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Message sent successfully",
        data: {
          _id: expect.any(String),
          senderId: userOneId,
          receiverId: userTwoId,
          text: "Hello, this is my image",
          image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
          seen: false,
        },
      });
    });

    it("should trim whitespace from text", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({
          receiverId: userTwoId,
          text: "      Hello, Mr User Two            ",
        });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Message sent successfully",
        data: {
          _id: expect.any(String),
          senderId: userOneId,
          receiverId: userTwoId,
          text: "Hello, Mr User Two",
          seen: false,
        },
      });
    });

    it("should mark seen as false by default", async () => {
      const res = await request(app)
        .post(endpoint)
        .set("Cookie", cookies)
        .send({
          receiverId: userTwoId,
          text: "You haven't seen this text yet",
        });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Message sent successfully",
        data: {
          _id: expect.any(String),
          senderId: userOneId,
          receiverId: userTwoId,
          text: "You haven't seen this text yet",
          seen: false,
        },
      });
    });
  });
});
