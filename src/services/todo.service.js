/**
 * Todo Service
 * 负责所有与数据库交互的业务逻辑
 * 使用 Prisma Client 进行数据库操作
 * 
 * 更新：支持用户隔离 - 每个用户只能访问自己的 Todos
 */

export class TodoService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * 获取所有 Todos（用户隔离）
   * @param {number} userId - 用户 ID
   * @param {Object} filters - 过滤条件
   * @param {boolean} filters.completed - 是否完成
   * @param {number} filters.page - 当前页码
   * @param {number} filters.limit - 每页数量
   * @returns {Promise<Object>} 包含数据和分页信息
   */
  async getAllTodos(userId, filters = {}) {
    const where = { userId }; // 添加用户隔离
    const { completed, page = 1, limit = 10 } = filters;

    if (completed !== undefined) {
      where.completed = completed === 'true' || completed === true;
    }

    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);

    const normalizedPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const normalizedLimit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 100);

    const skip = (normalizedPage - 1) * normalizedLimit;

    const [todos, total] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        skip,
        take: normalizedLimit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.todo.count({ where }),
    ]);

    return {
      data: todos,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        totalPages: normalizedLimit === 0 ? 0 : Math.ceil(total / normalizedLimit),
      },
    };
  }

  /**
   * 根据 ID 获取单个 Todo（用户隔离）
   * @param {number} id - Todo ID
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object|null>} Todo 对象或 null
   */
  async getTodoById(id, userId) {
    return await this.prisma.todo.findFirst({
      where: {
        id: parseInt(id),
        userId, // 确保只能访问自己的 Todo
      },
    });
  }

  /**
   * 创建新的 Todo（关联用户）
   * @param {number} userId - 用户 ID
   * @param {Object} data - Todo 数据
   * @param {string} data.title - 标题
   * @param {string} data.description - 描述
   * @returns {Promise<Object>} 创建的 Todo
   */
  async createTodo(userId, data) {
    return await this.prisma.todo.create({
      data: {
        title: data.title,
        description: data.description || null,
        completed: false,
        userId, // 关联到当前用户
      },
    });
  }

  /**
   * 更新 Todo（用户隔离）
   * @param {number} id - Todo ID
   * @param {number} userId - 用户 ID
   * @param {Object} data - 更新的数据
   * @returns {Promise<Object>} 更新后的 Todo
   */
  async updateTodo(id, userId, data) {
    return await this.prisma.todo.update({
      where: {
        id: parseInt(id),
        userId, // 确保只能更新自己的 Todo
      },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.completed !== undefined && { completed: data.completed }),
      },
    });
  }

  /**
   * 删除 Todo（用户隔离）
   * @param {number} id - Todo ID
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object>} 删除的 Todo
   */
  async deleteTodo(id, userId) {
    return await this.prisma.todo.delete({
      where: {
        id: parseInt(id),
        userId, // 确保只能删除自己的 Todo
      },
    });
  }

  /**
   * 切换 Todo 完成状态（用户隔离）
   * @param {number} id - Todo ID
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object>} 更新后的 Todo
   */
  async toggleTodoComplete(id, userId) {
    const todo = await this.getTodoById(id, userId);
    if (!todo) {
      throw new Error('Todo not found');
    }

    return await this.prisma.todo.update({
      where: {
        id: parseInt(id),
        userId,
      },
      data: {
        completed: !todo.completed,
      },
    });
  }
}
