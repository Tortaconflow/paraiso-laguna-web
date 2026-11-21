// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3100';

const EN_FR_TOURS = [
  '/en/bioluminescence-tour-oaxaca/',
  '/en/turtle-release-puerto-escondido/',
  '/en/dolphin-whale-watching-puerto-escondido/',
  '/en/sunset-horseback-riding-puerto-escondido/',
  '/en/kayak-manialtepec-lagoon/',
  '/en/chacahua-national-park-tour/',
  '/fr/bioluminescence-oaxaca/',
  '/fr/liberation-tortues-puerto-escondido/',
  '/fr/dauphins-baleines-puerto-escondido/',
  '/fr/balade-cheval-coucher-soleil/',
  '/fr/kayak-lagune-manialtepec/',
  '/fr/parc-national-chacahua-tour/',
];

const ALL_18_TOURS = [
  '/bioluminiscencia-oaxaca/',
  '/liberacion-tortugas-oaxaca/',
  '/avistamiento-delfines-oaxaca/',
  '/paseo-caballo-puerto-escondido/',
  '/kayak-manglares-manialtepec/',
  '/tour-chacahua/',
  ...EN_FR_TOURS,
];

test.describe('Etapa 3 · Traduccion total EN/FR, galerias en tours, SILO modal, CRO, peso y a11y', () => {
  test('las 12 paginas de tour en EN y FR responden 200, sin errores ni textos residuales en espanol', async ({ page }) => {
    const esLeaks = [
      '¿', '¡', 'Qué incluye', 'Incluye:', 'Preguntas Frecuentes',
      'Listo para', 'Experiencias Relacionadas', 'Artículos Relacionados',
      'Hourrio', 'Heurerio', 'Dudas sobre', 'Salida Diaria',
    ];

    for (const route of EN_FR_TOURS) {
      const consoleErrors = [];
      const pageErrors = [];
      const onConsole = (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      };
      const onError = (err) => pageErrors.push(err.message);
      page.on('console', onConsole);
      page.on('pageerror', onError);

      const res = await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
      expect(res.status(), `HTTP 200 esperado en ${route}`).toBe(200);

      const payload = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const twDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';
        const ldText = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
          .map((s) => s.textContent || '')
          .join('\n');
        return { bodyText, twDesc, ldText };
      });

      for (const leak of esLeaks) {
        expect(payload.bodyText, `${route} body contiene '${leak}'`).not.toContain(leak);
        expect(payload.twDesc, `${route} twitter:description contiene '${leak}'`).not.toContain(leak);
        expect(payload.ldText, `${route} JSON-LD contiene '${leak}'`).not.toContain(leak);
      }

      expect(pageErrors, `pageerror en ${route}`).toEqual([]);
      expect(consoleErrors, `console.error en ${route}`).toEqual([]);
      page.off('console', onConsole);
      page.off('pageerror', onError);
    }
  });

  test('todas las 18 paginas de tour muestran su galeria editorial de 3 fotos con carga real y dimensiones', async ({ page }) => {
    for (const route of ALL_18_TOURS) {
      const failedImgs = [];
      const onResp = (res) => {
        if (res.url().match(/\.(webp|jpg|jpeg|png)(\?.*)?$/i) && res.status() >= 400) {
          failedImgs.push({ url: res.url(), status: res.status() });
        }
      };
      page.on('response', onResp);

      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
      const gallery = page.locator('.tour-photo-gallery');
      await expect(gallery, `Falta .tour-photo-gallery en ${route}`).toHaveCount(1);
      const imgs = gallery.locator('img');
      const count = await imgs.count();
      expect(count, `Se esperan 3 fotos en ${route}`).toBe(3);
      for (let i = 0; i < count; i++) {
        await imgs.nth(i).scrollIntoViewIfNeeded();
      }
      await page.waitForFunction(() => {
        const els = Array.from(document.querySelectorAll('.tour-photo-gallery img'));
        return els.length === 3 && els.every((el) => el.complete && el.naturalWidth > 0);
      });
      await page.waitForLoadState('networkidle');

      const imgStats = await page.$$eval('.tour-photo-gallery img', (imgs) =>
        imgs.map((img) => ({
          src: img.getAttribute('src'),
          widthAttr: img.getAttribute('width'),
          heightAttr: img.getAttribute('height'),
          complete: img.complete,
          naturalWidth: img.naturalWidth,
        }))
      );

      expect(imgStats.length, `Se esperan 3 fotos en ${route}`).toBe(3);
      for (const st of imgStats) {
        expect(Number(st.widthAttr), `width numerico requerido en ${route}: ${st.src}`).toBeGreaterThan(0);
        expect(Number(st.heightAttr), `height numerico requerido en ${route}: ${st.src}`).toBeGreaterThan(0);
        expect(st.complete && st.naturalWidth > 0, `Imagen no cargo en ${route}: ${st.src}`).toBe(true);
      }
      expect(failedImgs, `404 de imagen en ${route}`).toEqual([]);
      page.off('response', onResp);
    }
  });

  test('el modal #tour-modal enlaza al SILO en tours principales y secundarios (ES/EN/FR)', async ({ page, request }) => {
    const cases = [
      { home: '/', flagship: [
        { key: 'biolum', expected: '/bioluminiscencia-oaxaca/' },
        { key: 'chacahua', expected: '/tour-chacahua/' },
        { key: 'delfines', expected: '/avistamiento-delfines-oaxaca/' },
        { key: 'cascadas', expected: '/cascadas-copalita-oaxaca/' },
      ] },
      { home: '/en/', flagship: [
        { key: 'biolum', expected: '/en/bioluminescence-tour-oaxaca/' },
        { key: 'chacahua', expected: '/en/chacahua-national-park-tour/' },
        { key: 'delfines', expected: '/en/dolphin-whale-watching-puerto-escondido/' },
        { key: 'cascadas', expected: '/en/copalita-waterfalls-oaxaca/' },
      ] },
      { home: '/fr/', flagship: [
        { key: 'biolum', expected: '/fr/bioluminescence-oaxaca/' },
        { key: 'chacahua', expected: '/fr/parc-national-chacahua-tour/' },
        { key: 'delfines', expected: '/fr/dauphins-baleines-puerto-escondido/' },
        { key: 'cascadas', expected: '/fr/cascades-copalita-oaxaca/' },
      ] },
    ];

    for (const c of cases) {
      await page.goto(BASE + c.home, { waitUntil: 'domcontentloaded' });
      for (const f of c.flagship) {
        await page.evaluate((k) => window.openTourModal(k), f.key);
        const guideLink = page.locator('#modal-guide-link');
        await expect(guideLink).toBeVisible();
        await expect(guideLink).toHaveAttribute('href', f.expected);
        const res = await request.get(BASE + f.expected);
        expect(res.status(), `SILO target ${f.expected} debe responder 200`).toBe(200);
        await page.locator('#modal-close').click();
      }
    }
  });

  test('el footer incluye el enlace de Delfines y Ballenas y mantiene altura movil < 1200px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const checks = [
      { route: '/', path: 'avistamiento-delfines-oaxaca/' },
      { route: '/en/', path: '/en/dolphin-whale-watching-puerto-escondido/' },
      { route: '/fr/', path: '/fr/dauphins-baleines-puerto-escondido/' },
    ];
    for (const ch of checks) {
      await page.goto(BASE + ch.route, { waitUntil: 'domcontentloaded' });
      const dolphinLink = page.locator(`footer#main-footer a[href$="${ch.path}"]`);
      await expect(dolphinLink, `Falta enlace Delfines en footer de ${ch.route}`).toHaveCount(1);
      const box = await page.locator('footer#main-footer').boundingBox();
      expect(box.height, `Altura footer movil excedida en ${ch.route}`).toBeLessThan(1200);
    }
  });

  test('micro-copy de certeza CRO visible y con contraste AA >= 4.5:1 sobre su fondo', async ({ page }) => {
    for (const route of ['/', '/en/', '/fr/']) {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
      const micro = page.locator('#whatsapp-booking-form .cta-trust-microcopy');
      await micro.scrollIntoViewIfNeeded();
      await expect(micro).toBeVisible();

      const contrast = await micro.evaluate((el) => {
        function parseRgb(str) {
          const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [255, 255, 255];
        }
        function luminance([r, g, b]) {
          const a = [r, g, b].map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
        }
        const fg = parseRgb(getComputedStyle(el).color);
        let bg = [255, 255, 255];
        let cur = el;
        while (cur) {
          const c = getComputedStyle(cur).backgroundColor;
          const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (m && (m[4] === undefined || parseFloat(m[4]) > 0.7)) {
            bg = [Number(m[1]), Number(m[2]), Number(m[3])];
            break;
          }
          cur = cur.parentElement;
        }
        const l1 = luminance(fg);
        const l2 = luminance(bg);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      });

      expect(contrast, `Contraste insuficiente en .cta-trust-microcopy de ${route}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('higiene DOM a11y: cero botones sin type, cero img sin dimensiones y cero saltos de encabezado', async ({ page }) => {
    const sampleRoutes = [
      '/', '/en/', '/fr/',
      '/bioluminiscencia-oaxaca/', '/en/kayak-manialtepec-lagoon/', '/fr/parc-national-chacahua-tour/',
      '/blog/', '/aviso-de-privacidad/',
    ];

    for (const route of sampleRoutes) {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
      const audit = await page.evaluate(() => {
        const missingBtnType = Array.from(document.querySelectorAll('button')).filter((b) => !b.getAttribute('type')).length;
        const missingImgDims = Array.from(document.querySelectorAll('img')).filter((img) => {
          const w = img.getAttribute('width');
          const h = img.getAttribute('height');
          return !w || !h;
        }).length;
        const hs = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => Number(h.tagName.slice(1)));
        let jumps = 0;
        for (let i = 1; i < hs.length; i++) {
          if (hs[i] > hs[i - 1] + 1) jumps++;
        }
        return { missingBtnType, missingImgDims, jumps };
      });
      expect(audit.missingBtnType, `Botones sin type en ${route}`).toBe(0);
      expect(audit.missingImgDims, `Imagenes sin width/height en ${route}`).toBe(0);
      expect(audit.jumps, `Saltos de encabezado en ${route}`).toBe(0);
    }
  });
});
