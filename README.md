# Fastify + Prisma 后端开发入门指南

> 专为前端转后端的初学者准备的详细教程

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

## 📚 目录

1. [项目概述](#项目概述)
2. [核心概念](#核心概念)
3. [项目结构详解](#项目结构详解)
4. [代码详解](#代码详解)
5. [常见写法说明](#常见写法说明)
6. [开发流程](#开发流程)
7. [常见问题](#常见问题)

---

## 项目概述

这是一个使用 **Fastify**（后端框架）+ **Prisma**（ORM 数据库工具）+ **SQLite**（数据库）构建的 RESTful API 项目。

### 技术栈对比（前端 vs 后端）

| 前端概念        | 后端对应概念    | 说明              |
| --------------- | --------------- | ----------------- |
| React Router    | Fastify Routes  | 路由系统          |
| Redux/Context   | Service 层      | 状态/业务逻辑管理 |
| API 调用        | Controller 层   | 处理请求响应      |
| LocalStorage    | 数据库 (SQLite) | 数据持久化        |
| TypeScript 类型 | Prisma Schema   | 数据模型定义      |

---

## 核心概念

### 1. 什么是 RESTful API？

RESTful API 是一种设计风格，使用 HTTP 方法来操作资源：

```javascript
// 前端发起请求
GET / api / todos; // 获取所有 todos（类似 React 的 useEffect 获取数据）
POST / api / todos; // 创建新 todo（类似表单提交）
PUT / api / todos / 1; // 更新 todo（类似编辑功能）
DELETE / api / todos / 1; // 删除 todo（类似删除按钮）
```

### 2. 三层架构（MVC 模式）

```
前端请求 → Routes（路由层） → Controller（控制器层） → Service（服务层） → 数据库
                ↓                    ↓                    ↓
            定义端点              处理请求响应          业务逻辑
```

**类比前端：**

- **Routes** = React Router 的路由配置
- **Controller** = React 组件中的事件处理函数
- **Service** = Redux 的 actions 或自定义 hooks

---

## 项目结构详解

```
nest-todos/
├── prisma/                    # 数据库相关
│   ├── schema.prisma         # 数据库模型定义（类似 TypeScript 接口）
│   ├── dev.db                # SQLite 数据库文件
│   └── migrations/           # 数据库迁移记录
│
├── src/
│   ├── server.js             # 🚀 服务器启动入口（类似 index.js）
│   ├── app.js                # ⚙️ 应用配置（类似 App.jsx）
│   │
│   ├── routes/               # 📍 路由层
│   │   └── todo.routes.js    # 定义 API 端点和验证规则
│   │
│   ├── controllers/          # 🎮 控制器层
│   │   └── todo.controller.js # 处理 HTTP 请求和响应
│   │
│   ├── services/             # 💼 服务层
│   │   └── todo.service.js   # 业务逻辑和数据库操作
│   │
│   └── plugins/              # 🔌 插件
│       ├── prisma.js         # Prisma 数据库连接
│       └── swagger.js        # API 文档生成
│
├── .env                      # 环境变量（类似 .env.local）
├── package.json              # 依赖管理
└── test.http                 # API 测试文件
```

---

## 代码详解

### 1. 服务器启动 (`src/server.js`)

```javascript
/**
 * 服务器入口文件
 * 作用：启动 Fastify 服务器，监听端口
 * 类比：前端的 ReactDOM.render()
 */

import { buildApp } from "./app.js";

const PORT = process.env.PORT || 3000; // 从环境变量读取端口，默认 3000
const HOST = process.env.HOST || "0.0.0.0"; // 监听所有网络接口

async function start() {
  let fastify;

  try {
    // 1. 构建应用实例（类似创建 React App）
    fastify = await buildApp();

    // 2. 启动服务器，监听端口
    await fastify.listen({ port: PORT, host: HOST });

    // 3. 打印启动信息
    console.log("\n🚀 Server is running!");
    console.log(`📍 API: http://localhost:${PORT}`);
    console.log(`📚 Swagger Docs: http://localhost:${PORT}/documentation`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);
  } catch (err) {
    // 错误处理
    if (fastify) {
      fastify.log.error(err);
    } else {
      console.error(err);
    }
    process.exit(1); // 退出进程
  }
}

// 优雅关闭：监听终止信号（Ctrl+C）
const signals = ["SIGINT", "SIGTERM"];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received, closing server gracefully...`);
    process.exit(0);
  });
});

// 启动服务器
start();
```

**关键点：**

- `async/await`：处理异步操作（类似前端的 Promise）
- `process.env`：读取环境变量（类似前端的 `import.meta.env`）
- `process.exit()`：退出 Node.js 进程

---

### 2. 应用配置 (`src/app.js`)

```javascript
/**
 * Fastify 应用配置
 * 作用：配置中间件、插件、路由
 * 类比：React 的 App.jsx，配置全局状态、路由等
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import prismaPlugin from "./plugins/prisma.js";
import { registerSwagger } from "./plugins/swagger.js";
import todoRoutes from "./routes/todo.routes.js";

// 加载环境变量（从 .env 文件）
dotenv.config();

export async function buildApp(opts = {}) {
  // 1. 创建 Fastify 实例（类似 createRoot）
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info", // 日志级别
      transport: {
        target: "pino-pretty", // 美化日志输出
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    },
    ...opts,
  });

  // 2. 注册 CORS（跨域资源共享）
  // 类比：前端配置代理或 CORS 头
  await fastify.register(cors, {
    origin: true, // 允许所有来源（生产环境应限制）
  });

  // 3. 注册 Prisma 插件（数据库连接）
  // 类比：前端的 Context Provider
  await fastify.register(prismaPlugin);

  // 4. 注册 Swagger 文档
  await registerSwagger(fastify);

  // 5. 定义基础路由
  fastify.get("/", async (request, reply) => {
    return {
      status: "ok",
      message: "Fastify + Prisma + SQLite Todos API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    };
  });

  // 健康检查路由（用于监控服务状态）
  fastify.get("/health", async (request, reply) => {
    return {
      status: "healthy",
      uptime: process.uptime(), // 服务运行时间
      timestamp: new Date().toISOString(),
    };
  });

  // 6. 注册 API 路由（所有 /api 开头的请求）
  await fastify.register(todoRoutes, { prefix: "/api" });

  // 7. 全局错误处理
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    // Prisma 数据库错误（错误码以 P 开头）
    if (error.code?.startsWith("P")) {
      return reply.code(400).send({
        success: false,
        error: "Database operation failed",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    // 验证错误（请求参数不符合要求）
    if (error.validation) {
      return reply.code(400).send({
        success: false,
        error: "Validation failed",
        details: error.validation,
      });
    }

    // 默认错误响应
    return reply.code(error.statusCode || 500).send({
      success: false,
      error: error.message || "Internal Server Error",
    });
  });

  return fastify;
}
```

**关键点：**

- `await fastify.register()`：注册插件（类似 React 的 `<Provider>`）
- `fastify.get/post/put/delete()`：定义路由（类似 React Router）
- `setErrorHandler()`：全局错误处理（类似 React 的 ErrorBoundary）

---

### 3. 数据库模型 (`prisma/schema.prisma`)

```prisma
// Prisma Schema - 数据库模型定义
// 类比：TypeScript 的接口定义

generator client {
  provider = "prisma-client-js"  // 生成 JavaScript 客户端
}

datasource db {
  provider = "sqlite"  // 使用 SQLite 数据库
  url      = env("DATABASE_URL")  // 从环境变量读取数据库路径
}

// Todo 模型（类似前端的 interface Todo）
model Todo {
  id          Int      @id @default(autoincrement())  // 主键，自动递增
  title       String                                   // 标题（必填）
  description String?                                  // 描述（可选，? 表示可为 null）
  completed   Boolean  @default(false)                 // 完成状态，默认 false
  createdAt   DateTime @default(now())                 // 创建时间，默认当前时间
  updatedAt   DateTime @updatedAt                      // 更新时间，自动更新

  @@map("todos")  // 映射到数据库表名 "todos"
}
```

**Prisma 类型对应关系：**

| Prisma 类型 | JavaScript 类型  | 说明       |
| ----------- | ---------------- | ---------- |
| `Int`       | `number`         | 整数       |
| `String`    | `string`         | 字符串     |
| `Boolean`   | `boolean`        | 布尔值     |
| `DateTime`  | `Date`           | 日期时间   |
| `String?`   | `string \| null` | 可选字符串 |

**装饰器说明：**

- `@id`：主键
- `@default(autoincrement())`：自动递增
- `@default(now())`：默认当前时间
- `@updatedAt`：自动更新时间
- `@@map("todos")`：表名映射

---

### 4. 路由层 (`src/routes/todo.routes.js`)

```javascript
/**
 * 路由层 - 定义 API 端点
 * 作用：定义 URL 路径、HTTP 方法、请求验证
 * 类比：React Router 的路由配置
 */

import { TodoController } from "../controllers/todo.controller.js";

// 定义 Todo 的数据结构（用于 Swagger 文档和验证）
const todoSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    title: { type: "string" },
    description: { type: "string", nullable: true },
    completed: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

// 定义响应格式
const responseSchema = {
  200: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: todoSchema,
    },
  },
  404: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      error: { type: "string" },
    },
  },
};

// 列表响应格式
const listResponseSchema = {
  200: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: {
        type: "array",
        items: todoSchema,
      },
      count: { type: "integer" },
    },
  },
};

// 导出路由注册函数
export default async function todoRoutes(fastify, options) {
  // 创建控制器实例
  const controller = new TodoController(fastify);

  // 1. GET /api/todos - 获取所有 Todos
  fastify.get(
    "/todos",
    {
      schema: {
        description: "Get all todos", // API 描述
        tags: ["todos"], // Swagger 分组标签
        querystring: {
          // 查询参数验证
          type: "object",
          properties: {
            completed: { type: "string", enum: ["true", "false"] },
          },
        },
        response: listResponseSchema, // 响应格式
      },
    },
    controller.getAllTodos.bind(controller)
  );
  // .bind(controller) 确保方法内的 this 指向 controller 实例

  // 2. GET /api/todos/:id - 获取单个 Todo
  fastify.get(
    "/todos/:id",
    {
      schema: {
        description: "Get a todo by ID",
        tags: ["todos"],
        params: {
          // URL 参数验证
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer", minimum: 1 },
          },
        },
        response: responseSchema,
      },
    },
    controller.getTodoById.bind(controller)
  );

  // 3. POST /api/todos - 创建新 Todo
  fastify.post(
    "/todos",
    {
      schema: {
        description: "Create a new todo",
        tags: ["todos"],
        body: {
          // 请求体验证
          type: "object",
          required: ["title"], // 必填字段
          properties: {
            title: { type: "string", minLength: 1, maxLength: 200 },
            description: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          201: {
            // 201 Created
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: todoSchema,
              message: { type: "string" },
            },
          },
        },
      },
    },
    controller.createTodo.bind(controller)
  );

  // 4. PUT /api/todos/:id - 更新 Todo
  fastify.put(
    "/todos/:id",
    {
      schema: {
        description: "Update a todo",
        tags: ["todos"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer", minimum: 1 },
          },
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 1, maxLength: 200 },
            description: { type: "string", maxLength: 1000 },
            completed: { type: "boolean" },
          },
        },
        response: responseSchema,
      },
    },
    controller.updateTodo.bind(controller)
  );

  // 5. DELETE /api/todos/:id - 删除 Todo
  fastify.delete(
    "/todos/:id",
    {
      schema: {
        description: "Delete a todo",
        tags: ["todos"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer", minimum: 1 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    controller.deleteTodo.bind(controller)
  );

  // 6. PATCH /api/todos/:id/toggle - 切换完成状态
  fastify.patch(
    "/todos/:id/toggle",
    {
      schema: {
        description: "Toggle todo completion status",
        tags: ["todos"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer", minimum: 1 },
          },
        },
        response: responseSchema,
      },
    },
    controller.toggleTodoComplete.bind(controller)
  );
}
```

**关键点：**

- `schema`：定义请求验证规则和 API 文档
- `params`：URL 参数（如 `/todos/:id` 中的 `id`）
- `querystring`：查询参数（如 `/todos?completed=true`）
- `body`：请求体（POST/PUT 的数据）
- `response`：响应格式（用于文档和验证）
- `.bind(controller)`：绑定 this 上下文

---

### 5. 控制器层 (`src/controllers/todo.controller.js`)

```javascript
/**
 * 控制器层 - 处理 HTTP 请求和响应
 * 作用：接收请求，调用 Service，返回响应
 * 类比：React 组件中的事件处理函数
 */

import { TodoService } from "../services/todo.service.js";

export class TodoController {
  constructor(fastify) {
    // 创建 Service 实例，传入 Prisma 客户端
    this.todoService = new TodoService(fastify.prisma);
  }

  /**
   * 获取所有 Todos
   * GET /api/todos
   */
  async getAllTodos(request, reply) {
    try {
      // 1. 从查询参数获取过滤条件
      const { completed } = request.query;

      // 2. 调用 Service 层获取数据
      const todos = await this.todoService.getAllTodos({ completed });

      // 3. 返回成功响应
      return reply.code(200).send({
        success: true,
        data: todos,
        count: todos.length,
      });
    } catch (error) {
      // 4. 错误处理
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to fetch todos",
      });
    }
  }

  /**
   * 根据 ID 获取单个 Todo
   * GET /api/todos/:id
   */
  async getTodoById(request, reply) {
    try {
      // 1. 从 URL 参数获取 ID
      const { id } = request.params;

      // 2. 调用 Service 层查询
      const todo = await this.todoService.getTodoById(id);

      // 3. 检查是否存在
      if (!todo) {
        return reply.code(404).send({
          success: false,
          error: "Todo not found",
        });
      }

      // 4. 返回数据
      return reply.code(200).send({
        success: true,
        data: todo,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to fetch todo",
      });
    }
  }

  /**
   * 创建新的 Todo
   * POST /api/todos
   */
  async createTodo(request, reply) {
    try {
      // 1. 从请求体获取数据
      const todo = await this.todoService.createTodo(request.body);

      // 2. 返回创建成功响应（201 Created）
      return reply.code(201).send({
        success: true,
        data: todo,
        message: "Todo created successfully",
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to create todo",
      });
    }
  }

  /**
   * 更新 Todo
   * PUT /api/todos/:id
   */
  async updateTodo(request, reply) {
    try {
      const { id } = request.params;

      // 1. 检查 Todo 是否存在
      const existingTodo = await this.todoService.getTodoById(id);
      if (!existingTodo) {
        return reply.code(404).send({
          success: false,
          error: "Todo not found",
        });
      }

      // 2. 更新数据
      const todo = await this.todoService.updateTodo(id, request.body);

      // 3. 返回更新后的数据
      return reply.code(200).send({
        success: true,
        data: todo,
        message: "Todo updated successfully",
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to update todo",
      });
    }
  }

  /**
   * 删除 Todo
   * DELETE /api/todos/:id
   */
  async deleteTodo(request, reply) {
    try {
      const { id } = request.params;

      // 1. 检查是否存在
      const existingTodo = await this.todoService.getTodoById(id);
      if (!existingTodo) {
        return reply.code(404).send({
          success: false,
          error: "Todo not found",
        });
      }

      // 2. 删除数据
      await this.todoService.deleteTodo(id);

      // 3. 返回成功消息
      return reply.code(200).send({
        success: true,
        message: "Todo deleted successfully",
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to delete todo",
      });
    }
  }

  /**
   * 切换 Todo 完成状态
   * PATCH /api/todos/:id/toggle
   */
  async toggleTodoComplete(request, reply) {
    try {
      const { id } = request.params;

      // 1. 检查是否存在
      const existingTodo = await this.todoService.getTodoById(id);
      if (!existingTodo) {
        return reply.code(404).send({
          success: false,
          error: "Todo not found",
        });
      }

      // 2. 切换状态
      const todo = await this.todoService.toggleTodoComplete(id);

      // 3. 返回更新后的数据
      return reply.code(200).send({
        success: true,
        data: todo,
        message: "Todo status toggled successfully",
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to toggle todo status",
      });
    }
  }
}
```

**关键点：**

- `request.params`：URL 参数（如 `/todos/:id`）
- `request.query`：查询参数（如 `?completed=true`）
- `request.body`：请求体数据
- `reply.code()`：设置 HTTP 状态码
- `reply.send()`：发送响应数据
- `try/catch`：错误处理

**HTTP 状态码：**

- `200`：成功
- `201`：创建成功
- `400`：请求错误
- `404`：未找到
- `500`：服务器错误

---

### 6. 服务层 (`src/services/todo.service.js`)

```javascript
/**
 * 服务层 - 业务逻辑和数据库操作
 * 作用：封装数据库操作，处理业务逻辑
 * 类比：Redux 的 actions 或自定义 hooks
 */

export class TodoService {
  constructor(prisma) {
    // 保存 Prisma 客户端实例
    this.prisma = prisma;
  }

  /**
   * 获取所有 Todos
   * @param {Object} filters - 过滤条件
   * @param {boolean} filters.completed - 是否完成
   * @returns {Promise<Array>} Todos 列表
   */
  async getAllTodos(filters = {}) {
    // 1. 构建查询条件
    const where = {};

    if (filters.completed !== undefined) {
      // 将字符串 'true'/'false' 转换为布尔值
      where.completed =
        filters.completed === "true" || filters.completed === true;
    }

    // 2. 查询数据库
    return await this.prisma.todo.findMany({
      where, // 过滤条件
      orderBy: {
        createdAt: "desc", // 按创建时间降序排列
      },
    });
  }

  /**
   * 根据 ID 获取单个 Todo
   * @param {number} id - Todo ID
   * @returns {Promise<Object|null>} Todo 对象或 null
   */
  async getTodoById(id) {
    return await this.prisma.todo.findUnique({
      where: { id: parseInt(id) }, // 确保 ID 是整数
    });
  }

  /**
   * 创建新的 Todo
   * @param {Object} data - Todo 数据
   * @param {string} data.title - 标题
   * @param {string} data.description - 描述
   * @returns {Promise<Object>} 创建的 Todo
   */
  async createTodo(data) {
    return await this.prisma.todo.create({
      data: {
        title: data.title,
        description: data.description || null, // 如果没有描述，设为 null
        completed: false, // 默认未完成
      },
    });
  }

  /**
   * 更新 Todo
   * @param {number} id - Todo ID
   * @param {Object} data - 更新的数据
   * @returns {Promise<Object>} 更新后的 Todo
   */
  async updateTodo(id, data) {
    return await this.prisma.todo.update({
      where: { id: parseInt(id) },
      data: {
        // 只更新提供的字段（使用展开运算符和条件判断）
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.completed !== undefined && { completed: data.completed }),
      },
    });
  }

  /**
   * 删除 Todo
   * @param {number} id - Todo ID
   * @returns {Promise<Object>} 删除的 Todo
   */
  async deleteTodo(id) {
    return await this.prisma.todo.delete({
      where: { id: parseInt(id) },
    });
  }

  /**
   * 切换 Todo 完成状态
   * @param {number} id - Todo ID
   * @returns {Promise<Object>} 更新后的 Todo
   */
  async toggleTodoComplete(id) {
    // 1. 先获取当前状态
    const todo = await this.getTodoById(id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    // 2. 切换状态（取反）
    return await this.prisma.todo.update({
      where: { id: parseInt(id) },
      data: {
        completed: !todo.completed, // 布尔值取反
      },
    });
  }
}
```

**Prisma 常用方法：**

| 方法           | 说明         | 类比前端         |
| -------------- | ------------ | ---------------- |
| `findMany()`   | 查询多条记录 | `array.filter()` |
| `findUnique()` | 查询单条记录 | `array.find()`   |
| `create()`     | 创建记录     | `array.push()`   |
| `update()`     | 更新记录     | `array.map()`    |
| `delete()`     | 删除记录     | `array.filter()` |

**关键点：**

- `where`：查询条件（类似 SQL 的 WHERE）
- `orderBy`：排序（类似 SQL 的 ORDER BY）
- `parseInt()`：确保 ID 是整数类型
- `

...` 展开运算符（类似前端的对象合并）

---

### 7. Prisma 插件 (`src/plugins/prisma.js`)

```javascript
/**
 * Prisma 插件
 * 作用：将 Prisma Client 注入到 Fastify 实例
 * 类比：React 的 Context Provider
 */

import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

async function prismaPlugin(fastify, options) {
  // 1. 创建 Prisma 客户端实例
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"] // 开发环境：记录所有日志
        : ["error"], // 生产环境：只记录错误
  });

  // 2. 连接数据库
  await prisma.$connect();
  fastify.log.info("✅ Prisma connected to database");

  // 3. 将 Prisma 实例装饰到 Fastify 上
  // 之后可以通过 fastify.prisma 访问
  fastify.decorate("prisma", prisma);

  // 4. 在应用关闭时断开数据库连接
  fastify.addHook("onClose", async (fastify) => {
    await fastify.prisma.$disconnect();
    fastify.log.info("🔌 Prisma disconnected from database");
  });
}

// 使用 fastify-plugin 包装，确保插件正确注册
export default fp(prismaPlugin, {
  name: "prisma", // 插件名称
});
```

**关键点：**

- `PrismaClient`：Prisma 数据库客户端
- `$connect()`：连接数据库
- `$disconnect()`：断开连接
- `fastify.decorate()`：向 Fastify 实例添加属性
- `fastify.addHook('onClose')`：注册关闭钩子

---

### 8. Swagger 插件 (`src/plugins/swagger.js`)

```javascript
/**
 * Swagger 插件
 * 作用：自动生成 API 文档
 * 访问地址：http://localhost:3000/documentation
 */

import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

export async function registerSwagger(fastify) {
  // 1. 注册 Swagger（生成 OpenAPI 规范）
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Todos REST API", // API 标题
        description: "A complete Fastify + Prisma + SQLite Todos REST API",
        version: "1.0.0", // API 版本
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
      ],
      tags: [{ name: "todos", description: "Todo related endpoints" }],
    },
  });

  // 2. 注册 Swagger UI（可视化界面）
  await fastify.register(swaggerUi, {
    routePrefix: "/documentation", // 文档访问路径
    uiConfig: {
      docExpansion: "list", // 默认展开列表
      deepLinking: true, // 启用深度链接
    },
    staticCSP: true, // 启用 CSP
  });

  fastify.log.info("📚 Swagger documentation available at /documentation");
}
```

---

## 常见写法说明

### 1. ES6 模块导入导出

```javascript
// 导出（类似前端的 export）
export class TodoService {} // 命名导出
export default function todoRoutes() {} // 默认导出

// 导入（类似前端的 import）
import { TodoService } from "./services/todo.service.js"; // 命名导入
import todoRoutes from "./routes/todo.routes.js"; // 默认导入
```

**注意：**

- Node.js 中必须写 `.js` 扩展名
- `package.json` 中需要设置 `"type": "module"`

---

### 2. async/await 异步处理

```javascript
// 前端写法
const fetchTodos = async () => {
  const response = await fetch("/api/todos");
  const data = await response.json();
  return data;
};

// 后端写法（类似）
async function getAllTodos(request, reply) {
  const todos = await this.todoService.getAllTodos();
  return reply.send({ data: todos });
}
```

**关键点：**

- `async` 函数返回 Promise
- `await` 等待 Promise 完成
- 必须在 `async` 函数内使用 `await`

---

### 3. 类和构造函数

```javascript
// 定义类
export class TodoController {
  // 构造函数（创建实例时调用）
  constructor(fastify) {
    this.todoService = new TodoService(fastify.prisma);
  }

  // 实例方法
  async getAllTodos(request, reply) {
    // this 指向当前实例
    const todos = await this.todoService.getAllTodos();
  }
}

// 使用类
const controller = new TodoController(fastify);
```

**类比前端：**

```javascript
// React 类组件
class TodoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { todos: [] };
  }
}
```

---

### 4. 对象解构

```javascript
// 从对象中提取属性
const { id } = request.params; // 等同于 const id = request.params.id
const { completed } = request.query;
const { title, description } = request.body;

// 函数参数解构
async function getAllTodos({ completed }) {
  // completed 直接可用
}
```

---

### 5. 展开运算符

```javascript
// 对象合并
const data = {
  ...(title !== undefined && { title }), // 条件展开
  ...(description !== undefined && { description }),
};

// 等同于
const data = {};
if (title !== undefined) data.title = title;
if (description !== undefined) data.description = description;
```

---

### 6. 箭头函数 vs 普通函数

```javascript
// 箭头函数（this 继承自外层）
const add = (a, b) => a + b;

// 普通函数（this 取决于调用方式）
function add(a, b) {
  return a + b;
}

// 类方法中的 this 绑定
controller.getAllTodos.bind(controller); // 确保 this 指向 controller
```

---

### 7. 环境变量

```javascript
// .env 文件
DATABASE_URL = "file:./dev.db";
PORT = 3000;
NODE_ENV = development;

// 读取环境变量
const port = process.env.PORT || 3000; // 如果未设置，使用默认值 3000
const isDev = process.env.NODE_ENV === "development";
```

---

### 8. 错误处理

```javascript
// try/catch 捕获错误
try {
  const todo = await this.todoService.getTodoById(id);
  return reply.send({ data: todo });
} catch (error) {
  // 记录错误日志
  request.log.error(error);

  // 返回错误响应
  return reply.code(500).send({
    success: false,
    error: "Failed to fetch todo",
  });
}
```

---

## 开发流程

### 1. 添加新功能的步骤

假设要添加"批量删除 Todos"功能：

#### Step 1: 定义数据库操作（Service 层）

```javascript
// src/services/todo.service.js
async deleteManyTodos(ids) {
  return await this.prisma.todo.deleteMany({
    where: {
      id: { in: ids.map(id => parseInt(id)) }
    }
  });
}
```

#### Step 2: 添加控制器方法（Controller 层）

```javascript
// src/controllers/todo.controller.js
async deleteManyTodos(request, reply) {
  try {
    const { ids } = request.body;  // [1, 2, 3]

    const result = await this.todoService.deleteManyTodos(ids);

    return reply.code(200).send({
      success: true,
      message: `Deleted ${result.count} todos`,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to delete todos',
    });
  }
}
```

#### Step 3: 添加路由（Routes 层）

```javascript
// src/routes/todo.routes.js
fastify.post(
  "/todos/delete-many",
  {
    schema: {
      description: "Delete multiple todos",
      tags: ["todos"],
      body: {
        type: "object",
        required: ["ids"],
        properties: {
          ids: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
      },
    },
  },
  controller.deleteManyTodos.bind(controller)
);
```

#### Step 4: 测试 API

```bash
# 使用 curl 测试
curl -X POST http://localhost:3000/api/todos/delete-many \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 2, 3]}'
```

---

### 2. 修改数据库模型

#### Step 1: 修改 Prisma Schema

```prisma
// prisma/schema.prisma
model Todo {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  completed   Boolean  @default(false)
  priority    String   @default("medium")  // 新增：优先级
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("todos")
}
```

#### Step 2: 创建迁移

```bash
npm run prisma:migrate
# 输入迁移名称：add_priority_field
```

#### Step 3: 更新代码

```javascript
// src/services/todo.service.js
async createTodo(data) {
  return await this.prisma.todo.create({
    data: {
      title: data.title,
      description: data.description || null,
      priority: data.priority || 'medium',  // 新增
      completed: false,
    },
  });
}
```

---

### 3. 调试技巧

#### 使用日志

```javascript
// 在任何地方打印日志
fastify.log.info("这是信息日志");
fastify.log.error("这是错误日志");
fastify.log.debug("这是调试日志");

// 或使用 console.log（不推荐）
console.log("调试信息", { id, title });
```

#### 使用 Prisma Studio

```bash
# 打开可视化数据库管理界面
npm run prisma:studio
```

在浏览器中打开 `http://localhost:5555`，可以直接查看和编辑数据库。

#### 使用 VSCode REST Client

创建 `test.http` 文件：

```http
### 获取所有 Todos
GET http://localhost:3000/api/todos

### 创建 Todo
POST http://localhost:3000/api/todos
Content-Type: application/json

{
  "title": "测试 Todo",
  "description": "这是描述"
}

### 更新 Todo
PUT http://localhost:3000/api/todos/1
Content-Type: application/json

{
  "title": "更新后的标题",
  "completed": true
}
```

点击 `Send Request` 即可测试 API。

---

## 常见问题

### 1. 为什么要用三层架构？

**问题：** 为什么不直接在路由里写数据库操作？

**答案：**

- **可维护性**：代码分层清晰，易于修改
- **可测试性**：可以单独测试每一层
- **可复用性**：Service 可以被多个 Controller 使用
- **关注点分离**：每层只关注自己的职责

```javascript
// ❌ 不好的做法：所有逻辑混在一起
fastify.get("/todos", async (request, reply) => {
  const prisma = new PrismaClient();
  const todos = await prisma.todo.findMany();
  return reply.send({ data: todos });
});

// ✅ 好的做法：分层清晰
// Routes → Controller → Service → Database
```

---

### 2. async/await 和 Promise 的关系？

```javascript
// Promise 写法
function getTodos() {
  return prisma.todo
    .findMany()
    .then((todos) => {
      return { data: todos };
    })
    .catch((error) => {
      console.error(error);
    });
}

// async/await 写法（更清晰）
async function getTodos() {
  try {
    const todos = await prisma.todo.findMany();
    return { data: todos };
  } catch (error) {
    console.error(error);
  }
}
```

**关键点：**

- `async/await` 是 Promise 的语法糖
- `await` 等待 Promise 完成
- 更接近同步代码的写法，更易读

---

### 3. 为什么要用 parseInt(id)？

```javascript
// URL 参数是字符串
request.params.id; // "1" (字符串)

// Prisma 需要整数
await prisma.todo.findUnique({
  where: { id: parseInt(id) }, // 转换为数字 1
});
```

---

### 4. .bind(controller) 是什么意思？

```javascript
// 问题：this 指向丢失
fastify.get("/todos", controller.getAllTodos);
// 此时 getAllTodos 内的 this 不是 controller

// 解决：绑定 this
fastify.get("/todos", controller.getAllTodos.bind(controller));
// 确保 this 始终指向 controller 实例
```

**类比前端：**

```javascript
// React 类组件
<button onClick={this.handleClick.bind(this)}>Click</button>
```

---

### 5. 什么时候用 GET/POST/PUT/DELETE？

| HTTP 方法 | 用途     | 是否幂等 | 示例             |
| --------- | -------- | -------- | ---------------- |
| GET       | 获取资源 | 是       | 获取 Todos 列表  |
| POST      | 创建资源 | 否       | 创建新 Todo      |
| PUT       | 完整更新 | 是       | 更新整个 Todo    |
| PATCH     | 部分更新 | 是       | 只更新 completed |
| DELETE    | 删除资源 | 是       | 删除 Todo        |

**幂等性：** 多次执行结果相同

---

### 6. 如何处理关联数据？

假设 Todo 有多个 Tag：

```prisma
// prisma/schema.prisma
model Todo {
  id    Int    @id @default(autoincrement())
  title String
  tags  Tag[]  // 一对多关系
}

model Tag {
  id     Int    @id @default(autoincrement())
  name   String
  todoId Int
  todo   Todo   @relation(fields: [todoId], references: [id])
}
```

```javascript
// 查询时包含关联数据
const todo = await prisma.todo.findUnique({
  where: { id: 1 },
  include: {
    tags: true,  // 包含所有 tags
  },
});

// 结果
{
  id: 1,
  title: "学习 Fastify",
  tags: [
    { id: 1, name: "编程" },
    { id: 2, name: "后端" }
  ]
}
```

---

### 7. 如何实现分页？

```javascript
// Service 层
async getAllTodos({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;

  const [todos, total] = await Promise.all([
    this.prisma.todo.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.todo.count(),
  ]);

  return {
    data: todos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

### 8. 如何添加身份验证？

```javascript
// 安装 JWT 插件
npm install @fastify/jwt

// 注册插件
await fastify.register(require('@fastify/jwt'), {
  secret: 'your-secret-key'
});

// 保护路由
fastify.get('/todos', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();  // 验证 JWT token
    } catch (err) {
      reply.send(err);
    }
  }
}, controller.getAllTodos.bind(controller));
```

---

## 学习路径建议

### 第一周：基础概念

1. 理解 HTTP 方法和状态码
2. 学习 async/await 和 Promise
3. 熟悉 ES6+ 语法（解构、展开运算符等）
4. 了解 RESTful API 设计原则

### 第二周：Fastify 框架

1. 学习 Fastify 路由系统
2. 理解插件机制
3. 掌握请求验证（Schema）
4. 学习错误处理

### 第三周：Prisma ORM

1. 学习 Prisma Schema 语法
2. 掌握 CRUD 操作
3. 理解数据库迁移
4. 学习关联查询

### 第四周：实战项目

1. 添加用户认证
2. 实现文件上传
3. 添加数据验证
4. 部署到生产环境

---

## 推荐资源

### 官方文档

- [Fastify 官方文档](https://fastify.dev/)
- [Prisma 官方文档](https://www.prisma.io/docs)
- [Node.js 官方文档](https://nodejs.org/docs)

### 学习视频

- [Fastify 入门教程](https://www.youtube.com/results?search_query=fastify+tutorial)
- [Prisma 完整教程](https://www.youtube.com/results?search_query=prisma+tutorial)

### 实用工具

- [Postman](https://www.postman.com/) - API 测试工具
- [TablePlus](https://tableplus.com/) - 数据库管理工具
- [VSCode REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) - VSCode 插件

---

## 总结

### 核心要点

1. **三层架构**：Routes → Controller → Service
2. **Prisma ORM**：类型安全的数据库操作
3. **async/await**：处理异步操作
4. **Schema 验证**：确保数据正确性
5. **错误处理**：try/catch + 全局错误处理

### 下一步

1. ✅ 理解项目结构
2. ✅ 运行项目并测试 API
3. 📝 尝试添加新功能
4. 🔧 修改数据库模型
5. 🚀 部署到生产环境

---

**祝你学习愉快！有问题随时查阅这份文档。** 🎉
