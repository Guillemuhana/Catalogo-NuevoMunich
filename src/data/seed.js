// Catálogo local (fuente de datos mientras no se use Supabase).
// Las imágenes viven en public/img/. Si editás algo, regenerá el SQL:
//   node scripts/generar-seed.mjs > supabase/seed.sql

import { etiquetas } from './nutricion.js'

export const categorias = [
  { slug: 'feteados', nombre: 'Feteados', bajada: 'Listos para servir. 100 g aprox., envasados al vacío.', imagen_url: 'img/categorias/feteados.webp', banner_url: 'img/banners/feteados.webp', orden: 1 },
  { slug: 'jamones', nombre: 'Jamones', bajada: 'Piezas enteras y fracciones para fiambrería y mesa.', imagen_url: 'img/categorias/jamones.webp', banner_url: 'img/banners/jamones.webp', orden: 2 },
  { slug: 'arrollados', nombre: 'Arrollados', bajada: 'Clásicos de mesa, en fracción o unidad completa.', imagen_url: 'img/categorias/arrollados.webp', banner_url: 'img/banners/arrollados.webp', orden: 3 },
  { slug: 'salames', nombre: 'Salames', bajada: 'Picado grueso y fino, ahumados y tipo colonia.', imagen_url: 'img/categorias/salames.webp', banner_url: 'img/banners/salames.webp', orden: 4 },
  { slug: 'linea-ogianco', nombre: 'Línea Ogianco', bajada: 'Arrollados y salchichas de la línea Ogianco.', imagen_url: 'img/categorias/linea-ogianco.webp', banner_url: 'img/banners/linea-ogianco.webp', orden: 5 },
  { slug: 'salchichas', nombre: 'Salchichas', bajada: 'De Viena a Frankfurt: la tradición del embutido centroeuropeo.', imagen_url: 'img/categorias/salchichas.webp', banner_url: 'img/banners/salchichas.webp', orden: 6 },
  { slug: 'especialidades', nombre: 'Especialidades', bajada: 'Recetas austríacas y alemanas heredadas desde 1972.', imagen_url: 'img/categorias/especialidades.webp', banner_url: 'img/banners/especialidades.webp', orden: 7 },
]

const base = (categoria, nombre, presentaciones = [], extra = {}) => ({
  slug: (categoria + '-' + nombre)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  categoria,
  nombre,
  descripcion: '',
  ingredientes: '',
  sugerencias: '',
  presentaciones,
  imagenes: [],
  imagen_url: extra.imagenes?.[0] ?? null,
  destacado: false,
  activo: true,
  ...extra,
})

// La etiqueta del envase manda sobre el texto de la web.
const p = (...args) => {
  const producto = base(...args)
  return { ...producto, ...etiquetas[producto.slug] }
}

const FET = ['100 g aprox. · al vacío']

