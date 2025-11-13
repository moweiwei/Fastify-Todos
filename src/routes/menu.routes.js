import { MenuController } from '../controllers/menu.controller.js'

const menuSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    parentId: { type: 'integer', nullable: true },
    name: { type: 'string' },
    path: { type: 'string', nullable: true },
    component: { type: 'string', nullable: true },
    type: { type: 'integer' },
    icon: { type: 'string', nullable: true },
    order: { type: 'integer' },
    hidden: { type: 'boolean' },
  },
}

export default async function menuRoutes(fastify) {
  const c = new MenuController(fastify)

  fastify.get('/menus', { preHandler: [fastify.authenticate, fastify.authorize('menus:list')], schema: { tags: ['menus'], security: [{ bearerAuth: [] }], response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: menuSchema } } } } } }, c.list.bind(c))

  fastify.get('/menus/tree', { preHandler: [fastify.authenticate, fastify.authorize('menus:list')], schema: { tags: ['menus'], security: [{ bearerAuth: [] }] } }, c.listTree.bind(c))

  fastify.get('/menus/:id', { preHandler: [fastify.authenticate, fastify.authorize('menus:read')], schema: { tags: ['menus'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: menuSchema } }, 404: { type: 'object', properties: { success: { type: 'boolean' }, error: { type: 'string' } } } } } }, c.getById.bind(c))

  fastify.post('/menus', { preHandler: [fastify.authenticate, fastify.authorize('menus:create')], schema: { tags: ['menus'], security: [{ bearerAuth: [] }], body: { type: 'object', required: ['name', 'type'], properties: { parentId: { type: 'integer' }, name: { type: 'string' }, path: { type: 'string' }, component: { type: 'string' }, type: { type: 'integer' }, icon: { type: 'string' }, order: { type: 'integer' }, hidden: { type: 'boolean' } } }, response: { 201: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: menuSchema } } } } }, c.create.bind(c))

  fastify.put('/menus/:id', { preHandler: [fastify.authenticate, fastify.authorize('menus:update')], schema: { tags: ['menus'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, body: { type: 'object', properties: { parentId: { type: 'integer' }, name: { type: 'string' }, path: { type: 'string' }, component: { type: 'string' }, type: { type: 'integer' }, icon: { type: 'string' }, order: { type: 'integer' }, hidden: { type: 'boolean' } }, minProperties: 1 }, response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: menuSchema } } } } }, c.update.bind(c))

  fastify.delete('/menus/:id', { preHandler: [fastify.authenticate, fastify.authorize('menus:delete')], schema: { tags: ['menus'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } }, 404: { type: 'object', properties: { success: { type: 'boolean' }, error: { type: 'string' } } } } } }, c.delete.bind(c))

  fastify.get('/roles/:id/menus', { preHandler: [fastify.authenticate, fastify.authorize('menus:read')], schema: { tags: ['menus'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } } }, c.getRoleMenus.bind(c))

  fastify.post('/roles/:id/menus', { preHandler: [fastify.authenticate, fastify.authorize('menus:update')], schema: { tags: ['menus'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }, body: { type: 'object', required: ['menuIds'], properties: { menuIds: { type: 'array', items: { type: 'integer' } } } } } }, c.setRoleMenus.bind(c))
}
