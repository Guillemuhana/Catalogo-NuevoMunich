-- Catálogo Nuevo Munich — esquema
create table if not exists public.categorias (
  slug        text primary key,
  nombre      text not null,
  bajada      text,
  imagen_url  text,
  orden       int  default 0
);

create table if not exists public.productos (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  categoria       text not null references public.categorias(slug) on update cascade,
  nombre          text not null,
  descripcion     text default '',
  presentaciones  jsonb default '[]'::jsonb,   -- ["Pieza 4 kg","Media pieza 2 kg"]
  imagen_url      text,                        -- URL pública (Supabase Storage o la que mande n8n)
  destacado       boolean default false,
  activo          boolean default true,
  orden           int default 0,
  actualizado_en  timestamptz default now()
);

create index if not exists productos_categoria_idx on public.productos(categoria);

create or replace function public.tocar_actualizado() returns trigger language plpgsql as $$
begin new.actualizado_en = now(); return new; end $$;
drop trigger if exists productos_actualizado on public.productos;
create trigger productos_actualizado before update on public.productos
  for each row execute function public.tocar_actualizado();

-- Lectura pública, escritura solo con service_role (n8n / panel admin)
alter table public.categorias enable row level security;
alter table public.productos  enable row level security;
drop policy if exists "lectura publica categorias" on public.categorias;
drop policy if exists "lectura publica productos"  on public.productos;
create policy "lectura publica categorias" on public.categorias for select using (true);
create policy "lectura publica productos"  on public.productos  for select using (activo);

-- Bucket público para las fotos
insert into storage.buckets (id, name, public) values ('productos', 'productos', true)
on conflict (id) do nothing;
drop policy if exists "fotos publicas" on storage.objects;
create policy "fotos publicas" on storage.objects for select using (bucket_id = 'productos');
