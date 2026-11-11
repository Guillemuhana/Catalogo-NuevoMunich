# Nuevo Munich · Catálogo de productos

Catálogo online de Nuevo Munich, fiambres artesanales de Córdoba desde 1972. Muestra 38 productos en 7 categorías y arma pedidos que se envían por WhatsApp. No muestra precios ni cobra online.

- **Producción:** <https://catalogo-nuevo-munich.vercel.app>
- **Repositorio:** <https://github.com/Guillemuhana/Catalogo-NuevoMunich>
- **Stack:** React 19, Vite 8, Tailwind CSS 4, Motion, Lenis. Supabase es opcional.

## Empezar

Hace falta Node 20.19 o superior (en la rama 22, 22.12 o superior).

```bash
npm install
npm run dev
```

No hay que configurar nada: sin `.env`, la app usa el catálogo local de [src/data/seed.js](src/data/seed.js).

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Levanta el servidor de desarrollo |
| `npm run build` | Genera el sitio en `dist/` |
| `npm run preview` | Sirve `dist/` para revisarlo |
| `npm run lint` | Revisa el código con oxlint |
| `npm run catalogo` | Regenera el PDF, su tapa y sus datos ([detalle](docs/integraciones.md#catálogo-pdf)) |

## Documentación

| Guía | Para qué sirve |
| --- | --- |
| [Editar el contenido](docs/contenido.md) | Productos, fotos, tablas nutricionales, recetas, teléfonos y textos |
| [Arquitectura](docs/arquitectura.md) | Estructura del código, flujo de datos, pedido y componentes |
| [Integraciones y despliegue](docs/integraciones.md) | WhatsApp, catálogo PDF, Vercel, Supabase y n8n |

## Qué incluye el sitio

- **Catálogo:** tarjetas de categoría, navegación por categoría y productos clásicos destacados.
- **Detalle de producto:** galería, presentaciones, ficha nutricional, sellos, alérgenos, relacionados y link para compartir (`#p=slug`).
- **Buscador:** se abre con `Ctrl+K`, `⌘K` o `/`. Ignora las tildes y se maneja con el teclado.
- **Mi pedido:** guarda el pedido en el navegador, valida los datos del cliente y abre WhatsApp con el mensaje armado.
- **Asistente:** burbuja de chat con accesos directos a WhatsApp.
- **Recetas:** las publicadas por Nuevo Munich en Instagram.
- **Catálogo PDF:** para descargar, con enlaces a WhatsApp e Instagram.
- **Institucional:** Food Truck, historia, Instagram y contacto.
- **Accesibilidad y celular:** respeta `prefers-reduced-motion`. En pantallas táctiles usa el scroll nativo.

## Estado actual

Verificado el 2026-11-06, en el commit `3d38317`:

- `npm run build` termina bien, con un aviso porque el JS principal supera los 500 kB (533 kB, 164 kB con gzip).
- `npm run lint` da una sola advertencia, en [Humo.jsx:137](src/components/Humo.jsx#L137).
- `npm audit --omit=dev` no encuentra vulnerabilidades.
- Producción sirve el mismo JS y CSS que un build local sin variables de entorno. Por eso hoy funciona con el catálogo local, no con Supabase.
- El proyecto no tiene tests automáticos ni CI: los cambios se revisan a mano.

## Limitaciones conocidas

**Conviene resolver estas antes de activar Supabase:**

1. **Se perderían datos en pantalla.** Las tablas no tienen las columnas `tabla`, `sellos`, `alergenos`, `nuevo`, `sinGluten` ni `pendienteTexto`. Dejarían de verse los alérgenos, las tablas nutricionales, los sellos y la sección del envase nuevo. [Ver detalle](docs/integraciones.md#supabase-opcional).
2. **Parte del sitio seguiría leyendo el catálogo local:** el menú de celular, el orden de categorías del mensaje de pedido, la galería de Instagram y el PDF.

**Contenido incompleto:**

3. 9 productos no tienen tabla nutricional y 3 tienen valores sin confirmar. [Ver lista](docs/contenido.md#productos-con-datos-pendientes).
4. A la receta del guiso de lentejas le falta parte del procedimiento, y el desayuno Munich no tiene pasos.

**Fragilidades del código:**

5. La galería de Instagram necesita al menos 7 productos destacados, y hoy son exactamente 7. Si se quita uno, queda una foto vacía.
6. Los WhatsApp visibles y el teléfono están escritos a mano en [Footer.jsx](src/components/Footer.jsx). Cambiarlos solo en `marca` no alcanza. [Ver cómo](docs/contenido.md#teléfonos-y-redes).

**Alcance del pedido:**

7. Los pedidos no se guardan en ningún servidor. Si el cliente no toca "enviar" en WhatsApp, el pedido no llega, y el sitio no puede comprobarlo.
8. La validación por email se quitó en `9817b58`. Hay una versión alternativa sin publicar en `git stash` (Turnstile + SMTP); es trabajo pendiente de decisión, no parte del sitio actual.

## Marca

- **Colores:** rojo `#C04B54`, marrón `#5A270D`, dorado `#FFCC00`. Están en el bloque `@theme` de [src/index.css](src/index.css).
- **Tipografías:** Cormorant Unicase para títulos e Inria Sans para texto, ambas instaladas con el proyecto.
- **Estilo:** inspirado en el envase nuevo, con fondo negro, dibujos de comida, degradado dorado y franja roja y dorada.
