const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require("../models/user");
const Task = require("../models/task");
const jwt = require("jsonwebtoken");

let mongoServer;
let token;
let userId;

beforeAll( async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    const user = await User.create({name: "test user", email: "test@example.com",password:"1234pass"});
    userId = user._id;
    token = jwt.sign({userId: user._id, name: user.name, email: user.email}, process.env.JWT_KEY);
});

afterAll( async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Task Routes ', () => {
    test("POST /tasks should create a new task", async() => {
        const res = await request(app).post("/tasks").set("Authorization", `Bearer ${token}`).send({
            title: "Test Task",
            description: "This is a test task",
    });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("title", "Test Task");
    });
    test("GET /tasks should return tasks for user", async () => {
        const res = await request(app).get("/tasks").set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });
    test("PUT /tasks/:id should update a task", async() => {
        const task = await Task.create({title:"Old", userId});
        const res = await request(app).put(`/tasks/${task._id}`).set("Authorization", `Bearer ${token}`).send({
            title: "Updated Task",
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("title", "Updated Task");
    });
    test("DELETE /tasks/:id should delete a task", async () => {
        const task = await Task.create({title:"to be deleted", userId});
        const res = await request(app).delete(`/tasks/${task._id}`).set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Task deleted successfully");
    })
});