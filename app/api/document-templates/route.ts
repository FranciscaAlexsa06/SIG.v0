import { desc, eq } from "drizzle-orm";
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

export async function PATCH(request: Request) {
  try {
    const form = await request.formData(); const id = String(form.get("id") ?? "").trim(); const name = String(form.get("name") ?? "").trim(); const documentType = String(form.get("documentType") ?? "").trim();
    if (!id || !name || !documentType) return Response.json({ error: "Completa el nombre y tipo del formato." }, { status: 400 });
    const [current] = await getDb().select().from(documentTemplates).where(eq(documentTemplates.id, id)).limit(1);
    if (!current) return Response.json({ error: "No se encontró el formato documental." }, { status: 404 });
    let fileName = current.fileName; let fileKey = current.fileKey; let contentType = current.contentType; const file = form.get("file");
    if (file instanceof File && file.size) {
      if (fileKey) await getFilesBucket().delete(fileKey);
      fileName = file.name; contentType = file.type || "application/octet-stream"; fileKey = `document-templates/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await getFilesBucket().put(fileKey, await file.arrayBuffer(), { httpMetadata: { contentType } });
    }
    const [template] = await getDb().update(documentTemplates).set({ name, documentType, description: String(form.get("description") ?? ""), fileName, fileKey, contentType }).where(eq(documentTemplates.id, id)).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Modificar formato documental", recordId: id, detail: `${documentType}: ${name}` });
    return Response.json({ template });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible modificar el formato." }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const id = String(new URL(request.url).searchParams.get("id") ?? "").trim();
    if (!id) return Response.json({ error: "Selecciona el formato que deseas eliminar." }, { status: 400 });
    const [current] = await getDb().select().from(documentTemplates).where(eq(documentTemplates.id, id)).limit(1);
    if (!current) return Response.json({ error: "No se encontró el formato documental." }, { status: 404 });
    if (current.fileKey) await getFilesBucket().delete(current.fileKey);
    await getDb().delete(documentTemplates).where(eq(documentTemplates.id, id));
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Eliminar formato documental", recordId: id, detail: current.name });
    return Response.json({ deleted: true });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible eliminar el formato." }, { status: 500 }); }
}
