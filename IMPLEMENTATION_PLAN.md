# Plan de Implementación Maestro — Paraíso Laguna

**Proyecto:** Plataforma Multilingüe y Optimización Global Paraíso Laguna  
**Autor:** Senior Tech Lead, Web Architect, Technical SEO & CRO  
**Fecha:** 19 de Agosto de 2026  

---

## Estructura de Fases de Ejecución

### FASE 1 — Internacionalización (Fundamentos y Arquitectura Base)
* **Objetivo:** Preparar la infraestructura del proyecto sin romper el posicionamiento en español existente.
* **Acciones:**
  1. **Actualización de `.htaccess`:**
     - Desactivar las reglas de redirección de WordPress legacy que capturan `/en/*` hacia la home.
     - Garantizar que las nuevas rutas `/en/` y `/fr/` sean servidas limpiamente por el servidor Apache/Litespeed.
  2. **Refactorización de `app.js` para I18n:**
     - Modularizar la detección de idioma (`document.documentElement.lang`).
     - Extraer `TOURS_DATA`, nombres de fases lunares, estados de brillo de bioluminiscencia y templates de mensajes de WhatsApp a estructuras multilingües (`i18n.js` o diccionarios en `app.js`).
     - Normalizar rutas de imágenes relativas para páginas de nivel 1 y subdirectorios de idioma.
  3. **Creación del Componente Selector de Idiomas (Language Switcher):**
     - Diseñar e integrar el selector accesible (WCAG 2.1 AA) en el header de escritorio y drawer móvil de todas las páginas en español (`index.html`, subpáginas de tours y blog).

---

### FASE 2 — Inglés (`/en/`)
* **Objetivo:** Crear la versión completa en inglés manteniendo coherencia visual, tono de marca y compatibilidad de conversión vía WhatsApp.
* **Acciones:**
  1. **Home en Inglés (`/en/index.html`):**
     - Traducir copy persuasivo respetando el arco de conversión *Dream → Discover → Trust → Book*.
     - Adaptar widget de fase lunar (`#moon-phase`, `#glow-potential`) al inglés.
     - Adaptar formulario de cotización a WhatsApp con copy en inglés dirigido a turistas angloparlantes.
  2. **Subpáginas de Tours en Inglés (6 páginas SILO + Hub):**
     - `/en/bioluminescence-tour-oaxaca/index.html`
     - `/en/turtle-release-puerto-escondido/index.html`
     - `/en/chacahua-tour/index.html`
     - `/en/dolphin-watching-oaxaca/index.html`
     - `/en/horseback-riding-puerto-escondido/index.html`
     - `/en/kayak-mangroves-manialtepec/index.html`
     - `/en/puerto-escondido-tours/index.html`
  3. **Generación de Mensajes WhatsApp en Inglés:**
     - Plantillas optimizadas para conversión en inglés con saludo cálido y resumen de tour seleccionado.

---

### FASE 3 — Francés (`/fr/`)
* **Objetivo:** Desarrollar la versión en francés dirigida al creciente turismo francófono (Francia, Canadá, Suiza, Bélgica).
* **Acciones:**
  1. **Home en Francés (`/fr/index.html`):**
     - Traducción culturalmente adaptada del catálogo de tours, testimonios, garantías y FAQs.
     - Adaptación del formulario conversacional de WhatsApp en francés.
  2. **Subpáginas de Tours en Francés (6 páginas SILO + Hub):**
     - `/fr/bioluminescence-manialtepec/index.html`
     - `/fr/liberation-tortues-puerto-escondido/index.html`
     - `/fr/excursion-chacahua/index.html`
     - `/fr/observation-dauphins-oaxaca/index.html`
     - `/fr/balade-cheval-puerto-escondido/index.html`
     - `/fr/kayak-mangroves-manialtepec/index.html`
     - `/fr/tours-puerto-escondido/index.html`
  3. **Generación de Mensajes WhatsApp en Francés:**
     - Plantillas fluidas en francés (*"Bonjour Paraíso Laguna..."*) adaptadas al flujo de atención del operador local.

---

