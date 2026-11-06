// Datos de respaldo: se usan si Supabase no está configurado o falla.
// La fuente real es la tabla `productos` / `categorias` en Supabase.
const WP = 'https://nuevomunich.com.ar/wp-content/uploads/'

export const categorias = [
  { slug: 'feteados', nombre: 'Feteados', bajada: 'Listos para servir. 100 g aprox., envasados al vacío.', imagen_url: WP + '2025/09/nm-productos-feteados2.jpg', orden: 1 },
  { slug: 'jamones', nombre: 'Jamones', bajada: 'Piezas enteras y fracciones para fiambrería y mesa.', imagen_url: WP + '2025/08/nm-productos-jamones.jpg', orden: 2 },
  { slug: 'arrollados', nombre: 'Arrollados', bajada: 'Clásicos de mesa, en fracción o unidad completa.', imagen_url: WP + '2025/08/nm-productos-arrollados.jpg', orden: 3 },
  { slug: 'salames', nombre: 'Salames', bajada: 'Picado grueso y fino, ahumados y tipo colonia.', imagen_url: WP + '2025/08/nm-productos-salames.jpg', orden: 4 },
  { slug: 'linea-ogianco', nombre: 'Línea Ogianco', bajada: 'Arrollados y salchichas de la línea Ogianco.', imagen_url: WP + '2025/08/Linea-Ogianco-nm.png', orden: 5 },
  { slug: 'salchichas', nombre: 'Salchichas', bajada: 'De Viena a Frankfurt: la tradición del embutido centroeuropeo.', imagen_url: WP + '2025/08/nm-productos-salchichas.jpg', orden: 6 },
  { slug: 'especialidades', nombre: 'Especialidades', bajada: 'Recetas austríacas y alemanas heredadas desde 1972.', imagen_url: WP + '2025/08/nm-productos-especialidades.jpg', orden: 7 },
]

const p = (categoria, nombre, presentaciones = [], extra = {}) => ({
  slug: (categoria + '-' + nombre)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  categoria,
  nombre,
  descripcion: '',
  presentaciones,
  imagen_url: null,
  destacado: false,
  activo: true,
  ...extra,
})

const FET = ['100 g aprox. · al vacío']

export const productos = [
  // Feteados
  p('feteados', 'Bondiola', FET, { destacado: true }),
  p('feteados', 'Arrollado de Pollo', FET),
  p('feteados', 'Panceta Cocida Ahumada Salada', FET),
  p('feteados', 'Lomo Horneado y Ahumado a las Finas Hierbas', FET, { destacado: true }),
  p('feteados', 'Lomo de Cerdo Cocido', FET),
  p('feteados', 'Jamón Tipo Bávaro Cocido', FET),
  p('feteados', 'Jamón Cocido', FET),
  p('feteados', 'Jamón Tipo Asado', FET),
  p('feteados', 'Arrollado Criollo', FET),
  // Jamones
  p('jamones', 'Jamón Cocido con Cuero', ['Pieza 3 kg']),
  p('jamones', 'Jamón Tipo Asado', ['Pieza 4 kg', 'Media pieza 2 kg'], { destacado: true }),
  p('jamones', 'Jamón Cocido Tipo Bávaro', ['1 kg']),
  p('jamones', 'Lomo de Cerdo Horneado y Ahumado', ['250 g', '900 g']),
  // Arrollados
  p('arrollados', 'Arrollado de Pollo', ['Fracción 500 g', 'Unidad 1,6 kg']),
  p('arrollados', 'Arrollado Criollo', ['Fracción 500 g', 'Unidad 1,6 kg']),
  p('arrollados', 'Matambre Arrollado', ['Fracción 500 g', 'Unidad 1,6 kg']),
  // Salames
  p('salames', 'Salame Tipo Alpino Ahumado Picado Grueso', [], { destacado: true }),
  p('salames', 'Salame Tipo Colonia', []),
  p('salames', 'Salame Holstein Ahumado Picado Fino', []),
  // Ogianco
  p('linea-ogianco', 'Arrollado de Pollo Ogianco', []),
  p('linea-ogianco', 'Matambre Arrollado Ogianco', []),
  p('linea-ogianco', 'Salchichas Tipo Viena Ogianco', ['10 cm', '23 cm']),
  // Salchichas
  p('salchichas', 'Copetín Húngara', []),
  p('salchichas', 'Frankfurt', [], { destacado: true }),
  p('salchichas', 'Viena Copetín', []),
  p('salchichas', 'Knackwurst', []),
  p('salchichas', 'Húngara', []),
  p('salchichas', 'Weisswurst', [], { destacado: true }),
  p('salchichas', 'Viena', []),
  p('salchichas', 'Rosca Polaca', []),
  // Especialidades
  p('especialidades', 'Bondiola', []),
  p('especialidades', 'Cracovia', []),
  p('especialidades', 'Kassler', [], { destacado: true }),
  p('especialidades', 'Leberkäse', []),
  p('especialidades', 'Leberwurst', []),
  p('especialidades', 'Panceta Horneada y Ahumada', []),
  p('especialidades', 'Salchichón Ahumado', []),
]

export const marca = {
  logo: WP + '2025/08/Logo-Nuevo-Munich-web.png',
  heroImg: WP + '2025/08/salchichas-new.png',
  oktoberfest: [
    WP + '2025/07/oktoberfest-nuevo-munich-01.jpg',
    WP + '2025/07/oktoberfest-nuevo-munich-02.jpg',
    WP + '2025/07/oktoberfest-nuevo-munich-05.jpg',
  ],
  foodtruck: WP + '2025/08/hotdog-nuevo-munich-menu.png',
  whatsapp: '5493513844802',
  whatsappFoodTruck: '5493518145265',
  telefono: '351 499-8803',
  email: 'ventas@nuevomunich.com.ar',
  instagram: 'https://www.instagram.com/nuevomunich/',
  facebook: 'https://www.facebook.com/NuevoMunichSRL',
  web: 'https://nuevomunich.com.ar/',
}
