import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const databaseArg = process.argv.find((arg) => arg.startsWith("--database="));
const databasePath = resolve(databaseArg?.slice("--database=".length) || "work/launchlayer-demo.sqlite");
mkdirSync(dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
const migration = resolve("drizzle/0000_launchlayer.sql");
if (!existsSync(migration)) throw new Error("Run npm run db:generate before seeding the demo database.");
db.exec(readFileSync(migration, "utf8"));

const now = "2026-09-19T12:00:00Z";
db.exec("BEGIN");
try {
  db.prepare("INSERT OR REPLACE INTO workspaces (id, name, created_at) VALUES (?, ?, ?)").run("ws-demo", "Atelier Commerce", now);
  db.prepare("INSERT OR REPLACE INTO users (id, email, display_name) VALUES (?, ?, ?)").run("user-demo", "owner@example.demo", "Demo Owner");
  db.prepare("INSERT OR REPLACE INTO memberships (id, workspace_id, user_id, role) VALUES (?, ?, ?, ?)").run("member-demo", "ws-demo", "user-demo", "owner");
  db.prepare("INSERT OR REPLACE INTO products (id, workspace_id, name, sku, stage, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run("prod-lumiere", "ws-demo", "Lumière Renewal Serum", "LUM-RS-30", "existing/on-market", "leave-on facial serum", now);
  db.prepare("INSERT OR REPLACE INTO product_versions (id, product_id, version, facts_json, created_at) VALUES (?, ?, ?, ?, ?)").run("pv-lumiere-13", "prod-lumiere", "1.3", JSON.stringify({ currentMarkets: ["US"], targetMarkets: ["EU", "JP"], sampleData: true }), now);
  db.exec("COMMIT");
  console.log(`Seeded LaunchLayer demonstration database at ${databasePath}`);
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
