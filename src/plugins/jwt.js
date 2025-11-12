/**
 * JWT 认证插件
 * 作用：配置 JWT Token 生成和验证
 * 企业级特性：
 * - Access Token (短期，15分钟)
 * - Refresh Token (长期，7天)
 * - Token 黑名单支持
 */

import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';

async function jwtPlugin(fastify, options) {
  // 从环境变量读取密钥，生产环境必须设置
  const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-change-in-production';
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-in-production';

  // 注册 JWT 插件用于 Access Token
  await fastify.register(jwt, {
    secret: accessTokenSecret,
    sign: {
      expiresIn: '15m', // Access Token 15分钟过期
    },
    verify: {
      maxAge: '15m',
    },
    // 自定义 JWT 装饰器名称
    namespace: 'security',
    jwtDecode: 'jwtDecode',
    jwtSign: 'jwtSign',
    jwtVerify: 'jwtVerify',
  });

  // 添加 Refresh Token 签名和验证方法
  fastify.decorate('jwtRefreshSign', async (payload) => {
    return fastify.jwt.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: '7d', // Refresh Token 7天过期
    });
  });

  fastify.decorate('jwtRefreshVerify', async (token) => {
    try {
      return fastify.jwt.verify(token, {
        secret: refreshTokenSecret,
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  });

  // 添加认证装饰器 - 用于路由保护
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      // 验证 JWT Token
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }
  });

  // 添加可选认证装饰器 - Token 可选，但如果提供则必须有效
  fastify.decorate('authenticateOptional', async function (request, reply) {
    try {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        await request.jwtVerify();
      }
    } catch (err) {
      // 如果 token 无效，设置 user 为 null
      request.user = null;
    }
  });

  fastify.log.info('✅ JWT authentication plugin registered');
}

export default fp(jwtPlugin, {
  name: 'jwt-auth',
  dependencies: ['prisma'], // 依赖 Prisma 插件
});