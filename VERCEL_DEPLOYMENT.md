# Publicación de prueba en Vercel

Esta rama usa Next.js, que es el formato esperado por Vercel. Los datos y
documentos se guardan en un proyecto gratuito de Supabase.

## 1. Crear el espacio gratuito de pruebas

1. Crear una cuenta en Supabase y elegir el plan **Free**.
2. Crear un proyecto vacío. No ingresar todavía información real de
   trabajadores.
3. En la configuración del proyecto, copiar:
   - la dirección de conexión de la base de datos;
   - la dirección pública del proyecto;
   - una llave privada nueva con formato `sb_secret_...`.
4. Copiar `.env.example` como `.env.local` y completar esos valores.
5. Ejecutar `pnpm setup:supabase` una sola vez. Esto crea las tablas y una
   bóveda privada llamada `sig-documents`.

## 2. Configurar Vercel

En **Settings > Environment Variables** agregar:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_DOCUMENTS_BUCKET` con el valor `sig-documents`

No se debe publicar ni enviar por correo la llave privada `sb_secret_...`.

## 3. Publicar la rama

Vercel detectará automáticamente Next.js y ejecutará `pnpm build`. Ya no se
debe configurar manualmente una carpeta de salida: Vercel utilizará `.next`.

Para esta etapa se deben utilizar exclusivamente datos ficticios. El plan
gratuito sirve para pruebas, no para operar la información laboral real de la
empresa.
