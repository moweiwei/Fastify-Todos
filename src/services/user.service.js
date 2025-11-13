import bcrypt from 'bcrypt'

export class UserService {
  constructor(prisma) {
    this.prisma = prisma
    this.saltRounds = 10
  }

  async listUsers({ page = 1, limit = 10, email, username }) {
    const where = {}
    if (email) where.email = { contains: email }
    if (username) where.username = { contains: username }

    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    return { items, total, pagination: { page, limit, total, totalPages } }
  }

  async getUserById(id) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async createUser({ email, username, password, name }) {
    const existingEmail = await this.prisma.user.findUnique({ where: { email } })
    if (existingEmail) throw new Error('Email already exists')

    const existingUsername = await this.prisma.user.findUnique({ where: { username } })
    if (existingUsername) throw new Error('Username already exists')

    const hashedPassword = await bcrypt.hash(password, this.saltRounds)

    return await this.prisma.user.create({
      data: { email, username, password: hashedPassword, name: name || null },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async updateUser(id, data) {
    const updateData = {}
    if (data.name !== undefined) updateData.name = data.name

    if (data.email !== undefined) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } })
      if (existing && existing.id !== id) throw new Error('Email already exists')
      updateData.email = data.email
    }

    if (data.username !== undefined) {
      const existing = await this.prisma.user.findUnique({ where: { username: data.username } })
      if (existing && existing.id !== id) throw new Error('Username already exists')
      updateData.username = data.username
    }

    if (data.password !== undefined) {
      const hashedPassword = await bcrypt.hash(data.password, this.saltRounds)
      updateData.password = hashedPassword
    }

    return await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async deleteUser(id) {
    await this.prisma.user.delete({ where: { id } })
  }
}

