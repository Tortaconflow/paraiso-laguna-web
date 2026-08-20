# Auditoría Técnica y Diagnóstico Integral — Paraíso Laguna

**Fecha de Auditoría:** 19 de Agosto de 2026  
**Dominio de Producción:** [https://paraisolaguna.com/](https://paraisolaguna.com/)  
**Repositorio:** `https://github.com/Tortaconflow/paraiso-laguna-web`  
**Rol:** Senior Tech Lead, Web Architect, Technical SEO, Analytics & CRO Specialist  

---

## 1. Resumen Ejecutivo

Paraíso Laguna es una plataforma web de ecoturismo y tours de aventura operando en Puerto Escondido y la Costa de Oaxaca (Laguna de Manialtepec, Parque Nacional Lagunas de Chacahua, La Escobilla / Vive Mar, Copalita, Mazunte, etc.).

La web está construida como un sitio **estático multi-página (MPA) de alto rendimiento en Vanilla HTML5, CSS3 y JavaScript ES6+**, sin frameworks pesados de frontend (sin React, Vue, Next.js ni Nuxt), alojado sobre un servidor web Apache / Litespeed (Hostinger).

El modelo comercial se fundamenta en **generación de leads de alta intención (cotizaciones personalizadas) dirigidos a WhatsApp Business (`+52 954 161 1334`)**, sin pasarelas de pago directas ni precios fijos públicos en el DOM para maximizar la conversión asistida.

---

## 2. Inventario Completo de Páginas y Rutas Actuales

### 2.1. Nivel 0 — Home Principal
* **URL:** `https://paraisolaguna.com/` (archivo `index.html`)
* **Propósito:** Landing page central estructurada con el arco de conversión *Dream → Discover → Trust → Book*, widget de cálculo astronómico de fase lunar en vivo para bioluminiscencia (`#hero-bio-canvas`), catálogo de 11 tours (6 principales + 5 secundarios), galería masonry de 41 fotos WebP con lightbox, bloque de confianza/garantías, testimonios, acordeón de FAQs y formulario conversacional hacia WhatsApp.

### 2.2. Nivel 1 — Páginas Transaccionales de Tours Específicos (SILO SEO)
| Ruta Canónica Actual | Archivo Físico | Estado SEO | H1 / Foco Principal |
| :--- | :--- | :--- | :--- |
| `https://paraisolaguna.com/bioluminiscencia-oaxaca/` | `bioluminiscencia-oaxaca/index.html` | Indexada (P0.90) | Tour de Bioluminiscencia en Oaxaca — Laguna de Manialtepec |
| `https://paraisolaguna.com/liberacion-tortugas-oaxaca/` | `liberacion-tortugas-oaxaca/index.html` | Indexada (P0.90) | Liberación de Tortugas en Puerto Escondido |
| `https://paraisolaguna.com/tour-chacahua/` | `tour-chacahua/index.html` | Indexada (P0.90) | Tour al Parque Nacional Lagunas de Chacahua |
| `https://paraisolaguna.com/avistamiento-delfines-oaxaca/` | `avistamiento-delfines-oaxaca/index.html` | Indexada (P0.85) | Avistamiento de Delfines y Ballenas en Puerto Escondido |
| `https://paraisolaguna.com/paseo-caballo-puerto-escondido/` | `paseo-caballo-puerto-escondido/index.html` | Indexada (P0.85) | Atardecer a Caballo en Puerto Escondido |
| `https://paraisolaguna.com/kayak-manglares-manialtepec/` | `kayak-manglares-manialtepec/index.html` | Indexada (P0.85) | Kayak en Manglares de Manialtepec |

### 2.3. Nivel 2 — Hub de Destino
* **URL:** `https://paraisolaguna.com/puerto-escondido-tours/` (archivo `puerto-escondido-tours/index.html`)
* **Propósito:** Hub temático de tours en Puerto Escondido (Prioridad 0.90 en sitemap).

### 2.4. Nivel 3 — Blog de Ecoturismo & Guías de Contenido (GEO / Informacional)
* **Blog Index:** `https://paraisolaguna.com/blog/` (archivo `blog/index.html`)
* **Artículo 1:** `https://paraisolaguna.com/blog/guia-bioluminiscencia-manialtepec.html` (archivo `blog/guia-bioluminiscencia-manialtepec.html`)
* **Artículo 2:** `https://paraisolaguna.com/blog/liberacion-tortugas-puerto-escondido.html` (archivo `blog/liberacion-tortugas-puerto-escondido.html`)

---

## 3. Análisis de Infraestructura, Dependencias y Configuración

### 3.1. Dependencias (`package.json`)
* **Producción:** 0 dependencias en tiempo de ejecución (Vanilla JS nativo).
* **Desarrollo:** `@playwright/test` (^1.61.1) utilizado para pruebas E2E de interfaz y conversión contra `http://localhost:3000`.

### 3.2. Servidor Web y Reglas de Enrutamiento (`.htaccess`)
El archivo `.htaccess` contiene:
1. **Redirecciones 301 de WordPress antiguo:** reglas para URLs legacy (`/galeria/`, `/contacto/`, `/experiencias/`, `/services/`, etc.).
2. **⚠️ Conflicto crítico detectado:**
   ```apache
   # --- 4. Redirecciones de Idioma Inglés (/en/*) a Equivalente Español ---
   RewriteRule ^en/paseo-en-kayak/?$ /kayak-manglares-manialtepec/ [R=301,NC,L]
   RewriteRule ^en/tirolesa/?$ /puerto-escondido-tours/ [R=301,NC,L]
   RewriteRule ^en/tours/?$ /puerto-escondido-tours/ [R=301,NC,L]
   RewriteRule ^en/contacto/?$ /#contacto [R=301,NE,NC,L]
   RewriteRule ^en/tours-chacahua/?$ /tour-chacahua/ [R=301,NC,L]
   RewriteRule ^en/bioluminiscencia/?$ /bioluminiscencia-oaxaca/ [R=301,NC,L]
   RewriteRule ^en/liberacion-tortugas/?$ /liberacion-tortugas-oaxaca/ [R=301,NC,L]
   
   # Redireccionar cualquier otra ruta /en/* que no tenga equivalente a Home
   RewriteRule ^en/(.*)$ / [R=301,NC,L]
   ```
   *Impacto:* Si desplegamos la versión en inglés en la carpeta `/en/`, Apache interceptará todas las peticiones y redirigirá a la versión en español o a la Home (`/`). Estas reglas deben ser deshabilitadas/actualizadas tan pronto se cree la estructura `/en/`.
3. **Bloqueo 410 Gone:** Reglas para proteger peticiones residuales de WordPress (`wp-admin`, `wp-content`, `elementor_library`).

### 3.3. Sitemap (`sitemap.xml`) y Robots (`robots.txt`)
* `sitemap.xml`: Contiene 10 URLs activas en español. No incluye `hreflang` ni las páginas secundarias de blog.
* `robots.txt`: Correctamente configurado con `Allow: /` y permisos explícitos para agentes de IA (Google-Extended, GPTBot, PerplexityBot, ClaudeBot, Applebot-Extended, Cohere-ai) optimizado para GEO (Generative Engine Optimization).

---

## 4. Estado de Analytics y Medición Digital

### 4.1. Google Analytics 4 (GA4)
* **ID:** `G-6N2D25Z3EW`
* **Implementación actual:**
  * ✅ Presente en `index.html` e `index_mejorado.html`.
  * ❌ **Completamente ausente** en las 6 subpáginas de tours (`/bioluminiscencia-oaxaca/`, etc.), en la landing general (`/puerto-escondido-tours/`) y en el blog (`/blog/`, `/blog/*.html`).
  * *Riesgo:* Todo el tráfico orgánico SEO directo a páginas de tours no se está registrando en GA4.
* **Eventos personalizados actuales:**
  * En `app.js`, se dispara `gtag('event', 'generate_lead', ...)` al enviar el formulario `#whatsapp-booking-form` y al hacer clic en el botón cotizar del modal `#tour-modal`.
  * No existen eventos para clics en botón flotante de WhatsApp, barra sticky móvil, enlaces del header ni tracking diferenciado por idioma.

---

## 5. Arquitectura de Componentes y Lógica JavaScript (`app.js`)

`app.js` (829 líneas) contiene los siguientes módulos:
1. **`initHeroBioParticles`:** Canvas interactivo sincronizado con la fase lunar astronómica en tiempo real mediante fórmula de ciclo sinódico (29.53 días).
2. **Scroll Reveal:** `IntersectionObserver` para clases `.reveal`.
3. **Fase Lunar Real:** Widget que asigna `#moon-phase` y `#glow-potential`.
4. **Acordeón FAQs:** Manejo interactivo de preguntas frecuentes.
5. **Formulario Conversacional WhatsApp:** Construcción de mensaje codificado URI con emojis y campos dinámicos para enviar a `529541611334`.
6. **Catálogo `TOURS_DATA` (11 Tours):** Base de datos en memoria con textos en español, duraciones, inclusiones y qué llevar para alimentar el modal dinámico `#tour-modal`.
7. **Galería Masonry & Lightbox `GALLERY_PHOTOS` (41 Fotos):** Renderizado dinámico con filtros de categoría y navegación por teclado (Escape, Flechas).
8. **Filtro de Experiencias:** Filtrado por categoría en la cuadrícula de tours.
9. **Menú Móvil Drawer:** Control de apertura/cierre de navegación en móviles.

---

## 6. Diagnóstico de Problemas Técnicos y Riesgos Detectados

| # | Problema / Riesgo | Severidad | Descripción & Consecuencia |
| :--- | :--- | :--- | :--- |
| **R1** | Regla `.htaccess` captura `/en/*` | **Crítica** | La regla 4 de `.htaccess` redirige todo `/en/*` a la Home o URLs en español, impidiendo que el sitio en inglés funcione hasta modificar la regla. |
| **R2** | GA4 huérfano en subpáginas | **Alta** | 9 de las 11 páginas no cargan el script de GA4 (`G-6N2D25Z3EW`), perdiendo tracking de conversiones de tráfico directo orgánico. |
| **R3** | Textos en JS no internacionalizados | **Alta** | `TOURS_DATA`, nombres de fases lunares, mensajes de WhatsApp y alertas están hardcodeados en español dentro de `app.js`. Al cambiar de idioma, el JS debe ser contextual o internacionalizable. |
| **R4** | Ausencia de etiquetas `hreflang` | **Alta** | Si se agregan `/en/` y `/fr/` sin `rel="alternate" hreflang="x"`, Google puede considerar el contenido duplicado o no indexar adecuadamente las versiones según la región del usuario. |
| **R5** | Enlaces relativos a assets | **Media** | Las páginas secundarias usan `../assets/` y `../app.js`. Al anidar carpetas `/en/bioluminiscencia/` o `/en/tour/`, las rutas relativas pueden romperse si no se estandariza el manejo de rutas relativas o absolutas. |
| **R6** | Discrepancia en suites de test | **Media** | `tests/ui.spec.js` valida elementos de la Home española (`wa.me/529541611334`, `#moon-phase`, 11 tours). Cualquier suite de test multilingüe debe extender la cobertura sin romper la suite existente. |
