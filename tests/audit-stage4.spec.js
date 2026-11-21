// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3100';

const NEW_15_SILO_PAGES = [
  { route: '/cascadas-copalita-oaxaca/', lang: 'es', key: 'cascadas' },
  { route: '/en/copalita-waterfalls-oaxaca/', lang: 'en', key: 'cascadas' },
  { route: '/fr/cascades-copalita-oaxaca/', lang: 'fr', key: 'cascadas' },
  { route: '/tirolesa-puerto-escondido/', lang: 'es', key: 'tirolesa' },
  { route: '/en/zipline-puerto-escondido/', lang: 'en', key: 'tirolesa' },
  { route: '/fr/tyrolienne-puerto-escondido/', lang: 'fr', key: 'tirolesa' },
  { route: '/aguas-termales-atotonilco-oaxaca/', lang: 'es', key: 'termales' },
  { route: '/en/atotonilco-hot-springs-oaxaca/', lang: 'en', key: 'termales' },
  { route: '/fr/sources-thermales-atotonilco/', lang: 'fr', key: 'termales' },
  { route: '/tour-mazunte-punta-cometa/', lang: 'es', key: 'mazunte' },
  { route: '/en/mazunte-punta-cometa-tour/', lang: 'en', key: 'mazunte' },
  { route: '/fr/excursion-mazunte-punta-cometa/', lang: 'fr', key: 'mazunte' },
  { route: '/atardecer-laguna-manialtepec/', lang: 'es', key: 'laguna-sunset' },
  { route: '/en/manialtepec-lagoon-sunset-tour/', lang: 'en', key: 'laguna-sunset' },
  { route: '/fr/coucher-soleil-lagune-manialtepec/', lang: 'fr', key: 'laguna-sunset' },
];

const SECONDARY_MODAL_CASES = [
  {
    home: '/',
    tours: [
      { key: 'cascadas', expected: '/cascadas-copalita-oaxaca/' },
      { key: 'tirolesa', expected: '/tirolesa-puerto-escondido/' },
      { key: 'termales', expected: '/aguas-termales-atotonilco-oaxaca/' },
      { key: 'mazunte', expected: '/tour-mazunte-punta-cometa/' },
      { key: 'laguna-sunset', expected: '/atardecer-laguna-manialtepec/' },
    ],
  },
  {
    home: '/en/',
    tours: [
      { key: 'cascadas', expected: '/en/copalita-waterfalls-oaxaca/' },
      { key: 'tirolesa', expected: '/en/zipline-puerto-escondido/' },
      { key: 'termales', expected: '/en/atotonilco-hot-springs-oaxaca/' },
      { key: 'mazunte', expected: '/en/mazunte-punta-cometa-tour/' },
      { key: 'laguna-sunset', expected: '/en/manialtepec-lagoon-sunset-tour/' },
    ],
  },
  {
    home: '/fr/',
    tours: [
      { key: 'cascadas', expected: '/fr/cascades-copalita-oaxaca/' },
      { key: 'tirolesa', expected: '/fr/tyrolienne-puerto-escondido/' },
      { key: 'termales', expected: '/fr/sources-thermales-atotonilco/' },
      { key: 'mazunte', expected: '/fr/excursion-mazunte-punta-cometa/' },
      { key: 'laguna-sunset', expected: '/fr/coucher-soleil-lagune-manialtepec/' },
    ],
  },
];

