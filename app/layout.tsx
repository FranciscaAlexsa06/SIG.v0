import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;
  return {
    title: "Sistema Integral de Gestión",
    description: "Plataforma corporativa para la gestión de personas, documentos, asistencia y procesos.",
    openGraph: { title: "Sistema Integral de Gestión", description: "Personas, documentos, asistencia y procesos en una sola plataforma.", images: [{ url: imageUrl, width: 1792, height: 912 }] },
    twitter: { card: "summary_large_image", title: "Sistema Integral de Gestión", description: "Personas, documentos, asistencia y procesos en una sola plataforma.", images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
