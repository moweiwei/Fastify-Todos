# Fastify + Prisma + SQLite Todos REST API

一个完整的、生产就绪的 Todos REST API 项目模板，使用 Fastify、Prisma ORM 和 SQLite 构建。

## ✨ 特性

- ✅ **完整的 CRUD 操作** - 创建、读取、更新、删除 Todos
- 🏗️ **模块化架构** - Controller、Service、Routes 分层设计
- 🔄 **RESTful API** - 符合 REST 规范的接口设计
- 📊 **Prisma ORM** - 类型安全的数据库访问
- 💾 **SQLite 数据库** - 轻量级，易于迁移到 PostgreSQL
- 📚 **Swagger 文档** - 自动生成的 API 文档
- ✔️ **请求验证** - 使用 Fastify Schema 验证
- 🔥 **热重载** - 使用 nodemon 支持开发时热重载
- 🌍 **CORS 支持** - 跨域资源共享
- 📝 **完整日志** - 使用 Pino 日志系统
- 🔒 **错误处理** - 全局错误处理机制

## 📁 项目结构

```
fastify-prisma-todos-api/
├── prisma/
│   └── schema.prisma          # Prisma 数据库模型定义
├── src/
│   ├── controllers/
│   │   └── todo.controller.js # 控制器层 - 处理 HTTP 请求
│   ├── services/
│   │   └── todo.service.js    # 服务层 - 业务逻辑
│   ├── routes/
│   │   └── todo.routes.js     # 路由层 - API 路由定义
│   ├── plugins/
│   │   ├── prisma.js          # Prisma 插件
│   │   └── swagger.js         # Swagger 文档插件
│   ├── app.js                 # Fastify 应用配置
│   └── server.js              # 服务器启动入口
├── .env                       # 环境变量配置
├── .gitignore                 # Git 忽略文件
├── package.json               # 项目依赖
└── README.md                  # 项目文档
```

## 🚀 快速开始

### 前置要求

**不需要单独安装 SQLite！**

Prisma 会自动处理 SQLite 的所有依赖。当您运行 `npm install` 时，Prisma 会安装所需的 SQLite 二进制文件。这是 Prisma 的一大优势 - 开箱即用，无需额外配置。

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

项目已包含 `.env` 文件，默认配置如下：

```env
DATABASE_URL="file:./dev.db"
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 5. 访问 API 文档

打开浏览器访问：`http://localhost:3000/documentation`

## 📡 API 端点

### 基础端点

- `GET /` - API 信息
- `GET /health` - 健康检查

### Todos 端点

| 方法   | 端点                    | 描述           |
| ------ | ----------------------- | -------------- |
| GET    | `/api/todos`            | 获取所有 Todos |
| GET    | `/api/todos/:id`        | 获取单个 Todo  |
| POST   | `/api/todos`            | 创建新 Todo    |
| PUT    | `/api/todos/:id`        | 更新 Todo      |
| DELETE | `/api/todos/:id`        | 删除 Todo      |
| PATCH  | `/api/todos/:id/toggle` | 切换完成状态   |

## 📝 API 使用示例

### 1. 创建 Todo

**请求：**

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "学习 Fastify",
    "description": "完成 Fastify 教程"
  }'
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "学习 Fastify",
    "description": "完成 Fastify 教程",
    "completed": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Todo created successfully"
}
```

### 2. 获取所有 Todos

**请求：**

```bash
curl http://localhost:3000/api/todos
```

**响应：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "学习 Fastify",
      "description": "完成 Fastify 教程",
      "completed": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 3. 获取单个 Todo

**请求：**

```bash
curl http://localhost:3000/api/todos/1
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "学习 Fastify",
    "description": "完成 Fastify 教程",
    "completed": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. 更新 Todo

**请求：**

```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "学习 Fastify 和 Prisma",
    "completed": true
  }'
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "学习 Fastify 和 Prisma",
    "description": "完成 Fastify 教程",
    "completed": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:01.000Z"
  },
  "message": "Todo updated successfully"
}
```

### 5. 切换完成状态

**请求：**

```bash
curl -X PATCH http://localhost:3000/api/todos/1/toggle
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "学习 Fastify 和 Prisma",
    "description": "完成 Fastify 教程",
    "completed": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:02.000Z"
  },
  "message": "Todo status toggled successfully"
}
```

### 6. 删除 Todo

**请求：**

```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

**响应：**

```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

### 7. 过滤 Todos（按完成状态）

**请求：**

```bash
# 获取已完成的 Todos
curl http://localhost:3000/api/todos?completed=true

# 获取未完成的 Todos
curl http://localhost:3000/api/todos?completed=false
```

## 🛠️ 可用脚本

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start

# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate

# 打开 Prisma Studio（数据库 GUI）
npm run prisma:studio
```

## 🔄 迁移到 PostgreSQL

如需迁移到 PostgreSQL，只需修改以下配置：

### 1. 更新 `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"  // 改为 postgresql
  url      = env("DATABASE_URL")
}
```

### 2. 更新 `.env`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/todos_db"
```

### 3. 重新运行迁移

```bash
npm run prisma:migrate
```

## 📦 依赖说明

### 核心依赖

- **fastify** - 高性能 Web 框架
- **@prisma/client** - Prisma ORM 客户端
- **@fastify/cors** - CORS 支持
- **@fastify/swagger** - Swagger 文档生成
- **@fastify/swagger-ui** - Swagger UI
- **dotenv** - 环境变量管理

### 开发依赖

- **prisma** - Prisma CLI 工具
- **nodemon** - 开发时热重载

## 🏗️ 架构说明

### 三层架构

1. **Routes（路由层）**

   - 定义 API 端点
   - 配置请求验证 Schema
   - 路由到对应的 Controller

2. **Controllers（控制器层）**

   - 处理 HTTP 请求和响应
   - 参数验证和错误处理
   - 调用 Service 层处理业务逻辑

3. **Services（服务层）**
   - 实现业务逻辑
   - 数据库操作（通过 Prisma）
   - 数据转换和处理

### 插件系统

- **Prisma Plugin** - 将 Prisma Client 注入到 Fastify 实例
- **Swagger Plugin** - 自动生成 API 文档

## 🔒 错误处理

项目包含完善的错误处理机制：

- **验证错误** - 返回 400 状态码和详细错误信息
- **数据库错误** - 捕获 Prisma 错误并返回友好提示
- **404 错误** - 资源不存在时返回 404
- **500 错误** - 服务器内部错误

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题，请通过 GitHub Issues 联系。

---

**Happy Coding! 🎉**
