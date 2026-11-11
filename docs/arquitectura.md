# Arquitectura

Es una aplicación de una sola página, sin backend propio. Se publica como archivos estáticos. WhatsApp recibe los pedidos, y Supabase, si se activa, entrega el catálogo.

```text
Navegador
├── Catálogo ── seed.js (hoy) o Supabase (opcional)
├── Pedido ──── localStorage ──> wa.me con el mensaje armado
└── Fotos y PDF ── public/
```

## Estructura

```text
├── index.html              Metadatos y punto de entrada
├── public/
│   ├── catalogo-nuevo-munich.pdf
│   └── img/                Fotos en WebP
├── scripts/
│   ├── catalogo-pdf.mjs    Genera el PDF, su tapa y sus datos
│   └── generar-seed.mjs    Genera supabase/seed.sql
├── src/
│   ├── main.jsx            Monta la app y carga las fuentes
│   ├── App.jsx             Estado global y orden de las secciones
│   ├── index.css           Tema y estilos propios
│   ├── components/         Secciones y piezas de la interfaz
│   ├── data/               Catálogo, nutrición, recetas y datos del PDF
│   └── lib/                Datos, pedido y scroll
└── supabase/               Esquema y datos iniciales
```

## Carga del catálogo

[`cargarCatalogo()`](../src/lib/data.js) decide de dónde salen los datos:

1. Sin `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`, usa [seed.js](../src/data/seed.js).
2. Con ambas variables, consulta Supabase.
3. Si Supabase falla o no tiene categorías, escribe un aviso en la consola y vuelve a `seed.js`.

Estas partes importan `seed.js` directamente, así que **siempre** usan los datos locales:

| Parte | Qué lee de `seed.js` |
| --- | --- |
| Menú de celular ([Header.jsx](../src/components/Header.jsx)) | Categorías |
| Mensaje del pedido ([usePedido.js](../src/lib/usePedido.js)) | Categorías y su orden |
| Galería de Instagram ([Instagram.jsx](../src/components/Instagram.jsx)) | Productos destacados |
| PDF ([catalogo-pdf.mjs](../scripts/catalogo-pdf.mjs)) | Todo el catálogo |
| Varios componentes | `marca` |

Las recetas salen siempre de [recetas.js](../src/data/recetas.js).

## App.jsx

[App.jsx](../src/App.jsx) concentra el estado compartido:

- El catálogo cargado y la intro inicial, que dura al menos 1,3 segundos.
- El producto abierto, la categoría activa y los paneles de pedido y búsqueda.
- El aviso de producto agregado y la animación de la foto hacia la bolsa.

También resuelve estos comportamientos:

- **Links a productos:** al abrir un producto, la URL pasa a `#p=slug`. Al entrar con ese link, el producto se abre solo.
- **Atajos:** `Ctrl+K`, `⌘K` y `/` abren el buscador.
- **Paneles abiertos:** frenan el scroll de la página de fondo.
- **Categoría activa:** se detecta con un `IntersectionObserver` sobre los elementos `[data-seccion]`.

## Orden de la página

| # | Sección | Componente |
| --- | --- | --- |
| 1 | Hero con humo y brasas | [Hero](../src/components/Hero.jsx), [Humo](../src/components/Humo.jsx) |
| 2 | Cinta de categorías (desde `md`) | [Marquee](../src/components/Marquee.jsx) |
| 3 | Tarjetas de categoría y Food Truck | [Categorias](../src/components/Categorias.jsx) |
| 4 | Descarga del PDF | [CatalogoPdf](../src/components/CatalogoPdf.jsx) |
| 5 | Envase nuevo | [NuevoEnvase](../src/components/NuevoEnvase.jsx) |
| 6 | Clásicos de la casa | [Clasicos](../src/components/Clasicos.jsx) |
| 7 | Catálogo por categoría | [CategoryNav](../src/components/CategoryNav.jsx), [CategorySection](../src/components/CategorySection.jsx), [ProductCard](../src/components/ProductCard.jsx) |
| 8 | Recetas | [Recetas](../src/components/Recetas.jsx) |
| 9 | Food Truck | [FoodTruck](../src/components/FoodTruck.jsx) |
| 10 | Manifiesto y cifras | `Manifiesto` en [Efectos](../src/components/Efectos.jsx) |
| 11 | Historia | [Historia](../src/components/Historia.jsx) |
| 12 | Instagram | [Instagram](../src/components/Instagram.jsx) |
| 13 | Contacto | [Footer](../src/components/Footer.jsx) |

Piezas que están por encima de las secciones:

