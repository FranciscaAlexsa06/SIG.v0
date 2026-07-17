import { desc } from "drizzle-orm";
import { getDb, getFilesBucket } from "../../../db";
import { auditEvents, documentTemplates } from "../../../db/schema";

export async function GET() {
  try { return Response.json({ templates: await getDb().select().from(documentTemplates).orderBy(desc(documentTemplates.createdAt)) }); }
  catch (error) { return Response.json({ templates: [], error: error instanceof Error ? error.message : "No fue posible consultar los formatos." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData(); const file = form.get("file"); const name = String(form.get("name") ?? "").trim(); const documentType = String(form.get("documentType") ?? "").trim();
    if (!name || !documentType || !(file instanceof File) || !file.size) return Response.json({ error: "Completa el nombre, tipo y archivo del formato." }, { status: 400 });
    const id = `PLT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`; const contentType = file.type || "application/octet-stream"; const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_"); const fileKey = `document-templates/${id}-${safeName}`;
    await getFilesBucket().put(fileKey, await file.arrayBuffer(), { httpMetadata: { contentType } });
    const [template] = await getDb().insert(documentTemplates).values({ id, name, documentType, description: String(form.get("description") ?? ""), fileName: file.name, fileKey, contentType }).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Carga de formato documental", recordId: id, detail: `${documentType}: ${name}` });
    return Response.json({ template }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible cargar el formato." }, { status: 500 }); }
}
