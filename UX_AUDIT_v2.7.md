# Auditoría y mejora de experiencia — Paraíso Laguna v2.7

**Fecha:** 5 de septiembre de 2026
**Base de partida:** commit `2bce5a6` (release v2.6), 48/48 pruebas en verde
**Método:** inspección del código, ejecución real del sitio en Chrome a 390 × 844 y 1440 × 900, medición en el DOM y pruebas automatizadas

---

## A. Diagnóstico ejecutivo

### Qué producto hay realmente en el repositorio

Un **sitio público para viajeros**, no un sistema interno. Es una aplicación multipágina estática en HTML, CSS y JavaScript sin framework, con 33 páginas en tres idiomas (español en la raíz, `/en/`, `/fr/`), servida desde Apache/LiteSpeed en Hostinger.

**No existe ninguna superficie "Paraíso Visual Director" ni catálogo de activos `PL_INV_001–541` en este repositorio.** Se buscó por contenido en todos los archivos y no hay ninguna coincidencia. El repositorio contiene 166 archivos de imagen bajo `assets/` (46 MB) referenciados directamente desde el HTML, sin base de datos, sin índice, sin puntuaciones ni prompts. Toda la intervención se dirigió, por tanto, a la única superficie que existe: la del turista.

El modelo de negocio no tiene carrito ni precios públicos. Todo el valor se captura en un único evento: **abrir una conversación de WhatsApp**. Esa es la métrica que ordenó las prioridades.

### Cuál era el problema principal

La versión v2.6 estaba bien construida en la portada y rota en todo lo demás. Las tres portadas concentraban las mejoras de las últimas seis versiones; las 30 páginas restantes, que son exactamente donde aterriza el tráfico de búsqueda, habían quedado atrás.

El resultado en móvil, medido en la página `/bioluminiscencia-oaxaca/`:

| Medición | Antes |
| --- | --- |
| Ancho del botón de menú | 0 px |
| Posición de su borde izquierdo | 455 px (pantalla de 375 px) |
| Desbordamiento del selector de idioma | 68 px fuera de pantalla |
| Altura del documento | 11 568 px |
| Primer punto de contacto | y = 1 049 px |
| Último punto de contacto | y = 9 760 px |
| Recorrido sin ningún acceso a contacto | ≈ 72 % |

Es decir: un visitante que llega desde Google a la página del tour de bioluminiscencia **no podía abrir el menú, no podía cambiar de idioma y, durante casi tres cuartas partes del scroll, no tenía ningún modo de escribir**. Esto encaja con el dato de negocio aportado: muchas solicitudes de indicaciones, pocos clics de chat.

### Usuarios y recorridos priorizados

Se priorizó al **viajero que llega desde buscador o Instagram a una página de tour en el móvil**, por encima del que entra por la portada. Razón: las páginas de tour son las que reciben el tráfico orgánico (arquitectura SILO con prioridad 0.85–0.90 en el sitemap) y eran las que estaban rotas.

---

## B. Auditoría priorizada

