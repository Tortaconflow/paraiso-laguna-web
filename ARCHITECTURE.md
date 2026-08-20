# Arquitectura Web y Sistema Multilingüe — Paraíso Laguna

**Fecha:** 19 de Agosto de 2026  
**Proyecto:** Paraíso Laguna (Ecoturismo & Experiencias en Puerto Escondido, Oaxaca)  
**Versión de Arquitectura:** 2.0 (Preparada para Internacionalización ES / EN / FR)  

---

## 1. Principios de Diseño y Restricciones Arquitectónicas

1. **Preservación Inmutable de URLs en Español:**
   - La raíz `/` y las rutas `/<slug-es>/` son sagradas e inmutables para no perder posicionamiento ni autoridad orgánica en Google.
   - El idioma español **NUNCA** se mueve a `/es/`.
2. **Estructura de Subdirectorios para Nuevos Idiomas:**
   - Inglés: `/en/` y `/en/<slug-en>/`
   - Francés: `/fr/` y `/fr/<slug-fr>/`
3. **Zero Runtime Framework Overhead:**
   - Mantener arquitectura estática pura (HTML5 semántico, CSS3 custom properties y Vanilla JS modular).
   - Velocidad máxima de carga, TTFB mínimo y First Contentful Paint (FCP) ultrarrápido para turistas navegando en conexiones 3G/4G en la costa.
4. **Arquitectura SILO y Mapeo Canónico Hreflang:**
   - Cada página en cada idioma cuenta con su etiqueta `canonical` autorreferenciada y un bloque completo de etiquetas `<link rel="alternate" hreflang="..." href="...">` bidireccionales, incluyendo `x-default` apuntando a la versión en español `/`.

---

## 2. Mapa de Rutas y Matriz de Equivalencias (ES / EN / FR)

```
PARAISOLAGUNA.COM/ (Hostinger Web Server)
├── index.html                                (Home Español - Default)
├── styles.css                                (Design System Unificado)
├── app.js                                    (Lógica interactiva + I18n engine)
├── sitemap.xml                               (Sitemap multilingüe con hreflang)
├── robots.txt
│
├── bioluminiscencia-oaxaca/                  [ES] Tour Bioluminiscencia
├── liberacion-tortugas-oaxaca/               [ES] Liberación de Tortugas
├── tour-chacahua/                            [ES] Tour Chacahua
├── avistamiento-delfines-oaxaca/             [ES] Avistamiento de Delfines
├── paseo-caballo-puerto-escondido/           [ES] Paseo a Caballo
├── kayak-manglares-manialtepec/              [ES] Kayak en Manglares
├── puerto-escondido-tours/                   [ES] Hub Destino Tours
├── blog/                                     [ES] Hub del Blog
│   ├── guia-bioluminiscencia-manialtepec.html
│   └── liberacion-tortugas-puerto-escondido.html
│
├── en/                                       [EN] English Home
│   ├── index.html
│   ├── bioluminescence-tour-oaxaca/         [EN] Bioluminescence
│   ├── turtle-release-puerto-escondido/      [EN] Turtle Release
│   ├── chacahua-tour/                        [EN] Chacahua Tour
│   ├── dolphin-watching-oaxaca/              [EN] Dolphin Watching
│   ├── horseback-riding-puerto-escondido/    [EN] Horseback Riding
│   ├── kayak-mangroves-manialtepec/          [EN] Mangrove Kayak
│   └── puerto-escondido-tours/               [EN] Tours Hub
│
└── fr/                                       [FR] French Home
    ├── index.html
    ├── bioluminescence-manialtepec/          [FR] Bioluminescence
    ├── liberation-tortues-puerto-escondido/  [FR] Libération des Tortues
    ├── excursion-chacahua/                   [FR] Excursion Chacahua
    ├── observation-dauphins-oaxaca/          [FR] Observation Dauphins
    ├── balade-cheval-puerto-escondido/       [FR] Balade à Cheval
    ├── kayak-mangroves-manialtepec/          [FR] Kayak dans les Mangroves
    └── tours-puerto-escondido/               [FR] Tours Hub
```

---

## 3. Matriz de Mapeo SEO Internacional (Hreflang)

