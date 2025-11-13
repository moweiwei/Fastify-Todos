/**
 * 认证路由层
 * 作用：定义认证相关的 API 端点、验证规则和文档
 */

import { AuthController } from '../controllers/auth.controller.js';

// 用户 Schema
const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    email: { type: 'string', format: 'email' },
    username: { type: 'string' },
    name: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

// Token Schema
const tokensSchema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
    tokenType: { type: 'string' },
    expiresIn: { type: 'integer' },
  },
};

export default async function authRoutes(fastify, options) {
  const controller = new AuthController(fastify);

  // 1. 用户注册
  fastify.post(
    '/auth/register',
    {
      schema: {
        description: 'Register a new user',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email', 'username', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              pattern: '^[a-zA-Z0-9_]+$',
              description: 'Username (alphanumeric and underscore only)',
            },
            password: {
              type: 'string',
              minLength: 6,
              maxLength: 100,
              description: 'Password (minimum 6 characters)',
            },
            name: {
              type: 'string',
              maxLength: 100,
              description: 'User full name (optional)',
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  user: userSchema,
                  tokens: tokensSchema,
                },
              },
            },
          },
          409: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' }
      },
    },
    controller.register.bind(controller)
  );

  // 2. 用户登录
  fastify.post(
    '/auth/login',
    {
      schema: {
        description: 'Login with email/username and password',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['emailOrUsername', 'password'],
          properties: {
            emailOrUsername: {
              type: 'string',
              description: 'Email address or username',
            },
            password: {
              type: 'string',
              description: 'User password',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  user: userSchema,
                  tokens: tokensSchema,
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
      config: {
        rateLimit: { max: 10, timeWindow: '1 minute' }
      },
    },
    controller.login.bind(controller)
  );

  // 3. 刷新 Access Token
  fastify.post(
    '/auth/refresh',
    {
      schema: {
        description: 'Refresh access token using refresh token',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Refresh token',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string' },
                  tokenType: { type: 'string' },
                  expiresIn: { type: 'integer' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    controller.refreshToken.bind(controller)
  );

  // 4. 用户登出
  fastify.post(
    '/auth/logout',
    {
      schema: {
        description: 'Logout and revoke refresh token',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Refresh token to revoke',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    controller.logout.bind(controller)
  );

  // 5. 全部登出（需要认证）
  fastify.post(
    '/auth/logout-all',
    {
      preHandler: fastify.authenticate,
      schema: {
        description: 'Logout from all devices (revoke all refresh tokens)',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    controller.logoutAll.bind(controller)
  );

  // 6. 获取当前用户信息（需要认证）
  fastify.get(
    '/auth/me',
    {
      preHandler: fastify.authenticate,
      schema: {
        description: 'Get current user information',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: userSchema,
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    controller.getCurrentUser.bind(controller)
  );

  // 7. 更新用户信息（需要认证）
  fastify.patch(
    '/auth/me',
    {
      preHandler: fastify.authenticate,
      schema: {
        description: 'Update current user information',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              maxLength: 100,
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'New email address',
            },
          },
          minProperties: 1,
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: userSchema,
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
          409: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    controller.updateCurrentUser.bind(controller)
  );

  // 8. 修改密码（需要认证）
  fastify.post(
    '/auth/change-password',
    {
      preHandler: fastify.authenticate,
      schema: {
        description: 'Change user password',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['oldPassword', 'newPassword'],
          properties: {
            oldPassword: {
              type: 'string',
              description: 'Current password',
            },
            newPassword: {
              type: 'string',
              minLength: 6,
              maxLength: 100,
              description: 'New password (minimum 6 characters)',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    controller.changePassword.bind(controller)
  );

  fastify.get(
    '/auth/permissions',
    {
      preHandler: fastify.authenticate,
      schema: {
        description: 'Get current user permissions',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    controller.getPermissions.bind(controller)
  );

  fastify.get(
    '/auth/menus',
    {
      preHandler: fastify.authenticate,
      schema: {
        description: 'Get current user visible menus tree',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
    },
    controller.getMenus.bind(controller)
  );
}