| # | Problema | Evidencia | Usuario afectado | Consecuencia | Sev. | Frec. | Solución | Esfuerzo | Criterio de éxito |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **C1** | El botón de menú queda fuera de la pantalla con ancho 0 | Medido en el DOM: `left: 455`, `width: 0` en pantalla de 375 px. 30 de 33 páginas | Todo visitante móvil fuera de las portadas | No hay navegación ni cambio de idioma posible | Crítica | Constante | Ocultar el nombre de marca duplicado en el header móvil y dar al botón 44 × 44 | Bajo | El botón mide ≥ 44 px y cae dentro del viewport en las 33 páginas |
| **A1** | `calculateMoonData()` se invoca pero no existe en ningún archivo | `ReferenceError: calculateMoonData is not defined` en consola al elegir fecha; el bloque de previsión queda vacío | Quien evalúa cuándo viajar | El diferenciador de conversión de la v2.2 nunca funcionó, en los 3 idiomas | Alta | Constante | Implementar la función con el mismo ciclo sinódico del widget del hero | Medio | Elegir fecha muestra fase, nivel y consejo sin errores |
| **A2** | Sin punto de contacto persistente en móvil fuera de las 3 portadas | 30 páginas sin `.mobile-sticky-cta`; la burbuja flotante está oculta bajo 768 px | Tráfico orgánico móvil | ≈ 72 % del scroll sin forma de contactar | Alta | Constante | Añadir barra fija reutilizando el enlace de WhatsApp propio de cada página | Bajo | Las 33 páginas mantienen el CTA visible al final del scroll |
| **A3** | Los 5 chips del asistente vacían el formulario | Los nombres llevan emoji y no coinciden con ningún `value`; el `<select>` queda en `""` | Quien usa el asistente en escritorio | Se pierde la intención justo antes de convertir | Alta | Frecuente | Emparejar por palabras distintivas y nunca borrar la elección previa | Medio | Los 15 chips (5 × 3 idiomas) preseleccionan y lo confirman en pantalla |
| **Q1** | El cian de marca no alcanza el contraste AA | `#008AA6` sobre blanco = 4.05:1, mínimo 4.5:1. Afecta a "Cotizar mi tour", "Ver detalles", etiquetas de campo y de tarjeta | Lectura con poca luz o baja visión | Texto de acción por debajo del mínimo AA | Media | Constante | Token `--accent-cyan-text: #00687E` (6.40:1) solo para texto | Bajo | Los cinco selectores medidos superan 4.5:1 |
| **Q2** | 18 controles son `div` con `onclick` | 5 tarjetas de expedición, 8 fotos y 5 chips sin foco ni rol; el modal no cierra con Escape ni mueve el foco | Teclado y lector de pantalla | Un tercio de los controles es inalcanzable | Media | Constante | Rol, `tabindex`, Enter/Espacio, diálogo real con foco y Escape | Medio | Todos exponen `role="button"` y se activan con Enter |
| **Q3** | Controles y datos que simulan funcionar | Boletín que solo lanza `alert()` en 29 páginas; "Agua 28.2 °C" fijo bajo un indicador "en vivo" | Todos | Erosiona la confianza que la marca vende | Media | Constante | Sustituir el boletín por los canales reales; retirar el dato fijo | Bajo | Cero `alert()` de éxito falso; el widget solo muestra lo que calcula |
| **F1** | El filtro de experiencias parece no funcionar | Filtrar "Vida Silvestre" deja visibles las 5 expediciones no relacionadas; sin contador ni estado vacío | Quien explora el catálogo | El filtro parece averiado | Media | Frecuente | Ocultar el segundo nivel al filtrar y anunciar el resultado | Bajo | Muestra "2 de 6" y ofrece volver a todas |
| **S1** | Path SVG malformado del logo de TripAdvisor | `<path> attribute d: Expected number` en consola de 9 páginas. Preexistente en `HEAD` | — | Error de consola permanente | Baja | Constante | Restaurar la coordenada perdida | Bajo | Consola sin ese error en las 9 páginas |

### Hipótesis

- **C1** — Si el botón de menú cabe en pantalla, el visitante móvil que llega a una página de tour podrá llegar a las demás experiencias, porque hoy la navegación está literalmente fuera del viewport. Se validará con la profundidad de sesión y las páginas por visita en móvil.
- **A2** — Si hay un CTA fijo en todas las páginas, el tráfico orgánico podrá escribir en cualquier punto de la lectura, porque hoy solo puede hacerlo en dos posiciones separadas por 8 700 px. Se validará con el evento `whatsapp_click` segmentado por página de destino.
- **A1** — Si la previsión lunar responde, quien duda de la fecha podrá decidir sin preguntar, porque hoy el bloque no aparece nunca. Se validará con la proporción de solicitudes que llegan ya con fecha propuesta.

---

## C. Arquitectura de información

### Mapa actual

```
/                     portada ES  · 11 tours + galería + FAQ + formulario
├── 6 páginas de tour ES         · contenido extenso, sin formulario
├── /puerto-escondido-tours/     · hub con los 11 tours
├── /blog/ (+2 artículos)
├── /en/ … (misma estructura)
└── /fr/ … (misma estructura)
```

La estructura de rutas es correcta y está bien posicionada. **No se modificó ninguna URL, ningún `canonical` ni ningún `hreflang`.**

### Cambios de navegación realizados

El problema no era el mapa, sino que en móvil no se podía recorrer. Los cambios son de alcance, no de estructura:

1. El menú pasa a ser alcanzable en las 30 páginas donde no lo era.
2. El cambio de idioma deja de quedar recortado fuera de pantalla.
3. Aparece una vía de contacto permanente en todas las páginas.
4. El filtro de experiencias deja de mezclar sus dos niveles de catálogo.

### Lo que se decidió no tocar

El modal de tour no enlaza a la página completa del tour, de modo que las páginas SILO quedan huérfanas dentro del recorrido de descubrimiento. Es un cambio de navegación con implicaciones de SEO y de negocio, así que queda documentado en el backlog en lugar de aplicarse sin criterio del negocio.

---

## D. Cambios implementados

### 1. Menú móvil alcanzable · CRÍTICO

