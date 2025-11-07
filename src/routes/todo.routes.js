/**
 * Todo Routes
 * 定义所有 Todo 相关的路由和请求验证 Schema
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
    },
  },
};

export default async function todoRoutes(fastify, options) {
  const controller = new TodoController(fastify);

  // GET /api/todos - 获取所有 Todos
  fastify.get('/todos', {
    schema: {
      description: 'Get all todos',
      tags: ['todos'],
      querystring: {
        type: 'object',
        properties: {
          completed: { type: 'string', enum: ['true', 'false'] },
        },
      },
      response: listResponseSchema,
    },
  }, controller.getAllTodos.bind(controller));

  // GET /api/todos/:id - 获取单个 Todo
  fastify.get('/todos/:id', {
    schema: {
      description: 'Get a todo by ID',
      tags: ['todos'],
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

  // POST /api/todos - 创建新 Todo
  fastify.post('/todos', {
    schema: {
      description: 'Create a new todo',
      tags: ['todos'],
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

  // PUT /api/todos/:id - 更新 Todo
  fastify.put('/todos/:id', {
    schema: {
      description: 'Update a todo',
      tags: ['todos'],
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
      },
      response: responseSchema,
    },
  }, controller.updateTodo.bind(controller));

  // DELETE /api/todos/:id - 删除 Todo
  fastify.delete('/todos/:id', {
    schema: {
      description: 'Delete a todo',
      tags: ['todos'],
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

  // PATCH /api/todos/:id/toggle - 切换完成状态
  fastify.patch('/todos/:id/toggle', {
    schema: {
      description: 'Toggle todo completion status',
      tags: ['todos'],
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