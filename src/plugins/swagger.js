/**
 * Swagger 插件
 * 用于生成 API 文档
 * 访问地址：http://localhost:3000/documentation
 * 
 * 更新：添加 JWT Bearer Token 认证支持
 */

import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function registerSwagger(fastify) {
  // 注册 Swagger
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Todos REST API with JWT Authentication',
        description: 'A complete Fastify + Prisma + SQLite Todos REST API with JWT authentication',
        version: '2.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'todos', description: 'Todo related endpoints (requires authentication)' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter your JWT token in the format: Bearer <token>',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  });

  // 注册 Swagger UI
  await fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true, // 保持认证状态
    },
    staticCSP: true,
  });

  fastify.log.info('📚 Swagger documentation available at /documentation');
}