import { getFilesBucket } from "../../../../db";

export async function GET(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key") ?? "";
    if (!key.startsWith("workers/") && !key.startsWith("medical-leaves/") && !key.startsWith("attendance/") && !key.startsWith("document-templates/")) return new Response("Archivo no autorizado.", { status: 403 });
    const object = await getFilesBucket().get(key); if (!object) return new Response("Archivo no encontrado.", { status: 404 });
    const headers = new Headers(); object.writeHttpMetadata(headers); headers.set("etag", object.httpEtag); headers.set("content-disposition", `inline; filename="${key.split("/").pop()}"`);
    return new Response(object.body, { headers });
  } catch { return new Response("No fue posible descargar el archivo.", { status: 500 }); }
}
