/**
 * Swagger 插件
 * 用于生成 API 文档
 * 访问地址：http://localhost:3000/documentation
 */

import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function registerSwagger(fastify) {
  // 注册 Swagger
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Todos REST API',
        description: 'A complete Fastify + Prisma + SQLite Todos REST API',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'todos', description: 'Todo related endpoints' },
      ],
    },
  });

  // 注册 Swagger UI
  await fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });

  fastify.log.info('📚 Swagger documentation available at /documentation');
}