- **Antes:** el header apilaba isotipo + nombre de marca (247 px) + selector de idioma (168 px) + botón de menú en una fila de 375 px. El botón quedaba comprimido a ancho 0 en la posición 455 px.
- **Solución:** en móvil se oculta el nombre de marca en texto, redundante porque el isotipo ya lo contiene, y el botón recibe un área de 44 × 44 conservando la barra visual de 24 × 18.
- **Archivos:** `styles.css` (bloque nuevo al final, sin tocar reglas previas).
- **Razón de UX:** una navegación que no se puede tocar no es una navegación.
- **Resultado:** botón de 44 × 44 con borde derecho en 355 px; desbordamiento del header = 0.
- **Validación:** 15 páginas comprobadas en Playwright a 390 px y verificado en Chrome.

### 2. Previsión lunar por fecha · ALTO

- **Antes:** `app.js:984` llamaba a `calculateMoonData()`, función inexistente. Cada cambio de fecha lanzaba `ReferenceError` y el bloque quedaba vacío en los tres idiomas.
- **Solución:** se implementó la función reutilizando el mismo ciclo sinódico (29,53 días) y la misma época que el widget del hero, de modo que ambos datos coinciden siempre. Devuelve fase, porcentaje de iluminación, nivel de brillo y un consejo. Cuando la experiencia elegida no depende de la luna, lo dice en lugar de alarmar.
- **Extra:** el campo de fecha no tenía `min`, así que aceptaba días pasados. Ahora se ancla a hoy en hora local.
- **Archivos:** `app.js`.
- **Resultado:** con fecha 18/01/2027 y bioluminiscencia devuelve "Gibosa creciente · BAJO — LUNA BRILLANTE" con la recomendación de mover fechas. Con kayak, la misma fecha explica que la luna no le afecta.
- **Validación:** verificado en ES, EN y FR sin errores de consola.

### 3. Contacto persistente en móvil · ALTO

- **Antes:** solo las 3 portadas tenían barra fija; la burbuja flotante se oculta por debajo de 768 px.
- **Solución:** barra fija añadida a las 30 páginas restantes. Para las 21 de tour y hub se **reutilizó el enlace de WhatsApp que ya existía en cada página**, conservando su mensaje precargado específico y su idioma; no se inventó ningún texto comercial. Para las 9 del blog se construyó un saludo neutro en el idioma de la página.
- **Archivos:** las 30 páginas HTML, más una regla de foco en `styles.css`.
- **Resultado:** las 33 páginas mantienen el CTA visible en todo el scroll, con 54 px de alto.
- **Validación:** 15 páginas comprobadas tras desplazarse al final del documento.

### 4. Los chips dejan de vaciar el formulario · ALTO

- **Antes:** `selectTourAndScroll` asignaba el texto recibido tal cual. Los 5 chips pasan nombres con emoji ("🌌 Bioluminiscencia Mágica") que no coinciden con ningún `value`, así que el `<select>` quedaba vacío y el visitante llegaba a un formulario en blanco.
- **Solución:** emparejamiento en cascada, exacto → normalizado → por palabras distintivas con lista de palabras vacías en tres idiomas. Si nada coincide, **se conserva lo que el usuario ya tenía**. Además se confirma en pantalla qué se preseleccionó.
- **Archivos:** `app.js`, `styles.css`.
- **Resultado:** los 15 chips resuelven. "🌌 Bioluminiscencia Mágica" encuentra "Tour Bioluminiscencia" en los tres idiomas. Un nombre inexistente ya no borra la elección previa.

### 5. Contraste AA en el texto de acción · RÁPIDO

- **Antes:** `--accent-cyan: #008AA6` da 4.05:1 sobre blanco, por debajo del mínimo AA de 4.5:1 para texto normal. Afectaba a todos los enlaces "Cotizar mi tour" y "Ver detalles", a las etiquetas de campo del formulario y a las etiquetas de tarjeta. El pie usaba `#8297A1` sobre `#EBF2F5`: 2.69:1.
- **Solución:** se añadió `--accent-cyan-text: #00687E` (6.40:1), **tono que ya formaba parte del sistema** en el degradado de la píldora de idioma activa. El cian original se conserva para bordes, fondos e iconografía. No se cambió la identidad: se separó el color decorativo del color de lectura.
- **Nota:** el cian del brief, `#0788B8`, da 4.02:1 y tampoco habría alcanzado el mínimo para texto pequeño.

### 6. Operables con teclado · RÁPIDO

