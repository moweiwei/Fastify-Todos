/**
 * 认证服务层
 * 作用：处理用户注册、登录、Token 刷新等业务逻辑
 * 企业级特性：
 * - bcrypt 密码加密
 * - Refresh Token 数据库存储
 * - Token 过期管理
 * - 安全的密码验证
 */

import bcrypt from 'bcrypt';

export class AuthService {
  constructor(prisma) {
    this.prisma = prisma;
    this.saltRounds = 10; // bcrypt 加密强度
  }

  /**
   * 用户注册
   * @param {Object} data - 注册数据
   * @param {string} data.email - 邮箱
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   * @param {string} data.name - 姓名（可选）
   * @returns {Promise<Object>} 创建的用户（不含密码）
   */
  async register(data) {
    const { email, username, password, name } = data;

    // 1. 检查邮箱是否已存在
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // 2. 检查用户名是否已存在
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // 3. 加密密码
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // 4. 创建用户
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // 不返回密码
      },
    });

    return user;
  }

  /**
   * 用户登录
   * @param {string} emailOrUsername - 邮箱或用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 用户信息（不含密码）
   */
  async login(emailOrUsername, password) {
    // 1. 查找用户（支持邮箱或用户名登录）
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 3. 返回用户信息（不含密码）
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * 创建 Refresh Token 并存储到数据库
   * @param {number} userId - 用户 ID
   * @param {string} token - Refresh Token
   * @returns {Promise<Object>} 创建的 RefreshToken 记录
   */
  async createRefreshToken(userId, token) {
    // 设置过期时间为 7 天后
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  /**
   * 验证 Refresh Token
   * @param {string} token - Refresh Token
   * @returns {Promise<Object|null>} RefreshToken 记录（包含用户信息）
   */
  async validateRefreshToken(token) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // 检查 token 是否存在且未过期
    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      return null;
    }

    return refreshToken;
  }

  /**
   * 删除 Refresh Token（登出）
   * @param {string} token - Refresh Token
   * @returns {Promise<void>}
   */
  async revokeRefreshToken(token) {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  /**
   * 删除用户的所有 Refresh Token（全部登出）
   * @param {number} userId - 用户 ID
   * @returns {Promise<void>}
   */
  async revokeAllRefreshTokens(userId) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * 清理过期的 Refresh Token
   * @returns {Promise<number>} 删除的记录数
   */
  async cleanupExpiredTokens() {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  /**
   * 根据 ID 获取用户信息
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object|null>} 用户信息（不含密码）
   */
  async getUserById(userId) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * 更新用户信息
   * @param {number} userId - 用户 ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的用户信息
   */
  async updateUser(userId, data) {
    const updateData = {};

    // 只更新提供的字段
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) {
      // 检查新邮箱是否已被使用
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== userId) {
        throw new Error('Email already exists');
      }
      updateData.email = data.email;
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * 修改密码
   * @param {number} userId - 用户 ID
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<void>}
   */
  async changePassword(userId, oldPassword, newPassword) {
    // 1. 获取用户
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 2. 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid old password');
    }

    // 3. 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

    // 4. 更新密码
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // 5. 撤销所有 Refresh Token（强制重新登录）
    await this.revokeAllRefreshTokens(userId);
  }
}