const HUB_CASES = [
  {
    hub: '/puerto-escondido-tours/',
    urls: [
      '/bioluminiscencia-oaxaca/',
      '/atardecer-laguna-manialtepec/',
      '/liberacion-tortugas-oaxaca/',
      '/avistamiento-delfines-oaxaca/',
      '/paseo-caballo-puerto-escondido/',
      '/kayak-manglares-manialtepec/',
      '/cascadas-copalita-oaxaca/',
      '/tirolesa-puerto-escondido/',
      '/aguas-termales-atotonilco-oaxaca/',
      '/tour-chacahua/',
      '/tour-mazunte-punta-cometa/',
    ],
  },
  {
    hub: '/en/puerto-escondido-tours/',
    urls: [
      '/en/bioluminescence-tour-oaxaca/',
      '/en/manialtepec-lagoon-sunset-tour/',
      '/en/turtle-release-puerto-escondido/',
      '/en/dolphin-whale-watching-puerto-escondido/',
      '/en/sunset-horseback-riding-puerto-escondido/',
      '/en/kayak-manialtepec-lagoon/',
      '/en/copalita-waterfalls-oaxaca/',
      '/en/zipline-puerto-escondido/',
      '/en/atotonilco-hot-springs-oaxaca/',
      '/en/chacahua-national-park-tour/',
      '/en/mazunte-punta-cometa-tour/',
    ],
  },
  {
    hub: '/fr/puerto-escondido-excursions/',
    urls: [
      '/fr/bioluminescence-oaxaca/',
      '/fr/coucher-soleil-lagune-manialtepec/',
      '/fr/liberation-tortues-puerto-escondido/',
      '/fr/dauphins-baleines-puerto-escondido/',
      '/fr/balade-cheval-coucher-soleil/',
      '/fr/kayak-lagune-manialtepec/',
      '/fr/cascades-copalita-oaxaca/',
      '/fr/tyrolienne-puerto-escondido/',
      '/fr/sources-thermales-atotonilco/',
      '/fr/parc-national-chacahua-tour/',
      '/fr/excursion-mazunte-punta-cometa/',
    ],
  },
];

