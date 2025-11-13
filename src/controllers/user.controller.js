import { UserService } from '../services/user.service.js'

export class UserController {
  constructor(fastify) {
    this.userService = new UserService(fastify.prisma)
    this.fastify = fastify
  }

  async getUsers(request, reply) {
    try {
      const { page = 1, limit = 10, email, username } = request.query
      const { items, total, pagination } = await this.userService.listUsers({ page, limit, email, username })
      return reply.code(200).send({ success: true, data: items, count: total, pagination })
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send({ success: false, error: 'Failed to get users' })
    }
  }

  async getUserById(request, reply) {
    try {
      const id = Number(request.params.id)
      const user = await this.userService.getUserById(id)
      if (!user) return reply.code(404).send({ success: false, error: 'User not found' })
      return reply.code(200).send({ success: true, data: user })
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send({ success: false, error: 'Failed to get user' })
    }
  }

  async createUser(request, reply) {
    try {
      const { email, username, password, name } = request.body
      const user = await this.userService.createUser({ email, username, password, name })
      return reply.code(201).send({ success: true, message: 'User created', data: user })
    } catch (error) {
      request.log.error(error)
      if (error.message.includes('already exists')) {
        return reply.code(409).send({ success: false, error: error.message })
      }
      return reply.code(500).send({ success: false, error: 'Failed to create user' })
    }
  }

  async updateUser(request, reply) {
    try {
      const id = Number(request.params.id)
      const data = request.body
      const user = await this.userService.updateUser(id, data)
      return reply.code(200).send({ success: true, message: 'User updated', data: user })
    } catch (error) {
      request.log.error(error)
      if (error.message.includes('already exists')) {
        return reply.code(409).send({ success: false, error: error.message })
      }
      return reply.code(500).send({ success: false, error: 'Failed to update user' })
    }
  }

  async deleteUser(request, reply) {
    try {
      const id = Number(request.params.id)
      await this.userService.deleteUser(id)
      return reply.code(200).send({ success: true, message: 'User deleted' })
    } catch (error) {
      request.log.error(error)
      if (error.code === 'P2025') {
        return reply.code(404).send({ success: false, error: 'User not found' })
      }
      return reply.code(500).send({ success: false, error: 'Failed to delete user' })
    }
  }
}

