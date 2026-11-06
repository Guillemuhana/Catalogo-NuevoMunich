# Nuevo Munich · Catálogo de productos

Catálogo online de Nuevo Munich (fiambres artesanales desde 1972). React + Vite + Tailwind v4 + Motion + Lenis + Supabase. Deploy en Vercel.

## Qué tiene
- Intro con logo, hero con parallax, sello giratorio "1972", marquee de categorías
- Navegación sticky por categoría con scroll-spy
- Cards con tilt 3D, brillo que sigue al mouse y transición compartida al detalle
- Detalle de producto con presentaciones, cantidad, relacionados y link compartible (`#p=slug`)
- Buscador ⌘K / Ctrl+K / "/" (sin tildes, con teclado)
- "Mi pedido" que arma el mensaje y lo manda por WhatsApp (ventas: 351 384-4802)
- Sección Food Truck (Superpancho Premium, Picada) con WhatsApp de reservas 351 814-5265
- Historia, contacto y redes
- Si Supabase no está configurado, usa `src/data/seed.js`

## Local
```bash
npm i
cp .env.example .env   # completar URL y anon key
npm run dev
```

## Supabase
1. SQL Editor → correr `supabase/schema.sql` (tablas, RLS de solo lectura y bucket `productos`).
2. Correr `supabase/seed.sql` (7 categorías y 37 productos de la web).
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
Importar el repo de GitHub → Framework: Vite → variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` → Deploy.

## Marca
Colores: rojo `#C04B54`, marrón `#5A270D`, dorado `#FFCC00` (en `src/index.css`, bloque `@theme`).
Tipografías: Cormorant Unicase (títulos) e Inria Sans (texto), las mismas de nuevomunich.com.ar.
