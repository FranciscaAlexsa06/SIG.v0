import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
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
const required = ["NEXT_PUBLIC_SUPABASE_URL"];

const missing = required.filter((name) => !process.env[name]);
if (!databaseUrl) missing.push("POSTGRES_HOST, POSTGRES_USER y POSTGRES_PASSWORD");
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!secretKey) missing.push("SUPABASE_SECRET_KEY");
if (missing.length) {
  throw new Error(`Faltan estas variables en .env.local: ${missing.join(", ")}`);
}

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: "require",
});

try {
  await migrate(drizzle(sql), { migrationsFolder: "./drizzle-postgres" });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    secretKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const bucketName = process.env.SUPABASE_DOCUMENTS_BUCKET ?? "sig-documents";
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;
  if (!buckets.some((bucket) => bucket.name === bucketName)) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 25 * 1024 * 1024,
    });
    if (error) throw error;
  }

  console.log("Base de datos y bóveda privada preparadas correctamente.");
} finally {
  await sql.end();
}