// imagenes: primero el envase (foto principal), al final la foto de ambiente.
export const productos = [
  // feteados
  p('feteados', 'Bondiola', FET, {
    ingredientes: 'Bondiola de cerdo, pimienta negra, coriandro, sal y azúcar.',
    sugerencias: 'Ideal para tablas y sándwiches.',
    destacado: true,
    imagenes: [
      'img/productos/feteados-bondiola/1.webp',
      'img/productos/feteados-bondiola/2.webp',
    ],
  }),
  p('feteados', 'Arrollado de Pollo', FET, {
    ingredientes: 'Pechuga deshuesada de pollo, huevo, zanahoria, ají molido y orégano.',
    sugerencias: 'Se puede acompañar con una ensalada o preparar en tablas y sándwiches.',
    imagenes: [
      'img/productos/feteados-arrollado-de-pollo/1.webp',
      'img/productos/feteados-arrollado-de-pollo/2.webp',
    ],
  }),
  p('feteados', 'Panceta Cocida Ahumada Salada', FET, {
    ingredientes: 'Panceta de cerdo, clavo de olor, pimienta, coriandro y sal.',
    sugerencias: 'Utilizar una feta de panceta para envolver una de nuestras salchichas y dorar a la plancha.',
    imagenes: [
      'img/productos/feteados-panceta-cocida-ahumada-salada/1.webp',
      'img/productos/feteados-panceta-cocida-ahumada-salada/2.webp',
    ],
  }),
  p('feteados', 'Lomo Horneado y Ahumado a las Finas Hierbas', FET, {
    ingredientes: 'Lomo de cerdo, especiado con salvia, romero y orégano. Después de horneado es ahumado con madera de orégano.',
    sugerencias: 'Su degustación en tablas o platos refinados puede acompañarse con verduras, soufflé o legumbres.',
    destacado: true,
    imagenes: [
      'img/productos/feteados-lomo-horneado-y-ahumado-a-las-finas-hierbas/1.webp',
      'img/productos/feteados-lomo-horneado-y-ahumado-a-las-finas-hierbas/2.webp',
    ],
  }),
  p('feteados', 'Lomo de Cerdo Cocido', FET, {
    ingredientes: 'Lomo de cerdo. Después de horneado es ahumado con madera de orégano.',
    sugerencias: 'Su degustación en tablas o platos refinados puede acompañarse con verduras, soufflé o legumbres.',
    imagenes: [
      'img/productos/feteados-lomo-de-cerdo-cocido/1.webp',
      'img/productos/feteados-lomo-de-cerdo-cocido/2.webp',
    ],
  }),
  p('feteados', 'Jamón Tipo Bávaro Cocido', FET, {
    ingredientes: 'Jamón de cerdo, especias naturales. Horneado y ahumado con madera de orégano.',
    sugerencias: 'Ideal para tablas de fiambres.',
    imagenes: [
      'img/productos/feteados-jamon-tipo-bavaro-cocido/1.webp',
      'img/productos/feteados-jamon-tipo-bavaro-cocido/2.webp',
    ],
  }),
  p('feteados', 'Jamón Cocido', FET, {
    ingredientes: 'Pata de cerdo deshuesada, sometida a inyección de salmuera y cocida con el cuero.',
    sugerencias: 'Ideal para tabla de fiambres o para recetas de pizzas y sándwiches.',
    imagenes: [
      'img/productos/feteados-jamon-cocido/1.webp',
      'img/productos/feteados-jamon-cocido/2.webp',
    ],
  }),
  p('feteados', 'Jamón Tipo Asado', FET, {
    ingredientes: 'Elaborado con pernil de cerdo, pimienta negra en granos, ají molido, pimentón y nuez moscada.',
    sugerencias: 'Ideal para sándwiches o platos fríos con alguna salsa como vitel toné.',
    imagenes: [
      'img/productos/feteados-jamon-tipo-asado/1.webp',
      'img/productos/feteados-jamon-tipo-asado/2.webp',
    ],
  }),
  p('feteados', 'Arrollado Criollo', FET, {
    ingredientes: 'Carne de cerdo, tocino y especias naturales.',
    sugerencias: 'Ideal para tablas y sándwiches.',
    imagenes: [
      'img/productos/feteados-arrollado-criollo/1.webp',
      'img/productos/feteados-arrollado-criollo/2.webp',
    ],
  }),
  // jamones
  p('jamones', 'Jamón Cocido con Cuero', ['Unidad · 3 kg'], {
    ingredientes: 'Pata de cerdo deshuesada, sometida a inyección de salmuera y cocida con el cuero.',
    sugerencias: 'Ideal para tabla de fiambres o para recetas de pizzas y sándwiches.',
    imagenes: [
      'img/productos/jamones-jamon-cocido-con-cuero/1.webp',
      'img/productos/jamones-jamon-cocido-con-cuero/2.webp',
    ],
  }),
  p('jamones', 'Jamón Tipo Asado', ['Unidad · 4 kg', 'Media pieza · 2 kg'], {
    ingredientes: 'Elaborado con pernil de cerdo, pimienta negra en granos, ají molido, pimentón y nuez moscada.',
    sugerencias: 'Ideal para sándwiches o platos fríos con alguna salsa como vitel toné.',
    destacado: true,
    imagenes: [
      'img/productos/jamones-jamon-tipo-asado/1.webp',
      'img/productos/jamones-jamon-tipo-asado/2.webp',
      'img/productos/jamones-jamon-tipo-asado/3.webp',
    ],
  }),
  p('jamones', 'Jamón Cocido Tipo Bávaro', ['Unidad · 1 kg'], {
    ingredientes: 'Jamón de cerdo, especias naturales. Horneado y ahumado con madera de orégano.',
    sugerencias: 'Su degustación en tablas o platos refinados puede acompañarse con verduras, soufflé o legumbres.',
    imagenes: [
      'img/productos/jamones-jamon-cocido-tipo-bavaro/1.webp',
      'img/productos/jamones-jamon-cocido-tipo-bavaro/2.webp',
    ],
  }),
  p('jamones', 'Lomo de Cerdo Horneado y Ahumado', ['Fracción · 250 g', 'Unidad · 900 g'], {
    descripcion: 'También disponible a las finas hierbas.',
    ingredientes: 'Jamón de cerdo, especias naturales. Horneado y ahumado con madera de orégano.',
    sugerencias: 'Su degustación en tablas o platos refinados puede acompañarse con verduras, soufflé o legumbres.',
    imagenes: [
      'img/productos/jamones-lomo-de-cerdo-horneado-y-ahumado/1.webp',
      'img/productos/jamones-lomo-de-cerdo-horneado-y-ahumado/2.webp',
      'img/productos/jamones-lomo-de-cerdo-horneado-y-ahumado/3.webp',
      'img/productos/jamones-lomo-de-cerdo-horneado-y-ahumado/4.webp',
      'img/productos/jamones-lomo-de-cerdo-horneado-y-ahumado/5.webp',
      'img/productos/jamones-lomo-de-cerdo-horneado-y-ahumado/6.webp',
      'img/productos/jamones-lomo-de-cerdo-horneado-y-ahumado/7.webp',
    ],
  }),
  // arrollados
  p('arrollados', 'Arrollado de Pollo', ['Fracción · 500 g', 'Unidad · 1,6 kg'], {
    ingredientes: 'Pechuga deshuesada de pollo, huevo, zanahoria, ají molido y orégano.',
    sugerencias: 'Se puede acompañar con una ensalada o preparar en tablas y sándwiches.',
    imagenes: [
      'img/productos/arrollados-arrollado-de-pollo/1.webp',
      'img/productos/arrollados-arrollado-de-pollo/2.webp',
      'img/productos/arrollados-arrollado-de-pollo/3.webp',
      'img/productos/arrollados-arrollado-de-pollo/4.webp',
    ],
  }),
  p('arrollados', 'Arrollado Criollo', ['Fracción · 500 g', 'Unidad · 1,6 kg'], {
    ingredientes: 'Carne de cerdo, tocino y especias naturales.',
    sugerencias: 'Ideal para tablas y sándwiches.',
    imagenes: [
      'img/productos/arrollados-arrollado-criollo/1.webp',
      'img/productos/arrollados-arrollado-criollo/2.webp',
      'img/productos/arrollados-arrollado-criollo/3.webp',
      'img/productos/arrollados-arrollado-criollo/4.webp',
    ],
  }),
  p('arrollados', 'Matambre Arrollado', ['Fracción · 500 g', 'Unidad · 1,6 kg'], {
    ingredientes: 'Matambre vacuno, zanahoria, huevo y especias naturales.',
    sugerencias: 'Ideal acompañado con vegetales, en tablas y sándwiches.',
    imagenes: [
      'img/productos/arrollados-matambre-arrollado/1.webp',
      'img/productos/arrollados-matambre-arrollado/2.webp',
      'img/productos/arrollados-matambre-arrollado/3.webp',
      'img/productos/arrollados-matambre-arrollado/4.webp',
      'img/productos/arrollados-matambre-arrollado/5.webp',
    ],
  }),
  // salames
  p('salames', 'Salame Tipo Alpino Ahumado Picado Grueso', ['Fracción · 200 g', 'Unidad · 400 g', 'Plancha (5 u.) · 2 kg'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, especias aromáticas.',
    sugerencias: 'Exquisito sabor y aroma gracias al toque ahumado natural con madera.',
    destacado: true,
    imagenes: [
      'img/productos/salames-salame-tipo-alpino-ahumado-picado-grueso/1.webp',
      'img/productos/salames-salame-tipo-alpino-ahumado-picado-grueso/2.webp',
      'img/productos/salames-salame-tipo-alpino-ahumado-picado-grueso/3.webp',
      'img/productos/salames-salame-tipo-alpino-ahumado-picado-grueso/4.webp',
    ],
  }),
  p('salames', 'Salame Tipo Colonia', ['Unidad · aprox. 200 g'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino y especias.',
    sugerencias: 'Ideal para tablas y sándwiches.',
    imagenes: [
      'img/productos/salames-salame-tipo-colonia/1.webp',
      'img/productos/salames-salame-tipo-colonia/2.webp',
      'img/productos/salames-salame-tipo-colonia/3.webp',
      'img/productos/salames-salame-tipo-colonia/4.webp',
    ],
  }),
  p('salames', 'Salame Holstein Ahumado Picado Fino', ['Fracción · 200 g', 'Unidad · 400 g', 'Plancha (5 u.) · 2 kg'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, especias aromáticas y embutido en tripa natural.',
    sugerencias: 'A diferencia de los salames tradicionales, al probarlo se destaca el sabor exquisito del toque final del ahumado.',
    imagenes: [
      'img/productos/salames-salame-holstein-ahumado-picado-fino/1.webp',
      'img/productos/salames-salame-holstein-ahumado-picado-fino/2.webp',
      'img/productos/salames-salame-holstein-ahumado-picado-fino/3.webp',
      'img/productos/salames-salame-holstein-ahumado-picado-fino/4.webp',
      'img/productos/salames-salame-holstein-ahumado-picado-fino/5.webp',
    ],
  }),
  // linea-ogianco
  p('linea-ogianco', 'Arrollado de Pollo Ogianco', ['Unidad · 1,6 kg', 'Fracción · 500 g'], {
    ingredientes: 'Pechuga deshuesada de pollo, huevo, zanahoria, ají molido y orégano.',
    sugerencias: 'Se puede acompañar con una ensalada o preparar en tablas y sándwiches.',
    imagenes: [
      'img/productos/linea-ogianco-arrollado-de-pollo-ogianco/1.webp',
      'img/productos/linea-ogianco-arrollado-de-pollo-ogianco/2.webp',
      'img/productos/linea-ogianco-arrollado-de-pollo-ogianco/3.webp',
    ],
  }),
  p('linea-ogianco', 'Matambre Arrollado Ogianco', ['Unidad · 1,6 kg', 'Fracción · 500 g'], {
    ingredientes: 'Matambre vacuno, zanahoria, huevo y especias naturales.',
    sugerencias: 'Acompañado con vegetales, en tablas y sándwiches.',
    imagenes: [
      'img/productos/linea-ogianco-matambre-arrollado-ogianco/1.webp',
      'img/productos/linea-ogianco-matambre-arrollado-ogianco/2.webp',
      'img/productos/linea-ogianco-matambre-arrollado-ogianco/3.webp',
    ],
  }),
  p('linea-ogianco', 'Salchicha Tipo Viena Ogianco (10 cm)', ['6 unidades · 200 g'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, pimiento, ajo, luego de ser cocida es ahumada.',
    sugerencias: 'Ideal para panchos tradicionales y para ofrecer en eventos infantiles.',
    imagenes: [
      'img/productos/linea-ogianco-salchicha-tipo-viena-ogianco-10-cm/1.webp',
      'img/productos/linea-ogianco-salchicha-tipo-viena-ogianco-10-cm/2.webp',
      'img/productos/linea-ogianco-salchicha-tipo-viena-ogianco-10-cm/3.webp',
      'img/productos/linea-ogianco-salchicha-tipo-viena-ogianco-10-cm/4.webp',
    ],
  }),
  p('linea-ogianco', 'Salchicha Tipo Viena Ogianco (23 cm)', ['5 unidades · 400 g'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, pimiento, ajo, luego de ser cocida es ahumada.',
    sugerencias: 'Ideal para panchos tradicionales y para ofrecer en eventos infantiles.',
    imagenes: [
      'img/productos/linea-ogianco-salchicha-tipo-viena-ogianco-23-cm/1.webp',
      'img/productos/linea-ogianco-salchicha-tipo-viena-ogianco-23-cm/2.webp',
      'img/productos/linea-ogianco-salchicha-tipo-viena-ogianco-23-cm/3.webp',
      'img/productos/linea-ogianco-salchicha-tipo-viena-ogianco-23-cm/4.webp',
    ],
  }),
  // salchichas
  p('salchichas', 'Salchicha Tipo Húngara Copetín', ['10 unidades · 180 g', 'A granel · 5 kg'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, pimentón, ají, pimienta, ajo, en tripa natural.',
    sugerencias: 'Servir caliente con chucrut o puré de papas. Ideal para mini sándwiches en caterings de eventos.',
    imagenes: [
      'img/productos/salchichas-salchicha-tipo-hungara-copetin/1.webp',
      'img/productos/salchichas-salchicha-tipo-hungara-copetin/2.webp',
    ],
  }),
  p('salchichas', 'Salchicha Tipo Frankfurt', ['3 unidades · 280 g', '5 unidades · 400 g', '20 unidades · 1,8 kg', '50 unidades · 4,5 kg'], {
    descripcion: 'Con piel. Nuevo envase. Libre de gluten.',
    nuevo: true,
    sinGluten: true,
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, pimiento, ajo, luego de ser cocida es ahumada.',
    sugerencias: 'Se puede servir acompañada de mostaza, con unos panecillos y pasta de rábanos. Ideal para el auténtico superpancho alemán.',
    destacado: true,
    imagenes: [
      'img/productos/salchichas-salchicha-tipo-frankfurt/nuevo.webp',
      'img/productos/salchichas-salchicha-tipo-frankfurt/1.webp',
      'img/productos/salchichas-salchicha-tipo-frankfurt/2.webp',
      'img/productos/salchichas-salchicha-tipo-frankfurt/3.webp',
      'img/productos/salchichas-salchicha-tipo-frankfurt/4.webp',
      'img/productos/salchichas-salchicha-tipo-frankfurt/5.webp',
      'img/productos/salchichas-salchicha-tipo-frankfurt/6.webp',
      'img/productos/salchichas-salchicha-tipo-frankfurt/7.webp',
      'img/productos/salchichas-salchicha-tipo-frankfurt/8.webp',
    ],
  }),
  p('salchichas', 'Salchicha Tipo Viena Copetín', ['10 unidades · 180 g', 'A granel · 5 kg'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, especias aromáticas, embutido en tripa natural.',
    sugerencias: 'Servir caliente con chucrut o puré de papas. Ideal para mini sándwiches en caterings de eventos.',
    imagenes: [
      'img/productos/salchichas-salchicha-tipo-viena-copetin/1.webp',
      'img/productos/salchichas-salchicha-tipo-viena-copetin/2.webp',
      'img/productos/salchichas-salchicha-tipo-viena-copetin/3.webp',
    ],
  }),
  p('salchichas', 'Salchicha Tipo Knackwurst', ['3 unidades · 320 g', '12 unidades · 1,2 kg', '50 unidades · 5 kg'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, pimiento, ají, ajo. Embutida en tripa natural. Luego de ser cocida es ahumada.',
    sugerencias: 'Típica salchicha alemana, ideal para acompañar con chucrut o brochette con vegetales.',
    imagenes: [
      'img/productos/salchichas-salchicha-tipo-knackwurst/1.webp',
      'img/productos/salchichas-salchicha-tipo-knackwurst/2.webp',
      'img/productos/salchichas-salchicha-tipo-knackwurst/3.webp',
      'img/productos/salchichas-salchicha-tipo-knackwurst/4.webp',
      'img/productos/salchichas-salchicha-tipo-knackwurst/5.webp',
    ],
  }),
  p('salchichas', 'Salchicha Tipo Húngara', ['3 unidades · 310 g', '18 unidades · 1,55 kg'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, pimentón, ají, pimienta, ajo, en tripa natural.',
    sugerencias: 'Se puede preparar a la parrilla o plancha acompañado con ensalada de papas, puré o chucrut.',
    imagenes: [
      'img/productos/salchichas-salchicha-tipo-hungara/1.webp',
      'img/productos/salchichas-salchicha-tipo-hungara/2.webp',
      'img/productos/salchichas-salchicha-tipo-hungara/3.webp',
      'img/productos/salchichas-salchicha-tipo-hungara/4.webp',
      'img/productos/salchichas-salchicha-tipo-hungara/5.webp',
      'img/productos/salchichas-salchicha-tipo-hungara/6.webp',
      'img/productos/salchichas-salchicha-tipo-hungara/7.webp',
    ],
  }),
  p('salchichas', 'Salchicha Tipo Weisswurst', ['3 unidades · 320 g', '12 unidades · 1,2 kg'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, ají, ajo, limón, cebolla, perejil y leche. Embutida en tripa natural.',
    sugerencias: 'Servir con mostaza dulce o preparada en brochette con vegetales.',
    destacado: true,
    imagenes: [
      'img/productos/salchichas-salchicha-tipo-weisswurst/1.webp',
      'img/productos/salchichas-salchicha-tipo-weisswurst/2.webp',
      'img/productos/salchichas-salchicha-tipo-weisswurst/3.webp',
      'img/productos/salchichas-salchicha-tipo-weisswurst/4.webp',
    ],
  }),
  p('salchichas', 'Salchicha Tipo Viena', ['3 unidades · 300 g', '5 unidades · 500 g', '18 unidades · 1,7 kg'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, especias aromáticas, embutido en tripa natural.',
    sugerencias: 'Se puede preparar a la parrilla o plancha acompañado con ensalada de papas, puré o chucrut.',
    imagenes: [
      'img/productos/salchichas-salchicha-tipo-viena/1.webp',
      'img/productos/salchichas-salchicha-tipo-viena/2.webp',
      'img/productos/salchichas-salchicha-tipo-viena/3.webp',
      'img/productos/salchichas-salchicha-tipo-viena/4.webp',
    ],
  }),
  p('salchichas', 'Rosca Polaca', ['Unidad · 280 g', '10 unidades · 2,8 kg'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, especias aromáticas. Embutida en tripa natural.',
    sugerencias: 'Calentar en plancha o parrilla y acompañar con chucrut.',
    imagenes: [
      'img/productos/salchichas-rosca-polaca/1.webp',
      'img/productos/salchichas-rosca-polaca/2.webp',
      'img/productos/salchichas-rosca-polaca/3.webp',
    ],
  }),
  // especialidades
  p('especialidades', 'Bondiola', ['Pieza entera · venta al peso'], {
    descripcion: 'Pieza entera envasada al vacío, para fetear.',
    ingredientes: 'Carne de cerdo, azúcar, sal y coriandro.',
    sugerencias: 'Ideal para tablas y sándwiches.',
    imagenes: [
      'img/productos/especialidades-bondiola/1.webp',
      'img/productos/especialidades-bondiola/2.webp',
    ],
  }),
  p('especialidades', 'Cracovia', ['Fracción · 200 g', 'Unidad · 1,6 kg (para fetear)', 'Plancha (5 u.) · 2,4 kg', 'Unidad · 400 g'], {
    ingredientes: '90% de carne de cerdo, 10% de carne vacuna, tocino, pimiento, ají, ajo. Ahumado.',
    sugerencias: 'Fetear a máquina para degustar en tablas de fiambres o emparedados.',
    imagenes: [
      'img/productos/especialidades-cracovia/1.webp',
      'img/productos/especialidades-cracovia/2.webp',
      'img/productos/especialidades-cracovia/3.webp',
      'img/productos/especialidades-cracovia/4.webp',
      'img/productos/especialidades-cracovia/5.webp',
    ],
  }),
  p('especialidades', 'Kassler', ['2 unidades · 300 g', '22 unidades aprox. · 2,3 kg'], {
    descripcion: 'Costeleta de cerdo horneada y ahumada.',
    ingredientes: 'Carne de cerdo cortado en costeletas.',
    sugerencias: 'Platos calientes acompañados con puré de papas o puré de manzanas verdes.',
    destacado: true,
    imagenes: [
      'img/productos/especialidades-kassler/1.webp',
      'img/productos/especialidades-kassler/2.webp',
      'img/productos/especialidades-kassler/3.webp',
    ],
  }),
  p('especialidades', 'Leberkäse', ['Unidad · 1,3 kg'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, pimiento, ají, ajo natural. Este producto es horneado.',
    sugerencias: 'Preparar a la plancha o al horno, acompañado con chucrut o puré de papas.',
    imagenes: [
      'img/productos/especialidades-leberkase/1.webp',
      'img/productos/especialidades-leberkase/2.webp',
    ],
  }),
  p('especialidades', 'Leberwurst', ['Fracción · 200 g', 'Unidad · 400 g', 'Plancha (5 u.) · 2 kg'], {
    ingredientes: 'Hígado de cerdo, tocino, orégano, romero y pimienta.',
    sugerencias: 'Ideal para servir en desayunos, meriendas y tablas de fiambres. Su textura al degustarlo es única y la combinación de hierbas aromáticas es perfecta.',
    imagenes: [
      'img/productos/especialidades-leberwurst/1.webp',
      'img/productos/especialidades-leberwurst/2.webp',
      'img/productos/especialidades-leberwurst/3.webp',
      'img/productos/especialidades-leberwurst/4.webp',
    ],
  }),
  p('especialidades', 'Panceta Horneada y Ahumada', ['Fracción · 200 g', 'Unidad · 1,8 kg'], {
    ingredientes: 'Panceta de cerdo, clavo de olor, pimienta, coriandro y sal.',
    sugerencias: 'Utilizar una feta de panceta para envolver una de nuestras salchichas y dorar a la plancha.',
    imagenes: [
      'img/productos/especialidades-panceta-horneada-y-ahumada/1.webp',
      'img/productos/especialidades-panceta-horneada-y-ahumada/2.webp',
      'img/productos/especialidades-panceta-horneada-y-ahumada/3.webp',
    ],
  }),
  p('especialidades', 'Salchichón Ahumado', ['Unidad · 1,5 kg'], {
    ingredientes: 'Carne vacuna, carne de cerdo, tocino, pimienta, ají y ajo natural. Ahumado con madera de orégano.',
    sugerencias: 'Feteado para tablas o sándwiches.',
    imagenes: [
      'img/productos/especialidades-salchichon-ahumado/1.webp',
      'img/productos/especialidades-salchichon-ahumado/2.webp',
    ],
  }),
]

