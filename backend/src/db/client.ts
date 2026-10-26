import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import type { Env } from "../config/env.js";
import * as schema from "./schema/index.js";

const { Pool } = pg;

/**
 * Creates a Drizzle database client backed by node-postgres.
 */
export const createDb = (env: Env) => {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  return { db, pool };
};

export type Database = ReturnType<typeof createDb>["db"];
