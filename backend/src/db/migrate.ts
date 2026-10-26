import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

import { loadEnv } from "../config/env.js";

const { Pool } = pg;

/**
 * Applies SQL migrations from the `drizzle` folder.
 */
const run = async (): Promise<void> => {
  const env = loadEnv();
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied successfully");
  } finally {
    await pool.end();
  }
};

run().catch((error: unknown) => {
  console.error("Migration failed", error);
  process.exit(1);
});
