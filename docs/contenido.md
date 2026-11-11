# Editar el contenido

Casi todo el contenido vive en archivos del repositorio. Después de cada cambio, revisalo con `npm run dev` y publicalo subiéndolo a GitHub.

## Dónde está cada cosa

| Contenido | Archivo |
| --- | --- |
| Categorías, productos y datos de marca | [src/data/seed.js](../src/data/seed.js) |
| Tablas nutricionales, ingredientes de etiqueta, sellos y alérgenos | [src/data/nutricion.js](../src/data/nutricion.js) |
| Recetas | [src/data/recetas.js](../src/data/recetas.js) |
| Food Truck | [FoodTruck.jsx](../src/components/FoodTruck.jsx) |
| Hitos de la historia | [Historia.jsx](../src/components/Historia.jsx) |
| Manifiesto, cifras y accesos del chat | [Efectos.jsx](../src/components/Efectos.jsx) |
| Títulos del hero | [Hero.jsx](../src/components/Hero.jsx) |
| Sugerencias del buscador | [SearchOverlay.jsx](../src/components/SearchOverlay.jsx) |
| Metadatos para buscadores y redes | [index.html](../index.html) |
| Textos del PDF | [scripts/catalogo-pdf.mjs](../scripts/catalogo-pdf.mjs) |

Los textos del Food Truck y de la historia también están en el script del PDF: si los cambiás en la web, cambialos ahí.

## Después de editar

| Si cambiaste... | Regenerá el PDF (`npm run catalogo`) | Regenerá `seed.sql` |
| --- | --- | --- |
| Productos, categorías o sus fotos | Sí | Solo si usás Supabase |
| Ingredientes, sugerencias o alérgenos | Sí | Solo si usás Supabase |
| Tablas nutricionales o sellos | No: el PDF no los muestra | No: no están en el SQL |
| Recetas | No | No |
| WhatsApp de ventas, del asistente o del Food Truck | Sí | No |

## Productos

Cada producto se declara en [seed.js](../src/data/seed.js) con la función `p`:

```js
p('feteados', 'Bondiola', FET, {
  ingredientes: 'Bondiola de cerdo, pimienta negra, coriandro, sal y azúcar.',
  sugerencias: 'Ideal para tablas y sándwiches.',
  destacado: true,
  imagenes: [
    'img/productos/feteados-bondiola/1.webp',
    'img/productos/feteados-bondiola/2.webp',
  ],
}),
```

| Campo | Uso |
| --- | --- |
| Primer argumento | Slug de la categoría |
| Segundo argumento | Nombre visible |
| Tercer argumento | Lista de presentaciones. `FET` equivale a `100 g aprox. · al vacío` |
| `imagenes` | Primero el envase; al final, la foto de ambiente |
| `ingredientes`, `sugerencias`, `descripcion` | Textos del detalle y del PDF |
| `destacado` | Lo muestra en "Los clásicos de la casa" y le agrega la etiqueta "Clásico" |
| `nuevo` | Lo muestra en la sección del envase nuevo. Se usa el primero que lo tenga |

**Cuidado con cambiar un nombre.** El slug se calcula a partir de la categoría y el nombre, por ejemplo `feteados-bondiola`. Si cambia el nombre, cambia el slug, así que también hay que actualizar:

- la carpeta de fotos y las rutas en `imagenes`;
- la clave del producto en `etiquetas` ([nutricion.js](../src/data/nutricion.js));
- el campo `productos` de las recetas que lo usen ([recetas.js](../src/data/recetas.js)).

Además, dejan de funcionar los links compartidos con el slug anterior (`#p=slug`).

**Cuidado con quitar destacados.** La galería de Instagram toma fotos de los primeros 7 destacados y hoy hay exactamente 7. Con menos, queda una foto vacía hasta que se ajuste [Instagram.jsx](../src/components/Instagram.jsx).

**Cada producto necesita al menos una foto** para que se genere el PDF.

## Fotos

Las fotos están en `public/img/`, en WebP. El proyecto no tiene un script para convertirlas, así que hay que optimizarlas antes de agregarlas.

| Carpeta | Contenido |
| --- | --- |
| `productos/{slug}/` | `{n}.webp` de hasta 1080 px y `{n}-480.webp` como miniatura |
| `categorias/` | Piezas con la cinta roja. Ya traen el nombre en la imagen, así que no llevan texto encima |
| `banners/` | Fotos de ambiente para el encabezado de cada categoría |
| `marca/` | Logo, ícono, hero, envase, food truck y Oktoberfest |
| `recetas/` | Fotos de las recetas |

