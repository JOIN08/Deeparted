import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST ?? "localhost",
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 10,
});

export async function initializeDatabase(): Promise<void> {
  const migrationDirectory = path.resolve("server/migrations");
  await pool.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name TEXT PRIMARY KEY,
       applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     )`,
  );

  const migrationFiles = (await readdir(migrationDirectory))
    .filter((fileName) => /^\d+_.+\.sql$/.test(fileName))
    .sort();

  for (const fileName of migrationFiles) {
    const alreadyApplied = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE name = $1",
      [fileName],
    );
    if (alreadyApplied.rowCount) continue;

    const sql = await readFile(path.join(migrationDirectory, fileName), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        fileName,
      ]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    console.info(`Applied database migration "${fileName}".`);
  }
}
