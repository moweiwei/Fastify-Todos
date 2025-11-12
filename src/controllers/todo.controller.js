/**
 * Todo Controller
 * 负责处理 HTTP 请求和响应
 * 调用 Service 层处理业务逻辑
 * 
 * 更新：支持用户认证 - 从 JWT Token 获取用户 ID
 */

import { TodoService } from '../services/todo.service.js';

export class TodoController {
  constructor(fastify) {
    this.todoService = new TodoService(fastify.prisma);
  }

  /**
   * 获取所有 Todos（用户隔离）
   * GET /api/todos
   */
  async getAllTodos(request, reply) {
    try {
      const userId = request.user.id; // 从 JWT Token 获取用户 ID
      const { completed, page, limit } = request.query;
      
      const result = await this.todoService.getAllTodos(userId, { completed, page, limit });

      return reply.code(200).send({
        success: true,
        data: result.data,
        count: result.data.length,
        pagination: result.pagination,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch todos',
      });
    }
  }

  /**
   * 根据 ID 获取单个 Todo（用户隔离）
   * GET /api/todos/:id
   */
  async getTodoById(request, reply) {
    try {
      const userId = request.user.id;
      const { id } = request.params;
      
      const todo = await this.todoService.getTodoById(id, userId);

      if (!todo) {
        return reply.code(404).send({
          success: false,
          error: 'Todo not found',
        });
      }

      return reply.code(200).send({
        success: true,
        data: todo,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch todo',
      });
    }
  }

  /**
   * 创建新的 Todo（关联当前用户）
   * POST /api/todos
   */
  async createTodo(request, reply) {
    try {
      const userId = request.user.id;
      const todo = await this.todoService.createTodo(userId, request.body);

      return reply.code(201).send({
        success: true,
        data: todo,
        message: 'Todo created successfully',
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create todo',
      });
    }
  }

  /**
   * 更新 Todo（用户隔离）
   * PUT /api/todos/:id
   */
  async updateTodo(request, reply) {
    try {
      const userId = request.user.id;
      const { id } = request.params;
      
      // 检查 Todo 是否存在且属于当前用户
      const existingTodo = await this.todoService.getTodoById(id, userId);
      if (!existingTodo) {
        return reply.code(404).send({
          success: false,
          error: 'Todo not found',
        });
      }

      const updateData = request.body || {};
      const hasUpdatableField = ['title', 'description', 'completed'].some(
        (field) => updateData[field] !== undefined,
      );
      if (!hasUpdatableField) {
        return reply.code(400).send({
          success: false,
          error: 'No fields provided for update',
        });
      }

      const todo = await this.todoService.updateTodo(id, userId, updateData);

      return reply.code(200).send({
        success: true,
        data: todo,
        message: 'Todo updated successfully',
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to update todo',
      });
    }
  }

  /**
   * 删除 Todo（用户隔离）
   * DELETE /api/todos/:id
   */
  async deleteTodo(request, reply) {
    try {
      const userId = request.user.id;
      const { id } = request.params;

      // 检查 Todo 是否存在且属于当前用户
      const existingTodo = await this.todoService.getTodoById(id, userId);
      if (!existingTodo) {
        return reply.code(404).send({
          success: false,
          error: 'Todo not found',
        });
      }

      await this.todoService.deleteTodo(id, userId);

      return reply.code(200).send({
        success: true,
        message: 'Todo deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete todo',
      });
    }
  }

  /**
   * 切换 Todo 完成状态（用户隔离）
   * PATCH /api/todos/:id/toggle
   */
  async toggleTodoComplete(request, reply) {
    try {
      const userId = request.user.id;
      const { id } = request.params;

      // 检查 Todo 是否存在且属于当前用户
      const existingTodo = await this.todoService.getTodoById(id, userId);
      if (!existingTodo) {
        return reply.code(404).send({
          success: false,
          error: 'Todo not found',
        });
      }

      const todo = await this.todoService.toggleTodoComplete(id, userId);

      return reply.code(200).send({
        success: true,
        data: todo,
        message: 'Todo status toggled successfully',
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to toggle todo status',
      });
    }
  }
}
