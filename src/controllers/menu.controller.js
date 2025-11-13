import { MenuService } from '../services/menu.service.js'

export class MenuController {
  constructor(fastify) {
    this.service = new MenuService(fastify.prisma)
  }

  async list(request, reply) {
    const items = await this.service.list()
    return reply.code(200).send({ success: true, data: items })
  }

  async listTree(request, reply) {
    const tree = await this.service.listTree()
    return reply.code(200).send({ success: true, data: tree })
  }

  async getById(request, reply) {
    const id = Number(request.params.id)
    const menu = await this.service.getById(id)
    if (!menu) return reply.code(404).send({ success: false, error: 'Menu not found' })
    return reply.code(200).send({ success: true, data: menu })
  }

  async create(request, reply) {
    const menu = await this.service.create(request.body)
    return reply.code(201).send({ success: true, message: 'Menu created', data: menu })
  }

  async update(request, reply) {
    const id = Number(request.params.id)
    const menu = await this.service.update(id, request.body)
    return reply.code(200).send({ success: true, message: 'Menu updated', data: menu })
  }

  async delete(request, reply) {
    try {
      const id = Number(request.params.id)
      await this.service.delete(id)
      return reply.code(200).send({ success: true, message: 'Menu deleted' })
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ success: false, error: 'Menu not found' })
      return reply.code(500).send({ success: false, error: 'Failed to delete menu' })
    }
  }

  async getRoleMenus(request, reply) {
    const roleId = Number(request.params.id)
    const menus = await this.service.getRoleMenus(roleId)
    return reply.code(200).send({ success: true, data: menus })
  }

  async setRoleMenus(request, reply) {
    const roleId = Number(request.params.id)
    const { menuIds } = request.body
    const menus = await this.service.setRoleMenus(roleId, menuIds || [])
    return reply.code(200).send({ success: true, message: 'Role menus updated', data: menus })
  }
}