- **Antes:** 5 tarjetas de expedición, 8 fotos de galería y 5 chips eran `div` con `onclick`, sin foco ni rol. El modal de tour no cerraba con Escape, no movía el foco al abrir ni lo devolvía al cerrar, y no tenía `role="dialog"`. El acordeón y el botón de menú no exponían su estado. La acción del widget del hero era un `div` con `onclick` **dentro de un enlace**, inalcanzable por teclado; además la etiqueta del enlace decía "ver el estado real de la laguna hoy" pero saltaba a la sección "nosotros".
- **Solución:** rol, `tabindex` y activación con Enter y Espacio aplicados desde `app.js`, de modo que valen para los tres idiomas sin tocar el HTML. Diálogos con `role`, `aria-modal`, retención de foco, cierre con Escape y devolución del foco. `aria-expanded` en acordeón y menú. El widget del hero deja de ser un enlace y pasa a ser un panel informativo con un único botón real dentro, que ahora sí lleva a donde dice.
- **Resultado:** los 18 controles reciben foco, tienen nombre accesible y se activan con teclado. El botón del widget mide 44 px de alto y queda dentro de la tarjeta.

### 7. Fuera los controles y datos simulados · RÁPIDO

- **Antes:** el boletín de 29 páginas solo ejecutaba `alert('¡Gracias por suscribirte!')` sin suscribir a nadie, y su campo no tenía etiqueta. El widget "El estado de la laguna, hoy", con punto pulsante en vivo, mostraba "Agua 28.2 °C" escrito a mano en el HTML.
- **Solución:** el boletín se sustituye por enlaces a Instagram y Facebook, que son los canales que la marca realmente opera. La fila de temperatura se retira: las otras dos sí se calculan en tiempo real.
- **Resultado:** cero falsos éxitos; el indicador "en vivo" solo muestra lo que de verdad se computa.

### 8. Filtro coherente y con salida

- Al filtrar se ocultan las expediciones de día completo, que son otro nivel de catálogo, y se anuncia "Mostrando 2 de 6 experiencias" con un botón para volver a verlas todas. Incluye estado vacío.

### 9. Corrección de un error de consola preexistente

- El logotipo de TripAdvisor tenía una coordenada perdida en su `path`, lo que producía `<path> attribute d: Expected number` en 9 páginas. Ya estaba en `HEAD`; se restauró la coordenada.

---

## E. Evidencia antes / después

Página `/bioluminiscencia-oaxaca/` a 375 × 812, medido en el DOM:

| Medición | Antes | Después |
| --- | --- | --- |
| Ancho del botón de menú | 0 px | 44 px |
| Borde derecho del botón | 455 px | 355 px |
| Dentro del viewport | No | Sí |
| Desbordamiento del header | 68 px | 0 px |
| Barra de contacto fija | No existe | 54 px, visible en todo el scroll |
| Menú abre y cierra con teclado | No alcanzable | Abre, anuncia estado, cierra con Escape y devuelve el foco |

Portada, medido en el DOM:

| Medición | Antes | Después |
| --- | --- | --- |
| Elegir fecha | `ReferenceError` y bloque vacío | Fase, nivel y consejo |
| Fecha mínima del campo | sin `min` | hoy |
| Chips que preseleccionan | 0 de 5 | 5 de 5 |
| Chip con nombre desconocido | borra la elección | la conserva |
| Controles sin acceso por teclado | 18 | 0 |
| Contraste de "Cotizar mi tour" | 4.05:1 | ≥ 4.5:1 |
| Filas del widget "en vivo" | 3, una inventada | 2, ambas calculadas |

**Pasos por tarea.** El recorrido "llego a la página de un tour en el móvil y quiero escribir" pasa de ser imposible en gran parte del scroll a un solo toque en cualquier punto.

---

## F. Verificación técnica

- **Build:** el sitio es estático puro, sin paso de compilación. Cero dependencias de ejecución; no se instaló ninguna.
- **Sintaxis:** `node --check` en `app.js`, `playwright.config.js` y la suite nueva.
- **Pruebas:** suite ampliada de 48 a 106 casos. Los 48 casos originales conservan intacta su lógica.
- **Aislamiento de la suite:** los specs apuntaban a `http://localhost:3000`. En Windows `localhost` resuelve primero a `::1`, así que una ejecución llegó a aterrizar en el servidor de desarrollo de otro proyecto de la máquina y produjo 14 fallos fantasma. El servidor de pruebas se movió al puerto 3100 sobre `127.0.0.1` y todos los specs apuntan ahí. Es el único cambio hecho a los archivos de prueba originales.
- **Consola:** verificada en las 6 rutas representativas. Los 404 que aparecen en este entorno son de Google Fonts y del mapa incrustado, bloqueados por la red del sandbox; la comprobación distingue recursos propios de terceros.
- **Responsive:** verificado a 390 × 844 y 1440 × 900.
- **Accesibilidad:** contraste medido con la fórmula WCAG sobre el color calculado; foco, roles y estados verificados en el DOM.
- **Integridad de datos:** `assets/` conserva sus **166 archivos**, con hash agregado `88041634…9fcc8c` idéntico antes y después. No se borró, movió, renombró ni sustituyó ningún activo. No se modificó ninguna URL, `canonical`, `hreflang`, `sitemap.xml`, `robots.txt` ni `.htaccess`.
- **Sin invenciones:** no se añadió ningún precio, horario, testimonio, certificación ni dato de contacto. El único contenido nuevo visible son etiquetas de interfaz, consejos sobre la fase lunar y un saludo neutro de WhatsApp para el blog.

