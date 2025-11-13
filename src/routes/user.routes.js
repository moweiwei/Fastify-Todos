import { UserController } from '../controllers/user.controller.js'

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
}

const listResponseSchema = {
  200: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: { type: 'array', items: userSchema },
      count: { type: 'integer' },
      pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
        required: ['page', 'limit', 'total', 'totalPages'],
      },
    },
  },
}

const singleResponseSchema = {
  200: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: userSchema,
    },
  },
  404: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      error: { type: 'string' },
    },
  },
}

export default async function userRoutes(fastify) {
  const controller = new UserController(fastify)

  fastify.get('/users', {
    preHandler: [fastify.authenticate, fastify.authorize('users:list')],
    schema: {
      description: 'Get users with pagination and filters',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          username: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        },
      },
      response: listResponseSchema,
    },
  }, controller.getUsers.bind(controller))

  fastify.get('/users/:id', {
    preHandler: [fastify.authenticate, fastify.authorize('users:read')],
    schema: {
      description: 'Get user by ID',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer', minimum: 1 } },
      },
      response: singleResponseSchema,
    },
  }, controller.getUserById.bind(controller))

  fastify.post('/users', {
    preHandler: [fastify.authenticate, fastify.authorize('users:create')],
    schema: {
      description: 'Create user',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['email', 'username', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string', minLength: 3, maxLength: 30, pattern: '^[a-zA-Z0-9_]+' },
          password: { type: 'string', minLength: 6, maxLength: 100 },
          name: { type: 'string', maxLength: 100 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: userSchema,
          },
        },
        409: {
          type: 'object',
          properties: { success: { type: 'boolean' }, error: { type: 'string' } },
        },
      },
    },
  }, controller.createUser.bind(controller))

  fastify.put('/users/:id', {
    preHandler: [fastify.authenticate, fastify.authorize('users:update')],
    schema: {
      description: 'Update user',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer', minimum: 1 } },
      },
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string', minLength: 3, maxLength: 30, pattern: '^[a-zA-Z0-9_]+' },
          password: { type: 'string', minLength: 6, maxLength: 100 },
          name: { type: 'string', maxLength: 100 },
        },
        minProperties: 1,
      },
      response: {
        200: {
          type: 'object',
          properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: userSchema },
        },
        409: {
          type: 'object',
          properties: { success: { type: 'boolean' }, error: { type: 'string' } },
        },
      },
    },
  }, controller.updateUser.bind(controller))

  fastify.patch('/users/:id', {
    preHandler: [fastify.authenticate, fastify.authorize('users:update')],
    schema: {
      description: 'Partially update user',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer', minimum: 1 } },
      },
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string', minLength: 3, maxLength: 30, pattern: '^[a-zA-Z0-9_]+' },
          password: { type: 'string', minLength: 6, maxLength: 100 },
          name: { type: 'string', maxLength: 100 },
        },
        minProperties: 1,
      },
      response: {
        200: {
          type: 'object',
          properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: userSchema },
        },
        409: {
          type: 'object',
          properties: { success: { type: 'boolean' }, error: { type: 'string' } },
        },
      },
    },
  }, controller.updateUser.bind(controller))

  fastify.delete('/users/:id', {
    preHandler: [fastify.authenticate, fastify.authorize('users:delete')],
    schema: {
      description: 'Delete user',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer', minimum: 1 } },
      },
      response: {
        200: {
          type: 'object',
          properties: { success: { type: 'boolean' }, message: { type: 'string' } },
        },
        404: {
          type: 'object',
          properties: { success: { type: 'boolean' }, error: { type: 'string' } },
        },
      },
    },
  }, controller.deleteUser.bind(controller))
}
