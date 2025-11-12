/**
 * Todo Routes
 * 定义所有 Todo 相关的路由和请求验证 Schema
 *
 * 更新：所有路由都需要 JWT 认证
 */

import { TodoController } from '../controllers/todo.controller.js';

// Fastify Schema 定义
const todoSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    description: { type: 'string', nullable: true },
    completed: { type: 'boolean' },
    userId: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const responseSchema = {
  200: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: todoSchema,
    },
  },
  404: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      error: { type: 'string' },
    },
  },
};

const listResponseSchema = {
  200: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'array',
        items: todoSchema,
      },
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
};

export default async function todoRoutes(fastify, options) {
  const controller = new TodoController(fastify);

  // GET /api/todos - 获取所有 Todos（需要认证）
  fastify.get('/todos', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Get all todos for authenticated user',
      tags: ['todos'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          completed: { type: 'string', enum: ['true', 'false'] },
          page: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
          },
        },
      },
      response: listResponseSchema,
    },
  }, controller.getAllTodos.bind(controller));

  // GET /api/todos/:id - 获取单个 Todo（需要认证）
  fastify.get('/todos/:id', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Get a todo by ID for authenticated user',
      tags: ['todos'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer', minimum: 1 },
        },
      },
      response: responseSchema,
    },
  }, controller.getTodoById.bind(controller));

  // POST /api/todos - 创建新 Todo（需要认证）
  fastify.post('/todos', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Create a new todo for authenticated user',
      tags: ['todos'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 1000 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: todoSchema,
            message: { type: 'string' },
          },
        },
      },
    },
  }, controller.createTodo.bind(controller));

  // PUT /api/todos/:id - 更新 Todo（需要认证）
  fastify.put('/todos/:id', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Update a todo for authenticated user',
      tags: ['todos'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer', minimum: 1 },
        },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 1000 },
          completed: { type: 'boolean' },
        },
        minProperties: 1,
      },
      response: responseSchema,
    },
  }, controller.updateTodo.bind(controller));

  // PATCH /api/todos/:id - 部分更新 Todo（需要认证）
  fastify.patch('/todos/:id', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Partially update a todo for authenticated user',
      tags: ['todos'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer', minimum: 1 },
        },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 1000 },
          completed: { type: 'boolean' },
        },
        minProperties: 1,
      },
      response: responseSchema,
    },
  }, controller.updateTodo.bind(controller));

  // DELETE /api/todos/:id - 删除 Todo（需要认证）
  fastify.delete('/todos/:id', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Delete a todo for authenticated user',
      tags: ['todos'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer', minimum: 1 },
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
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
  }, controller.deleteTodo.bind(controller));

  // PATCH /api/todos/:id/toggle - 切换完成状态（需要认证）
  fastify.patch('/todos/:id/toggle', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Toggle todo completion status for authenticated user',
      tags: ['todos'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer', minimum: 1 },
        },
      },
      response: responseSchema,
    },
  }, controller.toggleTodoComplete.bind(controller));
}
