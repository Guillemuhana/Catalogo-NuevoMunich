# Integraciones y despliegue

| Servicio | Uso | Estado |
| --- | --- | --- |
| WhatsApp (`wa.me`) | Pedidos y consultas | En uso |
| Vercel | Publicación del sitio | En uso |
| Instagram y Facebook | Links a los perfiles; no hay feed en vivo | En uso |
| Supabase | Catálogo en base de datos | Preparado, sin activar en producción |
| n8n | Carga de fotos en Supabase | Depende de Supabase |

## WhatsApp

El sitio solo abre un link `wa.me` con el texto ya escrito: no usa la API de WhatsApp ni tiene credenciales. El asistente virtual es un servicio externo y no forma parte de este repositorio.

| Número | Campo en `marca` | Desde dónde se usa |
| --- | --- | --- |
| +54 9 351 701-0545, asistente | `whatsappBot` | Pedido, burbuja de chat, menú de celular, "Pedir la ficha", footer y botón de pedido del PDF |
| +54 9 351 384-4802, ventas | `whatsapp` | Consulta desde el detalle, footer, productos del PDF y "Hablar con ventas" del PDF |
| +54 9 351 814-5265, Food Truck | `whatsappFoodTruck` | Sección Food Truck y su página del PDF |

## Catálogo PDF

```bash
npm run catalogo
```

Hay que correrlo después de cambiar el catálogo ([ver cuándo](contenido.md#después-de-editar)) y subir los archivos generados:

| Archivo generado | Contenido |
| --- | --- |
| `public/catalogo-nuevo-munich.pdf` | El catálogo, hoy de 14 páginas y 3,6 MB |
| `public/img/marca/catalogo-tapa.webp` | Imagen de la tapa para la web |
| `src/data/catalogo-pdf.json` | Páginas y tamaño que muestra la web |

**Contenido:** tapa, índice, productos por categoría con hasta 6 por página, Food Truck y contratapa con contactos. Incluye ingredientes, alérgenos y sugerencias, pero no las tablas nutricionales.

**Requisitos:** Chrome o Edge instalado. El script busca en las rutas habituales de Windows, macOS y Linux.

| Variable opcional | Uso |
| --- | --- |
| `CHROME_PATH` | Ruta del navegador, si no lo encuentra |
| `CATALOGO_URL` | URL del sitio que figura en el PDF. Por defecto, la de producción |

**Controles:** el script se detiene sin generar el archivo si encuentra texto que no entra en su ficha, una imagen rota, una página desbordada o una foto demasiado chica. El error indica el producto o la página.

## Vercel

Configuración para importar el repositorio:

| Opción | Valor |
| --- | --- |
| Framework | Vite |
| Comando de build | `npm run build` |
| Carpeta de salida | `dist` |
| Variables | Ninguna, salvo que se active Supabase |

El repositorio no tiene `vercel.json`. Las variables `VITE_*` se incorporan al compilar: después de cambiarlas, hay que volver a desplegar.

> **Sin verificar:** el proyecto no aparece en la cuenta de Vercel consultada el 2026-11-06, así que no se pudo revisar su panel. No están confirmados la rama de producción, el despliegue automático ni las variables configuradas. Lo que sí se comprobó es que el sitio publicado coincide con un build local del commit `3d38317`.

### Antes de publicar

1. Correr `npm run lint` y `npm run build`.
2. Probar con `npm run preview`, en computadora y en celular.
3. Hacer un pedido de prueba hasta que se abra WhatsApp.
4. Si cambió el catálogo, regenerar el PDF.

## Supabase (opcional)

Está preparado pero **no conviene activarlo tal como está**: producción hoy depende de campos que la base de datos no tiene.

### Qué se perdería al activarlo

[supabase/schema.sql](../supabase/schema.sql) y [generar-seed.mjs](../scripts/generar-seed.mjs) no incluyen estos campos:

| Campo faltante | Consecuencia |
| --- | --- |
| `alergenos` | **No se muestran las advertencias de alérgenos** (hoy, en 7 productos) |
| `tabla` | Ningún producto muestra su tabla nutricional |
| `sellos` | Desaparecen los sellos "Exceso en..." (hoy, en 22 productos) |
| `nuevo` | Desaparecen la sección y la etiqueta del envase nuevo |
| `pendienteTexto` | Se pierde el mensaje propio del producto sin tabla |
| `sinGluten` | Sin efecto visible: ningún componente lo usa |

Los alérgenos son información de seguridad alimentaria: resolvé esto antes de activarlo. Tampoco se solucionaría del todo con la base de datos, porque [parte del sitio lee siempre seed.js](arquitectura.md#carga-del-catálogo).

### Pasos de instalación

1. En el SQL Editor de Supabase, correr `supabase/schema.sql`. Crea las tablas, los permisos de solo lectura y el bucket público `productos`.
2. Correr `supabase/seed.sql`. Carga 7 categorías y 38 productos.
3. Copiar `.env.example` a `.env` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Cargar las mismas variables en Vercel y volver a desplegar.

### Actualizar los datos

Después de editar `seed.js`, regenerá el SQL:

```bash
node scripts/generar-seed.mjs > supabase/seed.sql
```

Al volver a correr `seed.sql`, **las categorías se actualizan pero los productos existentes no**, porque usa `on conflict (slug) do nothing`. Solo se agregan los productos nuevos: los cambios en productos que ya existen hay que hacerlos en la base.

### Seguridad

- Cualquiera puede leer las categorías, los productos activos y las fotos del bucket.
- Solo se puede escribir con la `service_role` key. **Esa clave no debe llegar nunca al frontend:** toda variable `VITE_*` queda visible en el navegador.

## Fotos desde n8n

Este flujo solo tiene efecto con Supabase activado. Con el catálogo local, el sitio no consulta la base. **No se probó contra una instancia real.**

**1. Subir la imagen al bucket:**

```http
POST {SUPABASE_URL}/storage/v1/object/productos/{slug}.jpg
Authorization: Bearer {SERVICE_ROLE}
x-upsert: true

<imagen en binario>
```

**2. Guardar la URL pública:**

```http
POST {SUPABASE_URL}/rest/v1/productos?on_conflict=slug
apikey: {SERVICE_ROLE}
Authorization: Bearer {SERVICE_ROLE}
Prefer: resolution=merge-duplicates
Content-Type: application/json
```

```json
{
  "slug": "salchichas-frankfurt",
  "categoria": "salchichas",
  "nombre": "Frankfurt",
  "imagen_url": "{SUPABASE_URL}/storage/v1/object/public/productos/salchichas-frankfurt.jpg",
  "imagenes": ["{SUPABASE_URL}/storage/v1/object/public/productos/salchichas-frankfurt.jpg"]
}
```

**Hay que enviar `imagenes` además de `imagen_url`.** El sitio da prioridad a `imagenes`, y `seed.sql` ya la completa en todos los productos: si solo se actualiza `imagen_url`, la foto nueva no aparece en el catálogo. Enviar la lista así reemplaza toda la galería del producto.

El `slug`, la `categoria` y el `nombre` deben coincidir con los del producto. Un slug que no existe crea un producto nuevo, visible en el catálogo.
