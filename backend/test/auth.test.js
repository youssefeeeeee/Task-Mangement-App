const request = require("supertest");
const mongoose = require("mongoose");
const {MongoMemoryServer} = require("mongodb-memory-server");
const app = require("../app");
const User = require("../models/user");
require("dotenv").config();

let mongoServer;

beforeAll(async() => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});
afterAll(async() => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth routes',  () => {
    test('POST /auth/register should create a new user',async () => {
        const res = await request(app).post('/auth/register').send({
            name: 'Youssef',
            email: 'test@example.com',
            password: 'password123'
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");
    });
    test("post /auth/login should return a jwt token", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "test@example.com",
            password: "password123"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
    });
    test("GET /auth/me should return user info with valid token", async () => {
        const loginres = await request(app).post("/auth/login").send({
            email: "test@example.com",
            password: "password123"
        });
        const token = loginres.body.token;
        const res = await request(app).get("/auth/me").set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("name", "Youssef");
        expect(res.body).toHaveProperty("email", "test@example.com");
        });
})