| Experiencia / Página | Español (`es-MX` / `x-default`) | Inglés (`en-US` / `en`) | Francés (`fr-FR` / `fr`) |
| :--- | :--- | :--- | :--- |
| **Home** | `https://paraisolaguna.com/` | `https://paraisolaguna.com/en/` | `https://paraisolaguna.com/fr/` |
| **Bioluminiscencia** | `https://paraisolaguna.com/bioluminiscencia-oaxaca/` | `https://paraisolaguna.com/en/bioluminescence-tour-oaxaca/` | `https://paraisolaguna.com/fr/bioluminescence-manialtepec/` |
| **Tortugas** | `https://paraisolaguna.com/liberacion-tortugas-oaxaca/` | `https://paraisolaguna.com/en/turtle-release-puerto-escondido/` | `https://paraisolaguna.com/fr/liberation-tortues-puerto-escondido/` |
| **Chacahua** | `https://paraisolaguna.com/tour-chacahua/` | `https://paraisolaguna.com/en/chacahua-tour/` | `https://paraisolaguna.com/fr/excursion-chacahua/` |
| **Delfines** | `https://paraisolaguna.com/avistamiento-delfines-oaxaca/` | `https://paraisolaguna.com/en/dolphin-watching-oaxaca/` | `https://paraisolaguna.com/fr/observation-dauphins-oaxaca/` |
| **Caballos** | `https://paraisolaguna.com/paseo-caballo-puerto-escondido/` | `https://paraisolaguna.com/en/horseback-riding-puerto-escondido/` | `https://paraisolaguna.com/fr/balade-cheval-puerto-escondido/` |
| **Kayak** | `https://paraisolaguna.com/kayak-manglares-manialtepec/` | `https://paraisolaguna.com/en/kayak-mangroves-manialtepec/` | `https://paraisolaguna.com/fr/kayak-mangroves-manialtepec/` |
| **Hub Tours** | `https://paraisolaguna.com/puerto-escondido-tours/` | `https://paraisolaguna.com/en/puerto-escondido-tours/` | `https://paraisolaguna.com/fr/tours-puerto-escondido/` |

---

## 4. Arquitectura del Selector de Idioma (Language Switcher)

Para garantizar la mejor experiencia de usuario y accesibilidad (WCAG 2.1 AA):
1. **Ubicación:** Integrado en el navbar de escritorio (a la derecha de los enlaces principales) y en el menú desplegable móvil (Mobile Drawer).
2. **Formato:** Dropdown compacto accesible con teclado o pills selectoras: `ES | EN | FR` con indicador visual de idioma activo.
3. **Mapeo Inteligente:** Si un usuario está en `/bioluminiscencia-oaxaca/` y hace clic en `EN`, se le dirige a `/en/bioluminescence-tour-oaxaca/` (no a la Home `/en/`), preservando el contexto del tour que está explorando.

---

## 5. Arquitectura del Motor de Lógica e I18n en JavaScript

Para evitar duplicar 829 líneas de JS en 3 archivos separados (`app.es.js`, `app.en.js`, `app.fr.js`), la arquitectura define:

1. **Detección de Idioma por Atributo HTML:**  
   `document.documentElement.lang` (ej. `es-MX`, `en`, `fr`).
2. **Diccionario de Traducción en Memoria / Módulo I18n:**
   - Fases lunares (`MOON_PHASES_I18N`)
   - Nivel de brillo (`GLOW_LEVELS_I18N`)
   - Catálogo de tours para el modal dinámico (`TOURS_DATA_I18N`)
   - Templates de mensajes para WhatsApp con textos en el idioma del usuario
   - Textos de validación del formulario
3. **Estandarización de Rutas de Assets:**
   - Todos los assets referenciados en JS (`assets/images/...`) calcularán su prefijo relativo según la profundidad de la URL (`../`, `../../` o `/assets/...`).

---

## 6. Arquitectura de Analítica y Eventos de Conversión (GA4)

1. **Estandarización Global:** Script de GA4 (`G-6N2D25Z3EW`) inyectado en el `<head>` de **todas** las páginas.
2. **Convención de Eventos de Conversión:**
   - `whatsapp_click`: Al hacer clic en cualquier CTA de WhatsApp. Parámetros: `tour_name`, `source_section` (hero, card, modal, sticky_bar, floating_bubble), `language` (es, en, fr).
   - `generate_lead`: Al enviar el formulario de cotización. Parámetros: `experience`, `guests_count`, `date_selected`, `language`.
   - `view_tour_modal`: Al abrir los detalles de un tour en el modal interactivo.
   - `language_switch`: Al cambiar de idioma en el selector.
