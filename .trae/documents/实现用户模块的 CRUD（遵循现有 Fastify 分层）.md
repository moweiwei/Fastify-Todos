## 目标
- 在现有项目中新增用户模块的完整 CRUD，保持现有分层与响应风格
- 路由全部启用 JWT 认证，Swagger 文档可用

## 变更范围
- 新增：`src/services/user.service.js`、`src/controllers/user.controller.js`、`src/routes/user.routes.js`
- 更新：`src/app.js` 引入并注册用户路由，prefix 为 `/api`

## 接口设计
- `GET /api/users`：分页 `page/limit`、筛选 `email/username`，返回数组与 `pagination`
- `GET /api/users/:id`：返回单个用户，404 处理
- `POST /api/users`：创建（`email/username/password/name`），`bcrypt` 加密，唯一性冲突返回 409
- `PUT /api/users/:id`：更新（`name/email/username/password?`），邮箱/用户名唯一性校验，密码变更需加密
- `PATCH /api/users/:id`：部分更新，同上
- `DELETE /api/users/:id`：删除用户（依赖 Prisma 关系级联删除其 `RefreshToken/Todo`）

## 约束与一致性
- 认证保护：全部路由 `preHandler: fastify.authenticate`
- 响应格式：统一 `{success,message?,data}`，列表返回 `{success,data:[...],count,pagination}`
- 字段选择：不返回 `password`
- Swagger：`tags: ['users']`，复用 `bearerAuth`

## 验证
- 启动开发服务，使用 `/documentation` 调试用户接口并校验分页/筛选/冲突处理

我将按以上方案直接落地代码，实现并验证用户模块 CRUD。