## 总览
- 当前后端已具备：认证、用户与 Todos、Swagger、RBAC 基础（角色/权限/守卫、auth/permissions）。
- 建议围绕安全加固、RBAC完善、菜单/文件模块、一致性与观测、测试与部署进行增强。

## 安全加固
- 令牌策略：实现刷新令牌轮换与复用检测；在 `src/plugins/jwt.js` 引入刷新令牌“黑名单”与撤销记录；对 `/auth/refresh` 做“一次性”校验。
- 速率限制：接入 `@fastify/rate-limit` 保护 `/auth/login`、写操作路由。
- 安全头：接入 `@fastify/helmet`，完善 CORS 白名单（替换 `src/app.js:41-43` 的 `origin: true`）。
- 账号保护：失败登录计数与锁定、密码强度校验、邮箱验证与“忘记密码”流程（临时票据 + 过期策略）。

## RBAC 完善
- 种子数据：初始化 `ADMIN/USER` 角色与基础权限 `users|roles|permissions|menus:*`，绑定默认管理员。
- 缓存失效：为 `permissions` 插件添加“变更后清除缓存”（角色/权限变更时触发）。
- 守卫覆盖：将 `todos` 等模块也接入 `fastify.authorize('todos:*')`；在 Swagger 路由的 `schema` 中标注所需权限（`x-permission`）。

## 菜单与前端集成
- 菜单模块：实现 `GET /api/menus`（树形）、`POST/PUT/PATCH/DELETE`、`POST /api/roles/:id/menus` 绑定；与前端动态路由对齐。
- 返回“当前用户可见菜单树”：`GET /api/auth/menus`，按用户角色聚合菜单。

## 文件上传与系统配置
- 文件模块：接入 `@fastify/multipart`，支持头像上传、通用文件存储（本地或云存储抽象）。
- 系统配置模块：读写配置项（如站点名、登录策略），用于前端设置页。

## API 一致性与体验
- 响应口径：考虑在响应中增加 `code` 字段，与设计文档一致；保留 `success/message/data`。
- 校验统一：为所有路由补齐 `schema`（参数/体/响应），错误信息统一。
- 分页与筛选：统一查询参数（`page/limit/sort/order`），支持多字段筛选。

## 观测与运维
- 日志：接入 `@fastify/request-id`，日志携带请求ID；结构化日志聚合。
- 指标：Prometheus 指标（如 `fastify-metrics`），健康与就绪检查分离（`/health`、`/ready`）。
- 错误上报：Sentry 接入（可选）。

## 测试与发布
- 测试：引入 Jest/Vitest + Supertest，覆盖认证、用户、RBAC 守卫的 e2e；利用 SQLite 临时库或 Testcontainers。
- 联调文档：扩展 `requests/rbac.http` 与 `requests/user.http` 添加更多反向用例（401/403/409/404）。
- 容器与编排：提供 `Dockerfile` 与 `docker-compose.yml`（Backend + MySQL + Redis），以及 PM2 配置。
- CI/CD：GitHub Actions 进行 lint、测试、构建与镜像发布。

## 分阶段实施
1. 安全加固（速率限制、helmet、CORS 白名单、刷新令牌轮换/黑名单）。
2. RBAC 种子与缓存失效，守卫覆盖到 Todos。
3. 菜单模块与 `auth/menus` 输出；文件上传模块。
4. 一致性改造（响应 `code`、校验统一），观测（指标、请求ID）。
5. 测试体系与容器化、CI/CD。

如果你认可该路线图，我将按照上述阶段逐步实现，并在每个阶段交付代码、联调文档与验证结果。