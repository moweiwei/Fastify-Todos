## 目标
- 系统化自测用户模块全部接口（含正/反向用例）
- 在项目根新增 `requests/user.http`，采用 VS Code REST Client 规范，支持变量与响应引用，一键联调

## 自测清单
- 认证流：
  - 注册 `POST /api/auth/register`（随机邮箱/用户名，避免重复）
  - 登录 `POST /api/auth/login`（捕获 `accessToken/refreshToken`）
  - 刷新 `POST /api/auth/refresh`（校验 refresh 流）
  - 当前用户 `GET/PATCH /api/auth/me`，修改密码 `POST /api/auth/change-password`
- 用户 CRUD（全部带认证）：
  - 列表 `GET /api/users?page/limit&email/username`
  - 详情 `GET /api/users/:id`
  - 创建 `POST /api/users`（唯一性冲突 409 用例）
  - 更新 `PUT/PATCH /api/users/:id`（邮箱/用户名唯一性校验，密码加密）
  - 删除 `DELETE /api/users/:id`（404 用例）
- 反向用例：
  - 未携带 Token 的 401
  - 使用无效 `id` 的 404

## 文档结构与规范
- 变量区：`@host`、`@base = {{host}}/api`、随机数 `{{$randomInt}}`、时间戳 `{{$timestamp}}`
- 响应变量：通过 `@name` 引用上一请求响应，例如：`Authorization: Bearer {{login.response.body.data.tokens.accessToken}}`
- 分段组织：`###` 分隔，每段含请求、示例响应注释与必要说明

## 交付
- 新增文件：`requests/user.http`，包含以上所有请求；默认指向 `http://localhost:3000`
- 验证：启动本地服务后可直接点击每条请求验证，通过 Swagger 与 REST Client 双通道联调

如确认方案，我将创建 `requests/user.http` 并填充完整测试脚本，确保一键可测所有接口。