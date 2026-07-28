import { readFile } from "node:fs/promises";
import postgres from "postgres";

function databaseConnectionUrl() {
  if (
    process.env.POSTGRES_HOST &&
    process.env.POSTGRES_USER &&
    process.env.POSTGRES_PASSWORD
  ) {
    const url = new URL("postgresql://placeholder");
    url.hostname = process.env.POSTGRES_HOST;
    url.port = process.env.POSTGRES_PORT ?? "6543";
    url.username = process.env.POSTGRES_USER;
    url.password = process.env.POSTGRES_PASSWORD;
    url.pathname = `/${process.env.POSTGRES_DATABASE ?? "postgres"}`;
    url.searchParams.set("sslmode", "require");
    return url.toString();
  }
  return process.env.DATABASE_URL;
}

const databaseUrl = databaseConnectionUrl();

if (!databaseUrl) {
  console.log("La conexión de Supabase no está disponible; se omite la preparación remota.");
  process.exit(0);
}

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: "require",
  connect_timeout: 15,
});

const compatibilityStatements = [
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS worker_code text DEFAULT '' NOT NULL`,
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS first_names text DEFAULT '' NOT NULL`,
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS last_names text DEFAULT '' NOT NULL`,
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS gender text DEFAULT 'No informado' NOT NULL`,
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS work_sites text DEFAULT '[]' NOT NULL`,
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS advance_amount integer DEFAULT 0 NOT NULL`,
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS emergency_contacts text DEFAULT '[]' NOT NULL`,
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS active boolean DEFAULT true NOT NULL`,
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS source text DEFAULT 'Individual' NOT NULL`,
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS created_at text DEFAULT CURRENT_TIMESTAMP::text NOT NULL`,
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS updated_at text DEFAULT CURRENT_TIMESTAMP::text NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS workers_identity_number_unique_idx ON workers (identity_number)`,
  `ALTER TABLE attendance_entries ADD COLUMN IF NOT EXISTS review_note text DEFAULT '' NOT NULL`,
  `ALTER TABLE companies ADD COLUMN IF NOT EXISTS rut text DEFAULT '' NOT NULL`,
  `ALTER TABLE companies ADD COLUMN IF NOT EXISTS trade_name text DEFAULT '' NOT NULL`,
  `ALTER TABLE companies ADD COLUMN IF NOT EXISTS representative text DEFAULT '' NOT NULL`,
  `ALTER TABLE companies ADD COLUMN IF NOT EXISTS status text DEFAULT 'Activa' NOT NULL`,
];

try {
  const migration = await readFile(
    new URL("../drizzle-postgres/0000_heavy_vision.sql", import.meta.url),
    "utf8",
  );
  const createStatements = migration
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((statement) =>
      statement.replace(/^CREATE TABLE /, "CREATE TABLE IF NOT EXISTS "),
    );

  for (const statement of createStatements) await sql.unsafe(statement);
  for (const statement of compatibilityStatements) await sql.unsafe(statement);
  console.log("Estructura de Supabase preparada correctamente.");
} catch (error) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "desconocido";
  const reason =
    code === "28P01"
      ? "Supabase rechazó el usuario o la contraseña"
      : "no se pudo completar la conexión";
  throw new Error(`No fue posible preparar Supabase: ${reason} (código ${code}).`);
} finally {
  await sql.end();
}
