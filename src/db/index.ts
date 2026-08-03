import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://tarea_user:tarea_pass@localhost:5432/tarea_db",
});

export const db = drizzle(pool, { schema });
