import DBClient from '@db/prisma/DBClient.js';
const prisma = DBClient.instance;
import redisClient from '@db/redis.js';

import {jest} from '@jest/globals';

import request from "supertest";
import app from "../src/app/app";

// jest.useFakeTimers();

beforeAll(done => {
  done();
})

afterAll(done => {
  // Closing the DB connection allows Jest to exit successfully.
  prisma.$disconnect();
  redisClient.disconnect();
  done();
})

describe("Test the root path", () => {
  test("It should response the GET method", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
});

