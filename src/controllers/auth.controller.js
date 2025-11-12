/**
 * 认证控制器层
 * 作用：处理认证相关的 HTTP 请求和响应
 * 功能：注册、登录、刷新 Token、登出、获取用户信息、修改密码
 */

import { AuthService } from '../services/auth.service.js';

export class AuthController {
  constructor(fastify) {
    this.authService = new AuthService(fastify.prisma);
    this.fastify = fastify;
  }

  /**
   * 用户注册
   * POST /api/auth/register
   */
  async register(request, reply) {
    try {
      const { email, username, password, name } = request.body;

      // 1. 调用 Service 创建用户
      const user = await this.authService.register({
        email,
        username,
        password,
        name,
      });

      // 2. 生成 JWT Tokens
      const accessToken = await this.fastify.jwtSign({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      const refreshToken = await this.fastify.jwtRefreshSign({
        id: user.id,
      });

      // 3. 存储 Refresh Token 到数据库
      await this.authService.createRefreshToken(user.id, refreshToken);

      // 4. 返回成功响应
      return reply.code(201).send({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: 900, // 15分钟 = 900秒
          },
        },
      });
    } catch (error) {
      request.log.error(error);

      // 处理特定错误
      if (error.message.includes('already exists')) {
        return reply.code(409).send({
          success: false,
          error: error.message,
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to register user',
      });
    }
  }

  /**
   * 用户登录
   * POST /api/auth/login
   */
  async login(request, reply) {
    try {
      const { emailOrUsername, password } = request.body;

      // 1. 验证用户凭证
      const user = await this.authService.login(emailOrUsername, password);

      // 2. 生成 JWT Tokens
      const accessToken = await this.fastify.jwtSign({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      const refreshToken = await this.fastify.jwtRefreshSign({
        id: user.id,
      });

      // 3. 存储 Refresh Token 到数据库
      await this.authService.createRefreshToken(user.id, refreshToken);

      // 4. 返回成功响应
      return reply.code(200).send({
        success: true,
        message: 'Login successful',
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: 900, // 15分钟
          },
        },
      });
    } catch (error) {
      request.log.error(error);

      // 处理认证失败
      if (error.message === 'Invalid credentials') {
        return reply.code(401).send({
          success: false,
          error: 'Invalid email/username or password',
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to login',
      });
    }
  }

  /**
   * 刷新 Access Token
   * POST /api/auth/refresh
   */
  async refreshToken(request, reply) {
    try {
      const { refreshToken } = request.body;

      // 1. 验证 Refresh Token
      const decoded = await this.fastify.jwtRefreshVerify(refreshToken);

      // 2. 检查 Token 是否在数据库中且未过期
      const tokenRecord = await this.authService.validateRefreshToken(refreshToken);
      if (!tokenRecord) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid or expired refresh token',
        });
      }

      // 3. 生成新的 Access Token
      const newAccessToken = await this.fastify.jwtSign({
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        username: tokenRecord.user.username,
      });

      // 4. 返回新的 Access Token
      return reply.code(200).send({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          tokenType: 'Bearer',
          expiresIn: 900,
        },
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(401).send({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    }
  }

  /**
   * 用户登出
   * POST /api/auth/logout
   */
  async logout(request, reply) {
    try {
      const { refreshToken } = request.body;

      // 删除 Refresh Token
      await this.authService.revokeRefreshToken(refreshToken);

      return reply.code(200).send({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to logout',
      });
    }
  }

  /**
   * 全部登出（撤销所有 Refresh Token）
   * POST /api/auth/logout-all
   */
  async logoutAll(request, reply) {
    try {
      const userId = request.user.id;

      // 删除用户的所有 Refresh Token
      await this.authService.revokeAllRefreshTokens(userId);

      return reply.code(200).send({
        success: true,
        message: 'Logged out from all devices',
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to logout from all devices',
      });
    }
  }

  /**
   * 获取当前用户信息
   * GET /api/auth/me
   */
  async getCurrentUser(request, reply) {
    try {
      const userId = request.user.id;

      // 获取用户信息
      const user = await this.authService.getUserById(userId);

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found',
        });
      }

      return reply.code(200).send({
        success: true,
        data: user,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to get user information',
      });
    }
  }

  /**
   * 更新用户信息
   * PATCH /api/auth/me
   */
  async updateCurrentUser(request, reply) {
    try {
      const userId = request.user.id;
      const updateData = request.body;

      // 更新用户信息
      const user = await this.authService.updateUser(userId, updateData);

      return reply.code(200).send({
        success: true,
        message: 'User information updated successfully',
        data: user,
      });
    } catch (error) {
      request.log.error(error);

      if (error.message.includes('already exists')) {
        return reply.code(409).send({
          success: false,
          error: error.message,
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to update user information',
      });
    }
  }

  /**
   * 修改密码
   * POST /api/auth/change-password
   */
  async changePassword(request, reply) {
    try {
      const userId = request.user.id;
      const { oldPassword, newPassword } = request.body;

      // 修改密码
      await this.authService.changePassword(userId, oldPassword, newPassword);

      return reply.code(200).send({
        success: true,
        message: 'Password changed successfully. Please login again.',
      });
    } catch (error) {
      request.log.error(error);

      if (error.message === 'Invalid old password') {
        return reply.code(401).send({
          success: false,
          error: 'Invalid old password',
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to change password',
      });
    }
  }
}