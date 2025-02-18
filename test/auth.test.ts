import request from 'supertest';
import { prisma } from '../src/config/db';
import app from '../src/app';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Test@1234'
};

beforeAll(async () => {
  await prisma.$connect();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth API', () => {
  test('POST /auth/register - 成功注册用户', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(TEST_USER);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  test('POST /auth/login - 成功登录', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send(TEST_USER);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});