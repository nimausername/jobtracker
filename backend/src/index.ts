import { buildApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { createDb } from "./db/client.js";

/**
 * Boots the HTTP API server.
 */
const main = async (): Promise<void> => {
  const env = loadEnv();
  const { db, pool } = createDb(env);
  const app = await buildApp({ env, db });

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`Received ${signal}, shutting down`);
    await app.close();
    await pool.end();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  await app.listen({ host: env.HOST, port: env.PORT });
  app.log.info(`API listening on http://${env.HOST}:${env.PORT}`);
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
