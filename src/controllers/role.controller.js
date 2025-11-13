import { RoleService } from '../services/role.service.js'

export class RoleController {
  constructor(fastify) {
    this.service = new RoleService(fastify.prisma)
  }

  async list(request, reply) {
    try {
      const { page = 1, limit = 10 } = request.query
      const { items, total, pagination } = await this.service.list({ page, limit })
      return reply.code(200).send({ success: true, data: items, count: total, pagination })
    } catch (e) {
      return reply.code(500).send({ success: false, error: 'Failed to get roles' })
    }
  }

  async getById(request, reply) {
    const id = Number(request.params.id)
    const role = await this.service.getById(id)
    if (!role) return reply.code(404).send({ success: false, error: 'Role not found' })
    return reply.code(200).send({ success: true, data: role })
  }

  async create(request, reply) {
    try {
      const role = await this.service.create(request.body)
      return reply.code(201).send({ success: true, message: 'Role created', data: role })
    } catch (e) {
      if (e.message?.includes('Unique')) return reply.code(409).send({ success: false, error: 'Role code exists' })
      return reply.code(500).send({ success: false, error: 'Failed to create role' })
    }
  }

  async update(request, reply) {
    try {
      const id = Number(request.params.id)
      const role = await this.service.update(id, request.body)
      return reply.code(200).send({ success: true, message: 'Role updated', data: role })
    } catch (e) {
      return reply.code(500).send({ success: false, error: 'Failed to update role' })
    }
  }

  async delete(request, reply) {
    try {
      const id = Number(request.params.id)
      await this.service.delete(id)
      return reply.code(200).send({ success: true, message: 'Role deleted' })
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ success: false, error: 'Role not found' })
      return reply.code(500).send({ success: false, error: 'Failed to delete role' })
    }
  }

  async getPermissions(request, reply) {
    const id = Number(request.params.id)
    const perms = await this.service.getPermissions(id)
    return reply.code(200).send({ success: true, data: perms })
  }

  async setPermissions(request, reply) {
    const id = Number(request.params.id)
    const { keys } = request.body
    const perms = await this.service.setPermissions(id, keys || [])
    try { await request.server.permissionsInvalidate() } catch {}
    return reply.code(200).send({ success: true, message: 'Role permissions updated', data: perms })
  }

  async getUserRoles(request, reply) {
    const userId = Number(request.params.id)
    const roles = await this.service.getUserRoles(userId)
    return reply.code(200).send({ success: true, data: roles })
  }

  async setUserRoles(request, reply) {
    const userId = Number(request.params.id)
    const { roleIds } = request.body
    const roles = await this.service.setUserRoles(userId, roleIds || [])
    try { await request.server.permissionsInvalidate(userId) } catch {}
    return reply.code(200).send({ success: true, message: 'User roles updated', data: roles })
  }
}
