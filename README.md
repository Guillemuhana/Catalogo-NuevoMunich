# Nuevo Munich · Catálogo de productos

Catálogo online de Nuevo Munich (fiambres artesanales desde 1972). React + Vite + Tailwind v4 + Motion + Lenis + Supabase. Deploy en Vercel.

## Qué tiene
- Intro con logo, hero con parallax, sello giratorio "1972", marquee y tarjetas de categoría
- Navegación sticky por categoría con scroll-spy
- Cards con la foto del envase; al pasar el mouse aparece la foto de ambiente
- Detalle de producto con galería, ingredientes, sugerencia, presentaciones, cantidad, relacionados y link compartible (`#p=slug`)
- Buscador ⌘K / Ctrl+K / "/" (sin tildes, con teclado)
- "Mi pedido" pide nombre y entrega, y manda el mensaje agrupado por categoría al asistente virtual (WhatsApp 351 701-0545). Las consultas de un producto van a ventas (351 384-4802)
- Sección Recetas con las publicadas por Nuevo Munich en Instagram (`src/data/recetas.js`; fotos en `public/img/recetas/`). Copiar el texto de la publicación, sin completarlo
- Catálogo en PDF para descargar, con índice y botones a WhatsApp e Instagram
- En celular: menú hamburguesa arriba y scroll nativo
- Estilo inspirado en el envase nuevo: negro con dibujos de comida, degradado dorado y franja roja y dorada
- Sección Food Truck (Superpancho Premium, Picada) con WhatsApp de reservas 351 814-5265
- Historia, contacto y redes
- Si Supabase no está configurado, usa `src/data/seed.js`

## Local
```bash
npm i
npm run dev
```
No hace falta configurar nada: sin `.env` la app usa el catálogo local. El `.env` solo se necesita si se conecta Supabase.

## Imágenes
Están en `public/img/`, optimizadas en WebP, y no dependen de ningún servicio externo:
- `productos/{slug}/{n}.webp` (hasta 1080 px) y `{n}-480.webp` (miniatura). El orden lo define `imagenes` en `src/data/seed.js`: primero el envase, al final la foto de ambiente.
- `categorias/`: piezas de categoría con la cinta roja. Traen el nombre en la imagen, así que van solo en las tarjetas sobre fondo blanco.
- `banners/`: fotos de ambiente para el encabezado de cada categoría.
- `marca/`: logo, ícono, hero, food truck y Oktoberfest.

## Catálogo PDF
Después de cambiar productos o fotos en `src/data/seed.js`, regeneralo y subí el resultado:
```bash
npm run catalogo
```
Crea `public/catalogo-nuevo-munich.pdf` usando el Chrome de la PC (o `CHROME_PATH`). Si un texto no entra en su ficha, el script avisa y no genera el archivo.

## Supabase (opcional)
1. SQL Editor → correr `supabase/schema.sql` (tablas, RLS de solo lectura y bucket `productos`).
2. Correr `supabase/seed.sql` (7 categorías y 38 productos).
3. Si editás `src/data/seed.js`: `node scripts/generar-seed.mjs > supabase/seed.sql`.

## Fotos desde n8n
Cada producto tiene `slug` único e `imagen_url`. Desde n8n:
1. Subir la imagen al bucket: `POST {SUPABASE_URL}/storage/v1/object/productos/{slug}.jpg`
   (headers `Authorization: Bearer {SERVICE_ROLE}`, `x-upsert: true`, body binario).
2. Guardar la URL pública:
   `POST {SUPABASE_URL}/rest/v1/productos?on_conflict=slug`
   headers `apikey`, `Authorization: Bearer {SERVICE_ROLE}`, `Prefer: resolution=merge-duplicates`
   body `{ "slug": "salchichas-frankfurt", "categoria": "salchichas", "nombre": "Frankfurt", "imagen_url": "{SUPABASE_URL}/storage/v1/object/public/productos/salchichas-frankfurt.jpg" }`

La service role key va solo en n8n, nunca en el frontend.

## Vercel
Importar el repo de GitHub → Framework: Vite → Deploy. Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` solo hacen falta si se usa Supabase.

## Marca
Colores: rojo `#C04B54`, marrón `#5A270D`, dorado `#FFCC00` (en `src/index.css`, bloque `@theme`).
Tipografías: Cormorant Unicase (títulos) e Inria Sans (texto), las mismas de nuevomunich.com.ar.

