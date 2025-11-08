/**
 * Todo Service
 * 负责所有与数据库交互的业务逻辑
 * 使用 Prisma Client 进行数据库操作
 */

export class TodoService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * 获取所有 Todos
   * @param {Object} filters - 过滤条件
   * @param {boolean} filters.completed - 是否完成
   * @returns {Promise<Object>} 包含数据和分页信息
   */
  async getAllTodos(filters = {}) {
    const where = {};
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
   * 根据 ID 获取单个 Todo
   * @param {number} id - Todo ID
   * @returns {Promise<Object|null>} Todo 对象或 null
   */
  async getTodoById(id) {
    return await this.prisma.todo.findUnique({
      where: { id: parseInt(id) },
    });
  }

  /**
   * 创建新的 Todo
   * @param {Object} data - Todo 数据
   * @param {string} data.title - 标题
   * @param {string} data.description - 描述
   * @returns {Promise<Object>} 创建的 Todo
   */
  async createTodo(data) {
    return await this.prisma.todo.create({
      data: {
        title: data.title,
        description: data.description || null,
        completed: false,
      },
    });
  }

  /**
   * 更新 Todo
   * @param {number} id - Todo ID
   * @param {Object} data - 更新的数据
   * @returns {Promise<Object>} 更新后的 Todo
   */
  async updateTodo(id, data) {
    return await this.prisma.todo.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.completed !== undefined && { completed: data.completed }),
      },
    });
  }

  /**
   * 删除 Todo
   * @param {number} id - Todo ID
   * @returns {Promise<Object>} 删除的 Todo
   */
  async deleteTodo(id) {
    return await this.prisma.todo.delete({
      where: { id: parseInt(id) },
    });
  }

  /**
   * 切换 Todo 完成状态
   * @param {number} id - Todo ID
   * @returns {Promise<Object>} 更新后的 Todo
   */
  async toggleTodoComplete(id) {
    const todo = await this.getTodoById(id);
    if (!todo) {
      throw new Error('Todo not found');
    }

    return await this.prisma.todo.update({
      where: { id: parseInt(id) },
      data: {
        completed: !todo.completed,
      },
    });
  }
}
