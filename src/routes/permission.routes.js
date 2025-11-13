import { PermissionController } from '../controllers/permission.controller.js'

const permissionSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    key: { type: 'string' },
    description: { type: 'string', nullable: true },
  },
}

export default async function permissionRoutes(fastify) {
  const c = new PermissionController(fastify)

  fastify.get('/permissions', { preHandler: [fastify.authenticate, fastify.authorize('permissions:list')], schema: { tags: ['permissions'], security: [{ bearerAuth: [] }], querystring: { type: 'object', properties: { page: { type: 'integer', default: 1 }, limit: { type: 'integer', default: 20 } } }, response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: permissionSchema }, count: { type: 'integer' }, pagination: { type: 'object' } } } } } }, c.list.bind(c))

  fastify.get('/permissions/:id', { preHandler: [fastify.authenticate, fastify.authorize('permissions:read')], schema: { tags: ['permissions'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: permissionSchema } }, 404: { type: 'object', properties: { success: { type: 'boolean' }, error: { type: 'string' } } } } } }, c.getById.bind(c))

  fastify.post('/permissions', { preHandler: [fastify.authenticate, fastify.authorize('permissions:create')], schema: { tags: ['permissions'], security: [{ bearerAuth: [] }], body: { type: 'object', required: ['key'], properties: { key: { type: 'string' }, description: { type: 'string' } } }, response: { 201: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: permissionSchema } }, 409: { type: 'object', properties: { success: { type: 'boolean' }, error: { type: 'string' } } } } } }, c.create.bind(c))

  fastify.put('/permissions/:id', { preHandler: [fastify.authenticate, fastify.authorize('permissions:update')], schema: { tags: ['permissions'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, body: { type: 'object', properties: { key: { type: 'string' }, description: { type: 'string' } }, minProperties: 1 }, response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: permissionSchema } } } } }, c.update.bind(c))

  fastify.delete('/permissions/:id', { preHandler: [fastify.authenticate, fastify.authorize('permissions:delete')], schema: { tags: ['permissions'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } }, 404: { type: 'object', properties: { success: { type: 'boolean' }, error: { type: 'string' } } } } } }, c.delete.bind(c))
}