**Cada foto de producto necesita su miniatura `-480`.** Las tarjetas y la lista de búsqueda usan esa versión: si falta, se ve un cartel con el nombre en lugar de la foto.

**Si reemplazás la foto del hero,** revisá el humo animado: [Humo.jsx](../src/components/Humo.jsx) guarda la posición de cada pancho en la foto de celular (`hero-movil.webp`) y en la de pantalla ancha (`hero.webp`).

No hace falta editar `marca/catalogo-tapa.webp`: la genera `npm run catalogo`.

## Información nutricional

[nutricion.js](../src/data/nutricion.js) guarda lo transcripto de las etiquetas. Cada entrada de `etiquetas` usa el slug del producto como clave y **reemplaza** los campos del mismo nombre en `seed.js`: la etiqueta manda sobre el texto de la web.

| Campo | Uso |
| --- | --- |
| `tabla` | Porción y filas de la tabla |
| `sellos` | Sellos octogonales "Exceso en..." |
| `ingredientes` | Lista de la etiqueta |
| `alergenos` | Advertencia destacada |
| `pendienteTexto` | Mensaje propio cuando todavía no hay tabla |

Reglas del archivo:

- **Nunca se estima un valor.** Si no se lee con seguridad, va `null` y en pantalla aparece "—".
- **Si no hay datos confiables, no se agrega `tabla`.** El sitio ofrece pedir la ficha por WhatsApp.

### Productos con datos pendientes

Datos del 2026-11-06. Para completarlos hace falta la ficha oficial o una foto legible de la etiqueta.

**Sin tabla nutricional (9):**

- `jamones-jamon-tipo-asado`
- `salames-salame-tipo-alpino-ahumado-picado-grueso`
- `salames-salame-tipo-colonia`
- `salames-salame-holstein-ahumado-picado-fino`
- `linea-ogianco-salchicha-tipo-viena-ogianco-23-cm`
- `salchichas-salchicha-tipo-frankfurt`
- `salchichas-rosca-polaca`
- `especialidades-leberkase`
- `especialidades-salchichon-ahumado`

**Con valores sin confirmar en la tabla (3):**

- `feteados-panceta-cocida-ahumada-salada`
- `salchichas-salchicha-tipo-hungara`
- `especialidades-panceta-horneada-y-ahumada`

## Recetas

[recetas.js](../src/data/recetas.js) contiene las recetas publicadas en Instagram. **El texto se copia de la publicación, sin completarlo ni inventar pasos.**

| Campo | Uso |
| --- | --- |
| `slug`, `titulo`, `bajada`, `etiqueta` | Identificación y textos de la tarjeta |
| `foto` | Ruta en `img/recetas/` |
| `ingredientes` | Lista de ingredientes |
| `tituloIngredientes` | Opcional: reemplaza el título "Ingredientes" |
| `pasos` | Procedimiento. Si está vacío, la tarjeta dice "Ver qué trae" |
| `pendiente` | Con `true`, avisa que el paso a paso completo está en Instagram |
| `nota` | Opcional: aclaración al final |
| `productos` | Slugs de los productos usados. Los que no existen se ignoran sin avisar |

Estado actual: Kassler está completa, al guiso de lentejas le falta parte del procedimiento (`pendiente: true`) y el desayuno Munich no tiene pasos.

## Teléfonos y redes

Los datos de contacto están en el objeto `marca` de [seed.js](../src/data/seed.js):

| Campo | Destino |
| --- | --- |
| `whatsapp` | Ventas: consultas por un producto |
| `whatsappBot` | Asistente virtual: pedidos y chat |
| `whatsappFoodTruck` | Reservas del Food Truck |
| `fabrica` | Dirección de retiro en fábrica |
| `telefono`, `email`, `instagram`, `instagramUsuario`, `facebook`, `web` | Contacto y redes |

Los WhatsApp se escriben con formato internacional y sin símbolos, por ejemplo `5493513844802`.

**Hay datos repetidos a mano.** Al cambiar un número, revisá también:

- [Footer.jsx](../src/components/Footer.jsx): el texto visible de los dos WhatsApp y el link `tel:`.
- [catalogo-pdf.mjs](../scripts/catalogo-pdf.mjs): el link `tel:`. Además, `telVisible` da por hecho que el número tiene código de área 351.