export const marca = {
  logo: 'img/marca/logo.webp',
  ogianco: 'img/marca/ogianco.webp',
  hero: 'img/marca/hero.webp',          // pantalla ancha (16:9, con lugar para el texto)
  heroMovil: 'img/marca/hero-movil.webp', // celular (4:3, la foto original)
  oktoberfest: ['img/marca/oktoberfest-1.webp', 'img/marca/oktoberfest-2.webp', 'img/marca/oktoberfest-3.webp', 'img/marca/oktoberfest-4.webp', 'img/marca/oktoberfest-5.webp'],
  envaseNuevo: 'img/marca/envase-frankfurt.webp',
  foodtruck: ['img/marca/foodtruck-1.webp', 'img/marca/foodtruck-2.webp'],
  catalogoPdf: 'catalogo-nuevo-munich.pdf',
  catalogoTapa: 'img/marca/catalogo-tapa.webp',
  whatsapp: '5493513844802',      // ventas
  whatsappBot: '5493517010545',   // asistente virtual (chatbot)
  whatsappFoodTruck: '5493518145265',
  telefono: '351 499-8803',
  email: 'ventas@nuevomunich.com.ar',
  instagram: 'https://www.instagram.com/nuevomunich/',
  instagramUsuario: '@nuevomunich',
  facebook: 'https://www.facebook.com/NuevoMunichSRL',
  web: 'https://nuevomunich.com.ar/',
}
