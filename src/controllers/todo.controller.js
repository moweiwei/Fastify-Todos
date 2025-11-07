/**
 * Todo Controller
 * 负责处理 HTTP 请求和响应
 * 调用 Service 层处理业务逻辑
 */

import { TodoService } from '../services/todo.service.js';

export class TodoController {
  constructor(fastify) {
    this.todoService = new TodoService(fastify.prisma);
  }

  /**
   * 获取所有 Todos
   * GET /api/todos
   */
  async getAllTodos(request, reply) {
    try {
      const { completed } = request.query;
      const todos = await this.todoService.getAllTodos({ completed });
      
      return reply.code(200).send({
        success: true,
        data: todos,
        count: todos.length,
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
   * 根据 ID 获取单个 Todo
   * GET /api/todos/:id
   */
  async getTodoById(request, reply) {
    try {
      const { id } = request.params;
      const todo = await this.todoService.getTodoById(id);

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
   * 创建新的 Todo
   * POST /api/todos
   */
  async createTodo(request, reply) {
    try {
      const todo = await this.todoService.createTodo(request.body);

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
   * 更新 Todo
   * PUT /api/todos/:id
   */
  async updateTodo(request, reply) {
    try {
      const { id } = request.params;
      
      // 检查 Todo 是否存在
      const existingTodo = await this.todoService.getTodoById(id);
      if (!existingTodo) {
        return reply.code(404).send({
          success: false,
          error: 'Todo not found',
        });
      }

      const todo = await this.todoService.updateTodo(id, request.body);

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
   * 删除 Todo
   * DELETE /api/todos/:id
   */
  async deleteTodo(request, reply) {
    try {
      const { id } = request.params;

      // 检查 Todo 是否存在
      const existingTodo = await this.todoService.getTodoById(id);
      if (!existingTodo) {
        return reply.code(404).send({
          success: false,
          error: 'Todo not found',
        });
      }

      await this.todoService.deleteTodo(id);

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
   * 切换 Todo 完成状态
   * PATCH /api/todos/:id/toggle
   */
  async toggleTodoComplete(request, reply) {
    try {
      const { id } = request.params;

      // 检查 Todo 是否存在
      const existingTodo = await this.todoService.getTodoById(id);
      if (!existingTodo) {
        return reply.code(404).send({
          success: false,
          error: 'Todo not found',
        });
      }

      const todo = await this.todoService.toggleTodoComplete(id);

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