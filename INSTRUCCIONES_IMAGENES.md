# 📸 Guía de Migración de Imágenes para tu Nueva Web Estática

¡Felicidades! Ya tenemos construida toda la arquitectura de código ultra-rápida y premium para **Paraíso Laguna**. Para que el sitio web funcione perfectamente y cargue en milisegundos, solo debemos colocar tus fotos locales (que actualmente pesan varios megabytes) en la carpeta del proyecto de forma **optimizada y comprimida**.

Sigue estos 3 sencillos pasos para dejar tu web lista al 100%:

---

## 📂 Paso 1: Ubica tus fotos locales
En las carpetas que ya tienes en tu computadora, he seleccionado las mejores fotos que encajan perfectamente con el diseño:

1.  **Bioluminiscencia (Experiencia Nocturna):**
    *   *Origen:* `C:\Users\reily\OneDrive\Pictures\web\paraíso laguna\FOTOS\paraiso-laguna-bioluminiscencia-editada-cuadrada.jpg` o cualquiera de tus fotos nocturnas.
2.  **Liberación de Tortugas:**
    *   *Origen:* `C:\Users\reily\OneDrive\Pictures\web\paraíso laguna\FOTOS\paraiso-laguna-tortugas-cuadrada-1200x1200.jpg` o similares.
3.  **Tour en Kayak / Manglares:**
    *   *Origen:* `C:\Users\reily\OneDrive\Pictures\web\paraíso laguna\FOTOS\manialtepec-lagoon-03.jpg` u otra donde salgan los manglares de día.
4.  **Atardecer en Chacahua:**
    *   *Origen:* `C:\Users\reily\OneDrive\Pictures\web\paraíso laguna\FOTOS\chacahua-oaxaca-sunsets.jpg`.

---

## ⚡ Paso 2: Comprime y Optimiza las fotos (¡Vital para la velocidad!)
Tus fotos originales tomadas con cámara o generadas por IA pesan entre **3 MB y 10 MB**. Para la web, deben pesar **menos de 200 KB** (¡un 98% menos!).

### Método Recomendado (Rápido y Gratis):
1.  Entra en la herramienta gratuita de Google: **[Squoosh.app](https://squoosh.app/)** o **[TinyJPG](https://tinyjpg.com/)**.
2.  Arrastra tu imagen.
3.  Reconfigura el tamaño (Resize): cambia el ancho a un máximo de **1920px** para fondos o **1200px** para las tarjetas de tours.
4.  Selecciona el formato de compresión a **MozJPEG** o **WebP** y pon la calidad al **75%**.
5.  Descárgala. ¡Verás que el peso baja drásticamente sin perder calidad visual!

---

## 📁 Paso 3: Renombra e incorpora las fotos a la carpeta de la web
Crea una carpeta llamada `assets` y dentro otra llamada `images` en la raíz de tu proyecto en:
`C:\Users\reily\.gemini\antigravity\scratch\paraiso-laguna-web\assets\images\`

*(Nota: Si usas Windows, la ruta completa es exactamente esa. Yo ya preparé la estructura en el código).*

Guarda tus fotos comprimidas en esa carpeta con los siguientes **nombres exactos**:

*   Para el tour de Bioluminiscencia: `paraiso-laguna-bioluminiscencia.jpg`
*   Para el tour de Tortugas: `paraiso-laguna-tortugas.jpg`
*   Para el tour de Kayak: `manialtepec-lagoon-03.jpg`
*   Para el tour de Chacahua y fondo Hero: `chacahua-oaxaca-sunsets.jpg`
*   Para el logo/icono de la pestaña: `favicon.png`

---

## 📹 Opcional: El video de fondo en el inicio
Si quieres que tu web tenga un video inmersivo espectacular en movimiento apenas abra:
1.  Toma uno de tus videos cortos de tu carpeta `1.CONTENIDO 2026` (ej. uno que muestre el atardecer o la lancha navegando).
2.  Comprímelo gratis en [FreeConvert](https://www.freeconvert.com/video-compressor) o similar para que pese **menos de 3 MB** (para que cargue al instante en celulares).
3.  Guárdalo en la carpeta `C:\Users\reily\.gemini\antigravity\scratch\paraiso-laguna-web\assets\videos\` con el nombre:
    `hero_video.mp4`

¡Listo! Con esto tu página web cargará a la velocidad de la luz y capturará la atención de todos los turistas en Oaxaca. 🌊🚀
