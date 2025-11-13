export class RoleService {
  constructor(prisma) {
    this.prisma = prisma
  }

  async list({ page = 1, limit = 10 }) {
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      this.prisma.role.findMany({ skip, take: limit, orderBy: { id: 'desc' } }),
      this.prisma.role.count(),
    ])
    const totalPages = Math.ceil(total / limit)
    return { items, total, pagination: { page, limit, total, totalPages } }
  }

  async getById(id) {
    return await this.prisma.role.findUnique({ where: { id } })
  }

  async create(data) {
    return await this.prisma.role.create({ data })
  }

  async update(id, data) {
    return await this.prisma.role.update({ where: { id }, data })
  }

  async delete(id) {
    await this.prisma.role.delete({ where: { id } })
  }

  async getPermissions(roleId) {
    const rps = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    })
    return rps.map((x) => x.permission)
  }

  async setPermissions(roleId, permissionKeys) {
    return await this.prisma.$transaction(async (tx) => {
      const perms = await tx.permission.findMany({ where: { key: { in: permissionKeys } } })
      await tx.rolePermission.deleteMany({ where: { roleId } })
      if (perms.length) {
        await tx.rolePermission.createMany({ data: perms.map((p) => ({ roleId, permissionId: p.id })) })
      }
      const rps = await tx.rolePermission.findMany({ where: { roleId }, include: { permission: true } })
      return rps.map((x) => x.permission)
    })
  }

  async getUserRoles(userId) {
    const urs = await this.prisma.userRole.findMany({ where: { userId }, include: { role: true } })
    return urs.map((x) => x.role)
  }

  async setUserRoles(userId, roleIds) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } })
      if (roleIds.length) {
        await tx.userRole.createMany({ data: roleIds.map((rid) => ({ userId, roleId: rid })) })
      }
      const urs = await tx.userRole.findMany({ where: { userId }, include: { role: true } })
      return urs.map((x) => x.role)
    })
  }
}
