/**
 * Server Entry Point
 * 启动 Fastify 服务器
 */

import { buildApp } from './app.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * 启动服务器
 */
async function start() {
  let fastify;
  
  try {
    fastify = await buildApp();

    // 启动服务器
    await fastify.listen({ port: PORT, host: HOST });

    console.log('\n🚀 Server is running!');
    console.log(`📍 API: http://localhost:${PORT}`);
    console.log(`📚 Swagger Docs: http://localhost:${PORT}/documentation`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);

  } catch (err) {
    if (fastify) {
      fastify.log.error(err);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

// 优雅关闭
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received, closing server gracefully...`);
    process.exit(0);
  });
});

// 启动服务器
start();