### Corrección a una conclusión previa

Durante la auditoría anoté que el CTA de los artículos del blog estaba muerto porque `waQuickChat` no encuentra formulario ni chat en esas páginas. **Es incorrecto:** los tres artículos en español sobrescriben `waQuickChat` con un script en línea propio que abre WhatsApp, y las seis páginas en inglés y francés usan enlaces directos a las páginas de tour. Ningún CTA de blog estaba muerto. Lo detectó la prueba que escribí para ese supuesto. El respaldo que añadí en `app.js` sigue siendo correcto como defensa, pero no corrigió ningún defecto observado y no debe contarse como tal.

---

## G. Backlog

### Siguiente mejora recomendada

1. **Peso de imágenes y estabilidad de diseño.** 22 de 24 imágenes de la portada no declaran `width` ni `height`, lo que provoca saltos de maquetación. Una sola imagen, `tour-chacahua-manglares-oaxaca.png`, pesa 2 574 KB y se sirve en una tarjeta de 350 px. Convertirla a WebP y declarar dimensiones es barato y mejora la percepción de velocidad en 3G/4G, que es la conexión real del destino.
2. **El modal de tour no lleva a la página del tour.** Las páginas SILO, que son las que mejor posicionan y más contenido tienen, no se alcanzan desde las tarjetas de la portada. Añadir "Ver la página completa" en el modal conecta descubrimiento con profundidad.

### Mejoras posteriores

3. **Hero de las páginas de tour en móvil:** mide 958 px de alto sobre un viewport de 812 px y recorta la fotografía a una franja vertical irreconocible. Cuesta una pantalla completa de scroll y no comunica.
4. **Textos del selector de experiencia sin traducir:** en `/en/` y `/fr/` varias opciones siguen en español ("Avistamiento de Delfines y Ballenas", "Cascadas Mágicas de Copalita").
5. **Galería:** las 8 tarjetas escritas a mano en el HTML se sustituyen por JavaScript al cargar. Es marcado muerto que hay que mantener por duplicado.
6. **Duplicación estructural:** el pie, el cajón móvil y el header están copiados en 33 archivos. Cualquier corrección exige 33 ediciones; este mismo trabajo lo demuestra.
7. `index_mejorado.html` (68 KB) permanece en el repositorio sin estar enlazado ni incluido en el sitemap.

### Ideas descartadas

- **Cambiar la tipografía a Montserrat, Bebas Neue y Caveat, y la paleta a `#061923`/`#0788B8`/`#E9E0CD`/`#F28A24`.** El sitio en producción usa Outfit y Playfair Display con una paleta derivada del logotipo. Sustituirla en 33 páginas es un cambio estético de alto riesgo que no resuelve ninguna fricción medida, y la regla número uno del propio encargo lo excluye. Además el cian propuesto tampoco habría alcanzado el contraste AA para texto pequeño. En su lugar se refinó la identidad existente donde fallaba de verdad: el contraste.
- **Tipografía translúcida integrada al paisaje.** No hay ningún punto del recorrido donde su ausencia cause fricción, y el hero ya usa fotografía a sangre con velo. Añadirla habría sido decoración.
- **Rediseñar el header.** Se corrigió lo que impedía usarlo y nada más.

### Decisiones que necesitan al negocio

- **Sello CONANP y SEMARNAT.** Se muestran como insignias en el pie de las 33 páginas y en la barra de garantías. No hay número de registro ni enlace verificable. Si son acreditaciones reales conviene enlazarlas, porque son la señal de confianza más fuerte del sitio; si no lo son, deben retirarse. No se tocaron por no disponer del dato.
- **"Seguro de viajero incluido"** aparece en la barra de garantías y en los tours. Convendría precisar cobertura y aseguradora.
- **Temperatura del agua.** Se retiró por ser un valor fijo presentado como lectura en vivo. Si existe una fuente real, puede reincorporarse citándola.
