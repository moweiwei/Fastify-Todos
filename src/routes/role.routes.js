import { RoleController } from '../controllers/role.controller.js'

const roleSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    code: { type: 'string' },
    status: { type: 'boolean' },
  },
}

export default async function roleRoutes(fastify) {
  const c = new RoleController(fastify)

  fastify.get('/roles', { preHandler: [fastify.authenticate, fastify.authorize('roles:list')], schema: { tags: ['roles'], security: [{ bearerAuth: [] }], querystring: { type: 'object', properties: { page: { type: 'integer', default: 1 }, limit: { type: 'integer', default: 10 } } }, response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: roleSchema }, count: { type: 'integer' }, pagination: { type: 'object' } } } } } }, c.list.bind(c))

  fastify.get('/roles/:id', { preHandler: [fastify.authenticate, fastify.authorize('roles:read')], schema: { tags: ['roles'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: roleSchema } }, 404: { type: 'object', properties: { success: { type: 'boolean' }, error: { type: 'string' } } } } } }, c.getById.bind(c))

  fastify.post('/roles', { preHandler: [fastify.authenticate, fastify.authorize('roles:create')], schema: { tags: ['roles'], security: [{ bearerAuth: [] }], body: { type: 'object', required: ['name', 'code'], properties: { name: { type: 'string' }, code: { type: 'string' }, status: { type: 'boolean' } } }, response: { 201: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: roleSchema } }, 409: { type: 'object', properties: { success: { type: 'boolean' }, error: { type: 'string' } } } } } }, c.create.bind(c))

  fastify.put('/roles/:id', { preHandler: [fastify.authenticate, fastify.authorize('roles:update')], schema: { tags: ['roles'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, body: { type: 'object', properties: { name: { type: 'string' }, code: { type: 'string' }, status: { type: 'boolean' } }, minProperties: 1 }, response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: roleSchema } } } } }, c.update.bind(c))

  fastify.delete('/roles/:id', { preHandler: [fastify.authenticate, fastify.authorize('roles:delete')], schema: { tags: ['roles'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } }, 404: { type: 'object', properties: { success: { type: 'boolean' }, error: { type: 'string' } } } } } }, c.delete.bind(c))

  fastify.get('/roles/:id/permissions', { preHandler: [fastify.authenticate, fastify.authorize('roles:read')], schema: { tags: ['roles'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } } }, c.getPermissions.bind(c))

  fastify.post('/roles/:id/permissions', { preHandler: [fastify.authenticate, fastify.authorize('roles:update')], schema: { tags: ['roles'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, body: { type: 'object', required: ['keys'], properties: { keys: { type: 'array', items: { type: 'string' } } } } } }, c.setPermissions.bind(c))

  fastify.get('/users/:id/roles', { preHandler: [fastify.authenticate, fastify.authorize('roles:read')], schema: { tags: ['roles'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } } }, c.getUserRoles.bind(c))

  fastify.post('/users/:id/roles', { preHandler: [fastify.authenticate, fastify.authorize('roles:update')], schema: { tags: ['roles'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, body: { type: 'object', required: ['roleIds'], properties: { roleIds: { type: 'array', items: { type: 'integer' } } } } } }, c.setUserRoles.bind(c))
}
