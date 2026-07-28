import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

const globalForDatabase = globalThis as typeof globalThis & {
  sigDatabase?: Database;
  sigPostgresClient?: ReturnType<typeof postgres>;
  sigSupabaseAdmin?: SupabaseClient;
};

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "Falta configurar DATABASE_URL en Vercel. La aplicación está lista, pero aún no tiene una base de datos de pruebas conectada.",
    );
  }

  if (!globalForDatabase.sigPostgresClient) {
    globalForDatabase.sigPostgresClient = postgres(databaseUrl, {
      max: 5,
      prepare: false,
      ssl: "require",
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  globalForDatabase.sigDatabase ??= drizzle(globalForDatabase.sigPostgresClient, { schema });
  return globalForDatabase.sigDatabase;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Falta configurar la bóveda privada de documentos de Supabase en Vercel.",
    );
  }

  globalForDatabase.sigSupabaseAdmin ??= createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return globalForDatabase.sigSupabaseAdmin;
}

const documentsBucket = process.env.SUPABASE_DOCUMENTS_BUCKET ?? "sig-documents";

export function getFilesBucket() {
  const bucket = getSupabaseAdmin().storage.from(documentsBucket);

  return {
    async put(
      key: string,
      data: ArrayBuffer,
      options?: { httpMetadata?: { contentType?: string } },
    ) {
      const { error } = await bucket.upload(key, data, {
        contentType: options?.httpMetadata?.contentType ?? "application/octet-stream",
        upsert: false,
      });
      if (error) throw new Error(`No fue posible guardar el documento: ${error.message}`);
    },

    async get(key: string) {
      const { data, error } = await bucket.download(key);
      if (error || !data) return null;
      return {
        body: data,
        contentType: data.type || "application/octet-stream",
      };
    },

    async delete(key: string) {
      const { error } = await bucket.remove([key]);
      if (error) throw new Error(`No fue posible eliminar el documento: ${error.message}`);
    },
  };
}
