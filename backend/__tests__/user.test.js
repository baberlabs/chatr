import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { beforeEach, describe, jest } from "@jest/globals";

import app from "../src/app.js";
import cloudinary from "../src/utils/cloudinary.js";

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

    it("should return with user data if authenticated and valid ID", async () => {
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

  describe("PUT /api/v1/users/:id", () => {
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

      cookies = loginRes.headers["set-cookie"];
      expect(cookies).toBeDefined();

      cloudinary.uploader.upload.mockReset();
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .send({ fullName: "Mr Malicious" });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorised - No Token");
    });

    it("should return 400 for invalid user ID format", async () => {
      const res = await request(app)
        .put(`${endpointBase}/invalid-user-id`)
        .set("Cookie", cookies)
        .send({ fullName: "Mr Invalid" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid User ID");
    });

    it("should return 404 if user not found", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .put(`${endpointBase}/${nonExistentId}`)
        .set("Cookie", cookies)
        .send({ fullName: "Mr NonExistent" });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User Not Found");
    });

    it("should return 403 for updating someone else's profile", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userTwoId}`)
        .set("Cookie", cookies)
        .send({ fullName: "Mr Someone Else" });
      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Permission Denied");
    });

    it("should return 400 if no fields are provided", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("At least one field must be provided");
    });

    it("should return 400 if fullName is too short", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({ fullName: "Al" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Full name should be at least 3 characters long"
      );
    });

    it("should return 400 if fullName is too long", async () => {
      const longName = "Al".repeat(30);
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({ fullName: longName });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Full name should be less than 50 characters long"
      );
    });

    it("should return 400 if password is too short", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({ password: "123" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Password should be at least 8 characters long"
      );
    });

    it("should return 400 if email is malformed", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({ email: "not-an-email" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid email");
    });

    it("should return 409 if email is already taken", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({ email: users[1].email });
      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Email already exists");
    });

    it("should update fullName successfully", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({ fullName: "Mr NewName" });
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        _id: userOneId,
        fullName: "Mr NewName",
        email: users[0].email,
        profilePic: "",
        isVerified: false,
      });
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should update password successfully", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({ password: "NewPassword123" });
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        _id: userOneId,
        fullName: users[0].fullName,
        email: users[0].email,
        profilePic: "",
        isVerified: false,
      });
      expect(res.body.user).not.toHaveProperty("password");

      const resLogout = await request(app).post("/api/v1/auth/logout");
      expect(resLogout.status).toBe(200);
      expect(resLogout.body.message).toBe("User logged out successfully");

      const resLoginOldPassword = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: users[0].email, password: users[0].password });

      expect(resLoginOldPassword.status).toBe(401);
      expect(resLoginOldPassword.body.message).toBe("Invalid credentials");

      const resLoginNewPassword = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: users[0].email, password: "NewPassword123" });

      expect(resLoginNewPassword.status).toBe(200);
      expect(resLoginNewPassword.body).toMatchObject({
        message: "User logged in successfully",
        user: {
          _id: userOneId,
          fullName: users[0].fullName,
          email: users[0].email,
          profilePic: "",
          isVerified: false,
        },
      });
    });

    it("should update email successfully", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({ email: "new@email.com" });
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        _id: userOneId,
        fullName: users[0].fullName,
        email: "new@email.com",
        profilePic: "",
        isVerified: false,
      });
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should normalize email to lowercase", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({ email: "New@Email.COM" });
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        _id: userOneId,
        fullName: users[0].fullName,
        email: "new@email.com",
        profilePic: "",
        isVerified: false,
      });
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should update profilePic successfully", async () => {
      const base64Image =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...";
      const imageURL =
        "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg";
      cloudinary.uploader.upload.mockResolvedValue({
        secure_url: imageURL,
      });
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({ profilePic: base64Image });
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        _id: userOneId,
        fullName: users[0].fullName,
        email: users[0].email,
        profilePic: imageURL,
        isVerified: false,
      });
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should trim whitespace from inputs", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({ email: "     new@email.com   " });
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        _id: userOneId,
        fullName: users[0].fullName,
        email: "new@email.com",
        profilePic: "",
        isVerified: false,
      });
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should update multiple fields successfully", async () => {
      const res = await request(app)
        .put(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies)
        .send({
          fullName: "Mr New",
          email: "new@email.com",
        });
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        _id: userOneId,
        fullName: "Mr New",
        email: "new@email.com",
        profilePic: "",
        isVerified: false,
      });
      expect(res.body.user).not.toHaveProperty("password");
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    const endpointBase = "/api/v1/users";

    const users = [
      {
        fullName: "User One",
        email: "user1@example.com",
        password: "TestPassword123",
      },
      {
        fullName: "User Two",
        email: "user2@example.com",
        password: "TestPassword123",
      },
    ];

    let userOneId;
    let userTwoId;
    let cookies;

    beforeEach(async () => {
      const registerEndpoint = "/api/v1/auth/register";

      const res1 = await request(app).post(registerEndpoint).send(users[0]);
      const res2 = await request(app).post(registerEndpoint).send(users[1]);

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);

      expect(res1.body.user).toBeDefined();
      expect(res2.body.user).toBeDefined();

      userOneId = res1.body.user._id;
      userTwoId = res2.body.user._id;

      const loginEndpoint = "/api/v1/auth/login";

      const loginUser = {
        email: users[0].email,
        password: users[0].password,
      };

      const loginRes = await request(app).post(loginEndpoint).send(loginUser);

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user).toBeDefined();

      cookies = loginRes.headers["set-cookie"];
      expect(cookies).toBeDefined();
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).delete(`${endpointBase}/${userOneId}`);
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorised - No Token");
    });

    it("should return 403 for deleting someone else's account", async () => {
      const res = await request(app)
        .delete(`${endpointBase}/${userTwoId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Permission Denied");
    });

    it("should return 400 for invalid user ID format", async () => {
      const res = await request(app)
        .delete(`${endpointBase}/invalid-user-id`)
        .set("Cookie", cookies);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid User ID");
    });

    it("should return 404 if user not found", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .delete(`${endpointBase}/${nonExistentId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User Not Found");
    });

    it("should delete the user successfully", async () => {
      const res = await request(app)
        .delete(`${endpointBase}/${userOneId}`)
        .set("Cookie", cookies);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: "User account deleted successfully",
        user: {
          _id: userOneId,
          fullName: users[0].fullName,
          email: users[0].email,
          profilePic: "",
          isVerified: false,
        },
      });
      expect(res.body.user).not.toHaveProperty("password");

      // should not allow login after account deletion
      const fetchRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: users[0].email, password: users[0].password });
      expect(fetchRes.status).toBe(401);
      expect(fetchRes.body.message).toBe("Invalid credentials");
    });
  });
});
