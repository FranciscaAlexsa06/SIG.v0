import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditEvents } from "../../../db/schema";

export async function GET() {
  try {
    const events = await getDb().select().from(auditEvents).orderBy(desc(auditEvents.createdAt)).limit(5000);
    return Response.json({ events }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ events: [], error: error instanceof Error ? error.message : "No fue posible consultar la auditoría." }, { status: 503 });
  }
}
