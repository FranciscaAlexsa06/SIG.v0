import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const required = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(`Faltan estas variables en .env.local: ${missing.join(", ")}`);
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  prepare: false,
  ssl: "require",
});

try {
  await migrate(drizzle(sql), { migrationsFolder: "./drizzle-postgres" });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
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