test.describe('Etapa 4 · 15 SILOs secundarios (ES/EN/FR), modales y hubs completos', () => {
  test('las 15 nuevas paginas SILO devuelven 200 con SEO hreflang, 0 errores y 0 fugas en EN/FR', async ({ page }) => {
    const esLeaks = [
      '¿', '¡', 'Qué incluye', 'Incluye:', 'Preguntas Frecuentes',
      'Listo para', 'Experiencias Relacionadas', 'Dudas sobre', 'Salida Diaria',
    ];

    for (const item of NEW_15_SILO_PAGES) {
      const consoleErrors = [];
      const pageErrors = [];
      const onConsole = (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); };
      const onError = (e) => pageErrors.push(e.message);
      page.on('console', onConsole);
      page.on('pageerror', onError);

      const res = await page.goto(BASE + item.route, { waitUntil: 'domcontentloaded' });
      expect(res.status(), `HTTP 200 en ${item.route}`).toBe(200);

      const info = await page.evaluate(() => {
        const htmlLang = document.documentElement.getAttribute('lang');
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
        const hreflangs = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map((l) => l.getAttribute('hreflang'));
        const bodyText = document.body.innerText;
        const twDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';
        const ldText = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent || '').join('\n');
        return { htmlLang, canonical, hreflangs, bodyText, twDesc, ldText };
      });

      expect(info.htmlLang).toBe(item.lang === 'es' ? 'es-MX' : item.lang);
      expect(info.canonical).toBe(`https://paraisolaguna.com${item.route}`);
      expect(info.hreflangs.sort()).toEqual(['en', 'es', 'fr', 'x-default']);

      if (item.lang !== 'es') {
        for (const leak of esLeaks) {
          expect(info.bodyText, `${item.route} body contiene '${leak}'`).not.toContain(leak);
          expect(info.twDesc, `${item.route} twitter:description contiene '${leak}'`).not.toContain(leak);
          expect(info.ldText, `${item.route} JSON-LD contiene '${leak}'`).not.toContain(leak);
        }
      }

      expect(pageErrors, `pageerror en ${item.route}`).toEqual([]);
      expect(consoleErrors, `console.error en ${item.route}`).toEqual([]);
      page.off('console', onConsole);
      page.off('pageerror', onError);
    }
  });

  test('las 15 paginas SILO muestran galeria de 3 fotos reales, higiene DOM a11y y drawer movil funcional', async ({ page }) => {
    test.setTimeout(90000);
    for (const item of NEW_15_SILO_PAGES) {
      const failedImgs = [];
      const onResp = (res) => {
        if (res.url().match(/\.(webp|jpg|jpeg|png)(\?.*)?$/i) && res.status() >= 400) {
          failedImgs.push({ url: res.url(), status: res.status() });
        }
      };
      page.on('response', onResp);

      await page.goto(BASE + item.route, { waitUntil: 'domcontentloaded' });
      const gallery = page.locator('.tour-photo-gallery');
      await expect(gallery, `Falta .tour-photo-gallery en ${item.route}`).toHaveCount(1);
      const imgs = gallery.locator('img');
      expect(await imgs.count()).toBe(3);
      for (let i = 0; i < 3; i++) {
        await imgs.nth(i).scrollIntoViewIfNeeded();
      }
      await page.waitForFunction(() => {
        const els = Array.from(document.querySelectorAll('.tour-photo-gallery img'));
        return els.length === 3 && els.every((el) => el.complete && el.naturalWidth > 0);
      });

      const audit = await page.evaluate(() => {
        const missingBtnType = Array.from(document.querySelectorAll('button')).filter((b) => !b.getAttribute('type')).length;
        const missingImgDims = Array.from(document.querySelectorAll('img')).filter((img) => !img.getAttribute('width') || !img.getAttribute('height')).length;
        const hs = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => Number(h.tagName.slice(1)));
        let jumps = 0;
        for (let i = 1; i < hs.length; i++) {
          if (hs[i] > hs[i - 1] + 1) jumps++;
        }
        return { missingBtnType, missingImgDims, jumps };
      });
      expect(audit.missingBtnType).toBe(0);
      expect(audit.missingImgDims).toBe(0);
      expect(audit.jumps).toBe(0);
      expect(failedImgs).toEqual([]);
      page.off('response', onResp);
    }

    // Check mobile drawer + sticky CTA on representative new SILO pages
    await page.setViewportSize({ width: 390, height: 844 });
    for (const r of ['/cascadas-copalita-oaxaca/', '/en/zipline-puerto-escondido/', '/fr/coucher-soleil-lagune-manialtepec/']) {
      await page.goto(BASE + r, { waitUntil: 'domcontentloaded' });
      await page.locator('#hamburger-btn').click();
      await expect(page.locator('#mobile-drawer')).toHaveClass(/active/);
      await page.locator('#mobile-drawer .drawer-close-btn').click();
      await expect(page.locator('#mobile-drawer')).not.toHaveClass(/active/);
      await expect(page.locator('.mobile-sticky-cta')).toBeVisible();
    }
  });

  test('el modal #tour-modal enlaza a las 5 nuevas paginas SILO en ES, EN y FR con HTTP 200', async ({ page, request }) => {
    for (const c of SECONDARY_MODAL_CASES) {
      await page.goto(BASE + c.home, { waitUntil: 'domcontentloaded' });
      for (const t of c.tours) {
        await page.evaluate((k) => window.openTourModal(k), t.key);
        const guideLink = page.locator('#modal-guide-link');
        await expect(guideLink).toBeVisible();
        await expect(guideLink).toHaveAttribute('href', t.expected);
        const res = await request.get(BASE + t.expected);
        expect(res.status(), `SILO target ${t.expected} debe responder 200`).toBe(200);
        await page.locator('#modal-close').click();
      }
    }
  });

  test('los 3 hubs enlazan las 11 experiencias a sus SILOs sin enlaces a #experiencias', async ({ page, request }) => {
    for (const h of HUB_CASES) {
      await page.goto(BASE + h.hub, { waitUntil: 'domcontentloaded' });
      const data = await page.evaluate(() => {
        const cardHrefs = Array.from(document.querySelectorAll('.post-content a[href]'))
          .filter((a) => a.querySelector('.glass-card'))
          .map((a) => new URL(a.href, window.location.href).pathname);
        const ldText = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent || '').join('\n');
        return { cardHrefs, ldText };
      });
      expect(data.cardHrefs.length, `11 tarjetas de tour en ${h.hub}`).toBe(11);
      for (const u of h.urls) {
        expect(data.cardHrefs, `Falta tarjeta ${u} en ${h.hub}`).toContain(u);
        expect(data.ldText, `Falta URL ${u} en JSON-LD de ${h.hub}`).toContain(`https://paraisolaguna.com${u}`);
        const res = await request.get(BASE + u);
        expect(res.status()).toBe(200);
      }
      expect(data.ldText).not.toContain('#experiencias');
    }
  });
});
