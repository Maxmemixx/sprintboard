import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const migrationsDirectory = path.resolve(
  currentDirectory,
  "../../migrations",
);

async function migrate(): Promise<void> {
  // Create a table that remembers which migrations have run.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Find SQL files and run them in filename order.
  const files = (await readdir(migrationsDirectory))
    .filter((file) => /^\d+_[a-zA-Z0-9_-]+\.sql$/.test(file))
    .sort();

  for (const filename of files) {
    const alreadyApplied = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE filename = $1",
      [filename],
    );

    if (alreadyApplied.rowCount && alreadyApplied.rowCount > 0) {
      console.log(`Skipping ${filename} (already applied)`);
      continue;
    }

    const sql = await readFile(
      path.join(migrationsDirectory, filename),
      "utf8",
    );

    console.log(`Applying ${filename}...`);

    // Run the migration and record it together in one transaction.
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [filename],
      );
      await client.query("COMMIT");

      console.log(`Applied ${filename}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  console.log("Migrations complete.");
}

try {
  await migrate();
} catch (error) {
  console.error("Migration failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}