- [Header](../src/components/Header.jsx): barra fija y menú de celular.
- [ProductModal](../src/components/ProductModal.jsx): detalle del producto, con [FichaNutricional](../src/components/FichaNutricional.jsx).
- [PedidoDrawer](../src/components/PedidoDrawer.jsx): panel del pedido.
- [SearchOverlay](../src/components/SearchOverlay.jsx): buscador.
- `BotonBot` y `Progreso` en [Efectos](../src/components/Efectos.jsx): burbuja de chat y barra de avance.

[ProductImage](../src/components/ProductImage.jsx) muestra la foto de un producto y, si falta o falla, un cartel con su nombre.

## Pedido

[usePedido.js](../src/lib/usePedido.js) maneja la lista y arma el mensaje. [PedidoDrawer.jsx](../src/components/PedidoDrawer.jsx) maneja el formulario.

```text
Agregar producto ─> Mi pedido ─> Validar datos ─> Abrir WhatsApp ─> El cliente envía
```

Cada renglón se identifica por `slug::presentación`: el mismo producto con otra presentación es otro renglón.

**Validación del formulario:**

| Campo | Regla |
| --- | --- |
| Nombre | Al menos 3 caracteres |
| WhatsApp | Al menos 8 dígitos |
| Email | Opcional; si se completa, debe tener formato válido |
| Nombre del comercio | Obligatorio si el tipo de cliente es "Comercio" |
| Dirección y localidad | Obligatorias si la entrega es "Delivery" |

Si hay errores, no se abre WhatsApp y la vista va al primer campo con problemas.

**Después de abrir WhatsApp** el pedido sigue guardado. El botón "Ya lo envié" lo vacía a pedido del cliente, pero el sitio no puede comprobar que el mensaje se haya enviado.

**Ejemplo de mensaje:**

```text
🛒 *NUEVO PEDIDO · CATÁLOGO WEB*

👤 *Cliente:* Ana Pérez
📱 *WhatsApp:* 351 555-1234
📦 *Entrega:* Retiro en local

*FETEADOS*
• 2 × Bondiola (100 g aprox. · al vacío)

🧾 *Total:* 2 unidades en 1 producto

¿Me confirman disponibilidad y precio? Gracias.
```

### Datos guardados en el navegador

| Clave | Almacenamiento | Contenido |
| --- | --- | --- |
| `nm-pedido-v2` | `localStorage` | Productos del pedido |
| `nm-cliente-v2` | `localStorage` | Datos del cliente, sin el comentario |
| `nm-cliente` | `localStorage` | Formato anterior: solo se lee, como nombre inicial |
| `nm-chat-visto` | `sessionStorage` | Si ya se mostró el globito del chat |

Los datos del cliente incluyen teléfono, email y dirección. Quedan en ese dispositivo y solo salen en el mensaje de WhatsApp. Si se cambia su formato, conviene crear una clave nueva (`-v3`) para no leer datos viejos incompatibles.

## Búsqueda

`buscar()` en [data.js](../src/lib/data.js) ignora mayúsculas y tildes. Cada palabra escrita debe aparecer en el nombre, el slug de la categoría, la descripción o las presentaciones. **No busca en los ingredientes.** El buscador muestra hasta 12 resultados.

## Scroll y animaciones

[scroll.js](../src/lib/scroll.js) centraliza el desplazamiento:

- Lenis solo se activa con puntero fino y sin `prefers-reduced-motion`. En pantallas táctiles queda el scroll nativo.
- Para moverse por la página usá `irA()` o `irACategoria()`. Sin Lenis, ambas funciones usan el scroll nativo del navegador.
- Los paneles con scroll propio llevan el atributo `data-lenis-prevent`.

Con `prefers-reduced-motion`, `MotionConfig` reduce las animaciones de Motion, [index.css](../src/index.css) frena las de CSS y el humo no se dibuja.

## Comportamiento según la pantalla

| Elemento | Comportamiento |
| --- | --- |
| Menú | Hamburguesa por debajo de `lg` (1024 px) |
| Barra de categorías y cinta | Solo desde `md` (768 px) |
| Clásicos | Con mouse en pantalla grande, pasan de costado al bajar. En táctil o por debajo de 768 px, grilla |
| Hero | La variante `ancho` (proporción de al menos 7:5 y 640 px de ancho) pone el texto junto a la foto; si no, debajo |
| Sello giratorio | Solo con la variante `ancho` y más de 780 px de alto |
| Grano de película | Oculto por debajo de 768 px |

La regla del hero es que nunca haya letras encima de la comida. Por eso `.hero-texto` y `.hero-titulo` calculan la zona libre de la foto en [index.css](../src/index.css).
