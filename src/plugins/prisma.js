/**
 * Prisma 插件
 * 用于在 Fastify 实例中注入 Prisma Client
 * 使得所有路由都可以通过 fastify.prisma 访问数据库
 */

import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';

async function prismaPlugin(fastify, options) {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // 测试数据库连接
  await prisma.$connect();
  fastify.log.info('✅ Prisma connected to database');

  // 将 Prisma 实例装饰到 Fastify 实例上
  fastify.decorate('prisma', prisma);

  // 在应用关闭时断开数据库连接
  fastify.addHook('onClose', async (fastify) => {
    await fastify.prisma.$disconnect();
    fastify.log.info('🔌 Prisma disconnected from database');
  });
}

export default fp(prismaPlugin, {
  name: 'prisma',
});