## 目标
- 基于现有 Fastify + Prisma 架构实现完整 RBAC：角色、权限点、菜单树与按钮级权限
- 提供权限守卫与认证集成，支持接口级、资源级与操作级的细粒度控制

## 总体方案
- 分层保持一致：`routes → controllers → services → Prisma`
- 通过插件新增权限守卫：`fastify.authorize('resource:action')` 作为 `preHandler`
- JWT 声明中包含用户基础信息；权限计算从数据库实时查询并可缓存

## 数据模型（Prisma）
- `Role(id,name,code,status)`
- `Permission(id,key,description)`，`key` 采用 `resource:action`（如 `users:create`）
- `Menu(id,parentId,name,path,component,type,icon,order,hidden)`（目录/菜单/按钮）
- 关系表：
  - `UserRole(userId,roleId)`
  - `RolePermission(roleId,permissionId)`
  - `RoleMenu(roleId,menuId)`
- 约束：`code`、`key` 唯一；`onDelete` 合理级联

## 后端实现
- 插件：`src/plugins/permissions.js`
  - `fastify.authorize(requiredPermission)`：读取 `request.user.id`，查询用户角色 → 聚合权限，校验包含 `requiredPermission`
  - 可选缓存：内存 `Map`（后续可替换为 Redis）
- 模块与目录：
  - 角色：`src/services/role.service.js`、`src/controllers/role.controller.js`、`src/routes/role.routes.js`
  - 权限：`src/services/permission.service.js`、`src/controllers/permission.controller.js`、`src/routes/permission.routes.js`
  - 菜单：`src/services/menu.service.js`、`src/controllers/menu.controller.js`、`src/routes/menu.routes.js`
- 认证集成：
  - 维持 `fastify.authenticate`；在需要的路由叠加 `preHandler: [fastify.authenticate, fastify.authorize('x:y')]`
  - 新增 `GET /api/auth/permissions` 返回当前用户权限点数组

## 接口设计（示例）
- 角色
  - `GET /api/roles`、`POST /api/roles`、`GET /api/roles/:id`、`PUT/PATCH /api/roles/:id`、`DELETE /api/roles/:id`
  - 成员管理：`GET /api/roles/:id/users`、`POST /api/users/:id/roles`（覆盖/追加模式）
- 权限点
  - `GET /api/permissions`、`POST /api/permissions`、`GET /api/permissions/:id`、`PUT/PATCH /api/permissions/:id`、`DELETE /api/permissions/:id`
  - 角色绑定：`GET /api/roles/:id/permissions`、`POST /api/roles/:id/permissions`（设置）
- 菜单
  - `GET /api/menus`（树形）/ `POST` / `GET /:id` / `PUT/PATCH /:id` / `DELETE /:id`
  - 角色绑定：`GET /api/roles/:id/menus`、`POST /api/roles/:id/menus`
- 认证辅助
  - `GET /api/auth/permissions`（当前用户权限点）

## 权限校验策略
- 接口到权限映射：
  - 用户管理：`users:list|read|create|update|delete`
  - 角色管理：`roles:list|read|create|update|delete`
  - 权限管理：`permissions:list|read|create|update|delete`
  - 菜单管理：`menus:list|read|create|update|delete`
- 守卫使用：例如创建用户接口 `preHandler: [fastify.authenticate, fastify.authorize('users:create')]`

## Swagger 与文档
- 所有 RBAC 路由增加 `tags: ['roles','permissions','menus']`，复用 `bearerAuth`
- 更新/新增 REST Client 文档：`requests/rbac.http`（角色、权限、菜单及绑定用例与反向用例）

## 种子数据
- 默认角色：`admin(code=ADMIN)`、`user(code=USER)`
- 默认权限：为四大资源生成 `list/read/create/update/delete`
- 将全部权限赋予 `admin`；为演示用户绑定 `admin`

## 验证
- 通过 REST Client 与 Swagger 联调：
  - 无权限用户访问受限接口返回 403
  - 绑定后权限生效；解绑后权限失效
- 关键路径性能：权限缓存命中与失效策略验证

## 迁移与风险
- 初期使用 SQLite；保留 MySQL 目标，切换仅需更新 `DATABASE_URL` 并执行迁移
- 注意变更引入的外键与级联的正确性，避免误删

## 交付步骤
1. 扩展 Prisma schema 与迁移
2. 新增 `permissions` 插件与守卫
3. 实现角色/权限/菜单服务、控制器与路由
4. 新增 `GET /api/auth/permissions`
5. 接口接入守卫，更新 Swagger
6. 编写并交付 `requests/rbac.http`，完成联调与演示

确认后我将按上述步骤开始编码与验证，完整落地 RBAC。