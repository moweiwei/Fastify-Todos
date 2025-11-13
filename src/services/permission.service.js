export class PermissionService {
  constructor(prisma) {
    this.prisma = prisma
  }

  async list({ page = 1, limit = 20 }) {
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      this.prisma.permission.findMany({ skip, take: limit, orderBy: { id: 'desc' } }),
      this.prisma.permission.count(),
    ])
    const totalPages = Math.ceil(total / limit)
    return { items, total, pagination: { page, limit, total, totalPages } }
  }

  async getById(id) {
    return await this.prisma.permission.findUnique({ where: { id } })
  }

  async create(data) {
    return await this.prisma.permission.create({ data })
  }

  async update(id, data) {
    return await this.prisma.permission.update({ where: { id }, data })
  }

  async delete(id) {
    await this.prisma.permission.delete({ where: { id } })
  }

  async getForUser(userId) {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    })
    const set = new Set()
    for (const ur of roles) {
      for (const rp of ur.role.permissions) set.add(rp.permission.key)
    }
    return Array.from(set)
  }
}

