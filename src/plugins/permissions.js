import fp from 'fastify-plugin'

async function permissionsPlugin(fastify) {
  const cache = new Map()

  async function loadPermissions(userId) {
    const roles = await fastify.prisma.userRole.findMany({
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
    const arr = Array.from(set)
    cache.set(userId, arr)
    return arr
  }

  fastify.decorate('authorize', function (required) {
    return async function (request, reply) {
      try {
        const userId = request.user?.id
        if (!userId) {
          return reply.code(401).send({ success: false, error: 'Unauthorized' })
        }
        let perms = cache.get(userId)
        if (!perms) perms = await loadPermissions(userId)
        if (!perms.includes(required)) {
          return reply.code(403).send({ success: false, error: 'Forbidden' })
        }
      } catch (e) {
        return reply.code(500).send({ success: false, error: 'Permission check failed' })
      }
    }
  })

  fastify.addHook('onClose', async () => {
    cache.clear()
  })

  fastify.decorate('permissionsInvalidate', function (userId) {
    if (userId) {
      cache.delete(userId)
    } else {
      cache.clear()
    }
  })
}

export default fp(permissionsPlugin, { name: 'permissions' })
