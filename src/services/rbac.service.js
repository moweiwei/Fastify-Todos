export class RbacService {
  constructor(prisma) {
    this.prisma = prisma
  }

  async getUserPermissions(userId) {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    })
    const set = new Set()
    for (const ur of roles) {
      for (const rp of ur.role.permissions) {
        set.add(rp.permission.key)
      }
    }
    return Array.from(set)
  }
}

