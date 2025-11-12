/**
 * Fastify Application
 * 配置和初始化 Fastify 应用
 *
 * 更新：添加 JWT 认证支持
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import prismaPlugin from './plugins/prisma.js';
import jwtPlugin from './plugins/jwt.js';
import { registerSwagger } from './plugins/swagger.js';
import authRoutes from './routes/auth.routes.js';
import todoRoutes from './routes/todo.routes.js';

// 加载环境变量
dotenv.config();

/**
 * 构建 Fastify 应用
 * @param {Object} opts - Fastify 选项
 * @returns {FastifyInstance} Fastify 实例
 */
export async function buildApp(opts = {}) {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
    ...opts,
  });

  // 注册 CORS
  await fastify.register(cors, {
    origin: true, // 允许所有来源，生产环境应该配置具体域名
  });

  // 注册 Prisma 插件
  await fastify.register(prismaPlugin);

  // 注册 JWT 认证插件
  await fastify.register(jwtPlugin);

  // 注册 Swagger 文档（必须在 JWT 插件之后）
  await registerSwagger(fastify);

  // 健康检查路由
  fastify.get('/', async (request, reply) => {
    return {
      status: 'ok',
      message: 'Fastify + Prisma + SQLite Todos API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  });

  fastify.get('/health', async (request, reply) => {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  // 注册 API 路由
  await fastify.register(authRoutes, { prefix: '/api' });
  await fastify.register(todoRoutes, { prefix: '/api' });

  // 全局错误处理
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    // JWT 认证错误
    if (error.statusCode === 401) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: error.message || 'Invalid or expired token',
      });
    }

    // Prisma 错误处理
    if (error.code?.startsWith('P')) {
      return reply.code(400).send({
        success: false,
        error: 'Database operation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    // 验证错误
    if (error.validation) {
      return reply.code(400).send({
        success: false,
        error: 'Validation failed',
        details: error.validation,
      });
    }

    // 默认错误响应
    return reply.code(error.statusCode || 500).send({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  });

  return fastify;
}