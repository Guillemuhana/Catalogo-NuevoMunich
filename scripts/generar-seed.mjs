// node scripts/generar-seed.mjs > supabase/seed.sql
import { categorias, productos } from '../src/data/seed.js'
const q = (v) => (v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
console.log('-- Generado desde src/data/seed.js')
for (const c of categorias)
  console.log(`insert into public.categorias (slug,nombre,bajada,imagen_url,orden) values (${q(c.slug)},${q(c.nombre)},${q(c.bajada)},${q(c.imagen_url)},${c.orden}) on conflict (slug) do update set nombre=excluded.nombre,bajada=excluded.bajada,imagen_url=excluded.imagen_url,orden=excluded.orden;`)
productos.forEach((p, i) =>
  console.log(`insert into public.productos (slug,categoria,nombre,descripcion,presentaciones,imagen_url,destacado,orden) values (${q(p.slug)},${q(p.categoria)},${q(p.nombre)},${q(p.descripcion)},${q(JSON.stringify(p.presentaciones))}::jsonb,${q(p.imagen_url)},${p.destacado},${i}) on conflict (slug) do nothing;`))
