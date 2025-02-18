import { prisma } from '../src/config/db';

// 测试前清空数据库
beforeAll(async () => {
  await prisma.resetToken.deleteMany();
  await prisma.user.deleteMany();
});

// 测试后断开连接
afterAll(async () => {
  await prisma.$disconnect();
});