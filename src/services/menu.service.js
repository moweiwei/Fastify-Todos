export class MenuService {
  constructor(prisma) {
    this.prisma = prisma
  }

  async list() {
    return await this.prisma.menu.findMany({ orderBy: { order: 'asc' } })
  }

  async getById(id) {
    return await this.prisma.menu.findUnique({ where: { id } })
  }

  async create(data) {
    return await this.prisma.menu.create({ data })
  }

  async update(id, data) {
    return await this.prisma.menu.update({ where: { id }, data })
  }

  async delete(id) {
    await this.prisma.menu.delete({ where: { id } })
  }

  async getRoleMenus(roleId) {
    const rms = await this.prisma.roleMenu.findMany({ where: { roleId }, include: { menu: true } })
    return rms.map((x) => x.menu)
  }

  async setRoleMenus(roleId, menuIds) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.roleMenu.deleteMany({ where: { roleId } })
      if (menuIds.length) {
        await tx.roleMenu.createMany({ data: menuIds.map((mid) => ({ roleId, menuId: mid })) })
      }
      const rms = await tx.roleMenu.findMany({ where: { roleId }, include: { menu: true } })
      return rms.map((x) => x.menu)
    })
  }

  buildTree(menus) {
    const map = new Map()
    menus.forEach((m) => { map.set(m.id, { ...m, children: [] }) })
    const roots = []
    menus.forEach((m) => {
      const node = map.get(m.id)
      if (m.parentId) {
        const parent = map.get(m.parentId)
        if (parent) parent.children.push(node)
        else roots.push(node)
      } else {
        roots.push(node)
      }
    })
    return roots
  }

  toRouteNode(menu, roleCodes) {
    return {
      id: menu.id,
      path: menu.path || '',
      name: menu.name || '',
      component: menu.component || '',
      meta: {
        title: menu.name || '',
        icon: menu.icon || undefined,
        isHide: !!menu.hidden,
        keepAlive: false,
        fixedTab: false,
        roles: roleCodes && roleCodes.length ? roleCodes : undefined,
      },
      children: [],
    }
  }

  buildRouteTree(menus, roleCodesByMenuId) {
    const map = new Map()
    menus.forEach((m) => {
      const roles = roleCodesByMenuId ? (roleCodesByMenuId.get(m.id) || []) : undefined
      map.set(m.id, this.toRouteNode(m, roles))
    })
    const roots = []
    menus.forEach((m) => {
      const node = map.get(m.id)
      if (m.parentId) {
        const parent = map.get(m.parentId)
        if (parent) parent.children.push(node)
        else roots.push(node)
      } else {
        roots.push(node)
      }
    })
    return roots
  }

  async listTree() {
    const menus = await this.list()
    return this.buildRouteTree(menus)
  }
}