### FASE 4 — SEO Internacional & Estructuración de Datos
* **Objetivo:** Garantizar máxima indexación en Google México, Google US/UK y Google Francia/Canadá sin canibalización ni contenido duplicado.
* **Acciones:**
  1. **Etiquetas `hreflang` y Canonical:**
     - Inyectar etiquetas `<link rel="alternate" hreflang="es-MX" href="...">`, `hreflang="en"`, `hreflang="fr"` y `hreflang="x-default"` en el `<head>` de **cada una** de las páginas en los 3 idiomas.
  2. **Sitemap XML Multilingüe (`sitemap.xml`):**
     - Actualizar `sitemap.xml` con formato XHTML extendido con etiquetas `xhtml:link rel="alternate" hreflang` para todas las páginas canónicas.
  3. **Schema.org JSON-LD Multilingüe:**
     - Localizar schemas `TouristTrip`, `TravelAgency`, `Place`, `FAQPage` y `BreadcrumbList` en inglés y francés para Rich Snippets en Google.
  4. **Optimización de Metatags:**
     - Title tags y Meta descriptions adaptadas a las intenciones de búsqueda de cada idioma con longitud optimizada para SERP (Desktop y Móvil).

---

### FASE 5 — Analytics y Medición Digital
* **Objetivo:** Resolver los puntos ciegos de analítica y habilitar un modelo de atribución de conversión transparente.
* **Acciones:**
  1. **Despliegue Universal de GA4 (`G-6N2D25Z3EW`):**
     - Instalar el tag en todas las páginas de tours existentes en español, blog y nuevas páginas en inglés y francés.
  2. **DataLayer y Eventos de Conversión Estandarizados:**
     - `whatsapp_start_conversation`: Tracking de todos los puntos de contacto a WhatsApp (Hero CTA, Card Cotizar, Sticky Bar, Floating Bubble, Modal CTA, Blog inline CTA).
     - `lead_form_submit`: Formulario principal con parámetros de idioma, experiencia y número de pasajeros.
     - `gallery_interaction` y `faq_toggle`: Medición de engagement profundo.

---

### FASE 6 — CRO (Conversion Rate Optimization) & WhatsApp Flow
* **Objetivo:** Incrementar la tasa de conversión global sin romper la estrategia comercial de no publicar precios fijos.
* **Acciones:**
  1. **Mejora del Flujo de Cotización:**
     - Microcopys de alta confianza ("Sin cargo por adelantado", "Confirmación inmediata por WhatsApp", "Guías locales certificados").
  2. **Optimización de Sticky Bar Móvil en Multilenguaje:**
     - Barra fija inferior adaptada al idioma actual con botón de acción directa.
  3. **Mejora del Widget Flotante:**
     - Respuestas rápidas (chips) adaptadas al idioma navegante.

---

### FASE 7 — Performance, Core Web Vitals & Accesibilidad
* **Objetivo:** Mantener puntuaciones Lighthouse > 90 en Mobile y Desktop (LCP < 2.5s, CLS < 0.1, INP < 200ms).
* **Acciones:**
  1. **Optimización de Recursos Críticos:**
     - Preloads selectivos de fuentes e imágenes de Hero por idioma.
     - Lazy loading nativo en todas las fotos secundarias y de galería.
  2. **Accesibilidad (a11y):**
     - Atributos `aria-expanded`, `aria-label`, contraste de colores en botones y soporte de navegación por teclado en el selector de idiomas y modales.

---

### FASE 8 — QA & Verificación Integral
* **Objetivo:** Garantizar 0 regresiones en el sitio actual y 100% de operatividad en las nuevas rutas.
* **Acciones:**
  1. **Extensión de Suite Playwright (`tests/ui.spec.js`):**
     - Pruebas automatizadas en Desktop y Mobile para URLs en ES, EN y FR.
     - Verificación de enlaces de WhatsApp en cada idioma.
     - Verificación de integridad de metadatos SEO, tags canónicos y hreflang.
  2. **Simulación de Crawlers:**
     - Verificación de status HTTP 200 en todas las URLs del sitemap.
     - Validación de ausencia de errores en consola de navegador.
