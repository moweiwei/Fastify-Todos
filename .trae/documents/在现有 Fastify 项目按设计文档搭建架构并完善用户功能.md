## 当前项目概况
- 框架：Fastify + Prisma + SQLite，已具备 JWT 认证与 Swagger 文档
- 入口与注册：`src/server.js` 启动；`src/app.js:72-75` 注册 `auth` 与 `todo` 路由；`src/app.js:76-112` 全局错误处理
- 插件：`src/plugins/prisma.js` 装饰 `fastify.prisma`；`src/plugins/jwt.js:52-67` 装饰 `fastify.authenticate`；`src/plugins/swagger.js` 文档
- 认证与用户：`src/routes/auth.routes.js` 已实现注册/登录/刷新/登出/当前用户/修改密码；控制器与服务分别在 `src/controllers/auth.controller.js`、`src/services/auth.service.js`
- ORM 模型：`prisma/schema.prisma` 包含 `User`、`RefreshToken`、`Todo`

## 与设计文档的差异与映射
- 框架风格：文档为 NestJS + FastifyAdapter；现项目为纯 Fastify。采用等价的分层模式：`routes → controllers → services → Prisma`，通过插件模拟守卫/拦截器
- 权限系统：文档含 RBAC（角色/菜单/按钮）；现项目暂未实现。先完成“用户”模组，再分期扩展 RBAC
- 数据库：文档偏向 MySQL；现为 SQLite。保留 Prisma 以便后续切换 `DATABASE_URL` 到 MySQL
- 响应格式：文档示例为 `{code,message,data}`；现项目统一 `{success,message,data}`，暂维持一致性，避免全局改造

## 架构搭建计划（保持现有技术栈并模块化）
1. 目录分层与约定（不改动现有文件，新增遵循现有风格）
   - `src/modules/user/`：`user.routes.js`、`user.controller.js`、`user.service.js`
   - 继续沿用 `plugins/`（JWT/Prisma/Swagger）、全局错误处理（`src/app.js`）
2. 配置与常量
   - `JWT`、`CORS` 已在 `src/app.js:40-44`、`src/plugins/jwt.js` 配置；保留并在用户模块中复用 `preHandler: fastify.authenticate`
3. Swagger 文档
   - 为用户模块新增 `tags: ['users']`，复用已有 `bearerAuth`

## 用户功能实现计划（RESTful 管理端接口）
1. 列表查询：`GET /api/users`
   - 支持分页 `page/limit`、筛选 `email/username`、可选 `createdAt` 排序
   - 仅返回非敏感字段（不含 `password`）
2. 查询详情：`GET /api/users/:id`
   - 基于 `id` 返回用户信息；404 处理
3. 创建用户：`POST /api/users`
   - 字段：`email/username/password/name`；密码 `bcrypt` 加密（与 `AuthService` 保持一致）
   - 唯一性校验（`email/username`）；冲突返回 409
4. 更新用户：`PUT /api/users/:id`（或 `PATCH`）
   - 可更新 `name/email`（含唯一性校验）；如提供 `password` 则加密更新
5. 删除用户：`DELETE /api/users/:id`
   - 级联删除其 `RefreshToken`、`Todo`（已由 Prisma 关系定义处理）
6. 认证保护
   - 路由统一 `preHandler: fastify.authenticate`；后续引入 RBAC 后再加角色守卫（如仅管理员可操作）
7. Swagger Schema
   - 复用 `auth.routes.js` 内 `userSchema` 基础结构，按需扩展响应定义

## 可选的数据库字段扩展（与设计文档对齐，后续阶段）
- 在 `User` 增加：`status(Boolean)`、`avatar(String?)`、`phone(String?)`、`nickname(String?)`
- 以 Prisma 迁移执行，兼容现有逻辑；本阶段仅在接口层保留最小集以快速交付

## 验证与交付
- 开发验证：使用现有 Swagger（`/documentation`）联调 `users` 接口；口径统一 `{success,message?,data}`
- 数据验证：确保创建/更新路径不返回密码；统一错误码与 4xx/5xx 处理复用 `src/app.js` 全局错误处理
- 后续增强：接入 RBAC、操作日志、CORS 白名单、切换 MySQL

如果确认以上方案，我将按此计划在现项目中新增“用户模块”并实现完整 RESTful 接口，同时保持与现有认证与错误处理一致的风格。