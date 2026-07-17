import { and, desc, eq } from "drizzle-orm";
import { getDb, getFilesBucket } from "../../../db";
import { auditEvents, workerRecords } from "../../../db/schema";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url); const rut = url.searchParams.get("rut")?.trim(); const category = url.searchParams.get("category")?.trim();
    if (!rut) return Response.json({ error: "Falta el trabajador." }, { status: 400 });
    const condition = category ? and(eq(workerRecords.workerRut, rut), eq(workerRecords.category, category)) : eq(workerRecords.workerRut, rut);
    return Response.json({ records: await getDb().select().from(workerRecords).where(condition).orderBy(desc(workerRecords.createdAt)).limit(1000) });
  } catch (error) { return Response.json({ records: [], error: error instanceof Error ? error.message : "No fue posible consultar los registros." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const workerRut = String(form.get("workerRut") ?? "").trim(); const category = String(form.get("category") ?? "").trim(); const subtype = String(form.get("subtype") ?? "").trim();
    if (!workerRut || !category || !subtype) return Response.json({ error: "Completa trabajador, categoría y tipo." }, { status: 400 });
    const id = `REG-${crypto.randomUUID().slice(0, 10).toUpperCase()}`; const file = form.get("file"); let fileKey = ""; let fileName = ""; let contentType = "";
    if (file instanceof File && file.size) { fileName = file.name; contentType = file.type || "application/octet-stream"; fileKey = `workers/${workerRut.replace(/[^a-zA-Z0-9-]/g, "_")}/${category.replace(/[^a-zA-Z0-9-]/g, "_")}/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`; await getFilesBucket().put(fileKey, await file.arrayBuffer(), { httpMetadata: { contentType } }); }
    const [record] = await getDb().insert(workerRecords).values({ id, workerRut, category, subtype, title: String(form.get("title") ?? subtype).trim() || subtype, issueDate: String(form.get("issueDate") ?? ""), expiryDate: String(form.get("expiryDate") ?? ""), status: String(form.get("status") ?? "Vigente"), detail: String(form.get("detail") ?? ""), metadata: String(form.get("metadata") ?? "{}"), fileName, fileKey, contentType }).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: category, action: "Agregar registro de trabajador", recordId: id, detail: `${subtype} asociado a ${workerRut}` });
    return Response.json({ record }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible guardar el registro." }, { status: 500 }); }
}
