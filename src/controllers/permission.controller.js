import { PermissionService } from '../services/permission.service.js'

export class PermissionController {
  constructor(fastify) {
    this.service = new PermissionService(fastify.prisma)
  }

  async list(request, reply) {
    try {
      const { page = 1, limit = 20 } = request.query
      const { items, total, pagination } = await this.service.list({ page, limit })
      return reply.code(200).send({ success: true, data: items, count: total, pagination })
    } catch (e) {
      return reply.code(500).send({ success: false, error: 'Failed to get permissions' })
    }
  }

  async getById(request, reply) {
    const id = Number(request.params.id)
    const perm = await this.service.getById(id)
    if (!perm) return reply.code(404).send({ success: false, error: 'Permission not found' })
    return reply.code(200).send({ success: true, data: perm })
  }

  async create(request, reply) {
    try {
      const perm = await this.service.create(request.body)
      return reply.code(201).send({ success: true, message: 'Permission created', data: perm })
    } catch (e) {
      if (e.message?.includes('Unique')) return reply.code(409).send({ success: false, error: 'Permission key exists' })
      return reply.code(500).send({ success: false, error: 'Failed to create permission' })
    }
  }

  async update(request, reply) {
    try {
      const id = Number(request.params.id)
      const perm = await this.service.update(id, request.body)
      return reply.code(200).send({ success: true, message: 'Permission updated', data: perm })
    } catch (e) {
      return reply.code(500).send({ success: false, error: 'Failed to update permission' })
    }
  }

  async delete(request, reply) {
    try {
      const id = Number(request.params.id)
      await this.service.delete(id)
      return reply.code(200).send({ success: true, message: 'Permission deleted' })
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ success: false, error: 'Permission not found' })
      return reply.code(500).send({ success: false, error: 'Failed to delete permission' })
    }
  }
}

