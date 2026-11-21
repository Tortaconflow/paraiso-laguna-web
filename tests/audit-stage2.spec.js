// @ts-check
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3100';
const ROOT_DIR = path.resolve(__dirname, '..');

function getSitemapRoutes() {
  const xml = fs.readFileSync(path.join(ROOT_DIR, 'sitemap.xml'), 'utf8');
  const matches = [...xml.matchAll(/<loc>https:\/\/paraisolaguna\.com([^<]*)<\/loc>/g)];
  return matches.map((m) => m[1] || '/');
}

async function ir(page, ruta) {
  await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' });
}

test.describe('Etapa 2 · i18n, SEO, Schema, OG y Paginas Legales', () => {
  test('paginas legales de privacidad en ES/EN/FR responden 200, con hreflang y menu movil operativo', async ({ page }) => {
    const pages = [
      { route: '/aviso-de-privacidad/', lang: 'es-MX', canonical: 'https://paraisolaguna.com/aviso-de-privacidad/' },
      { route: '/en/privacy-policy/', lang: 'en', canonical: 'https://paraisolaguna.com/en/privacy-policy/' },
      { route: '/fr/politique-confidentialite/', lang: 'fr', canonical: 'https://paraisolaguna.com/fr/politique-confidentialite/' },
    ];
    await page.setViewportSize({ width: 390, height: 844 });

    for (const p of pages) {
      const consoleErrors = [];
      const pageErrors = [];
      const onConsole = (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      };
      const onError = (err) => pageErrors.push(err.message);
      page.on('console', onConsole);
      page.on('pageerror', onError);

      const res = await page.goto(BASE + p.route, { waitUntil: 'domcontentloaded' });
      expect(res.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', p.lang);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', p.canonical);
      await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute('href', 'https://paraisolaguna.com/aviso-de-privacidad/');
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://paraisolaguna.com/en/privacy-policy/');
      await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute('href', 'https://paraisolaguna.com/fr/politique-confidentialite/');

      await page.locator('#hamburger-btn').click();
      await expect(page.locator('#mobile-drawer')).toHaveClass(/active/);
      await page.locator('#mobile-drawer .drawer-close-btn').click();
      await expect(page.locator('#mobile-drawer')).not.toHaveClass(/active/);

      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
      page.off('console', onConsole);
      page.off('pageerror', onError);
    }
  });

  test('/en/ y /fr/ traducen las 15 opciones de #booking-experience y la galeria GALLERY_PHOTOS', async ({ page }) => {
    const spanishLeaks = ['Bioluminiscencia', 'Avistamiento de Delfines', 'Cascadas Mágicas', 'Aguas Termales'];

    await ir(page, '/en/');
    const enOptions = await page.$$eval('#booking-experience option', (opts) => opts.map((o) => o.textContent.trim()));
    expect(enOptions.length).toBeGreaterThanOrEqual(16);
    for (const leak of spanishLeaks) {
      expect(enOptions.join(' | ')).not.toContain(leak);
    }
    const enGallery = await page.$$eval('#photos-grid-wrapper .gallery-item', (els) => els.map((e) => e.innerText.trim()));
    expect(enGallery.join(' | ')).toContain('The water answers with light');
    expect(enGallery.join(' | ')).not.toContain('El agua responde con luz');

    await page.evaluate(() => window.selectTourAndScroll('Tour Bioluminiscencia'));
    await expect(page.locator('#booking-selection-note')).toContainText('Manialtepec Bioluminescence');

    await ir(page, '/fr/');
    const frOptions = await page.$$eval('#booking-experience option', (opts) => opts.map((o) => o.textContent.trim()));
    expect(frOptions.length).toBeGreaterThanOrEqual(16);
    for (const leak of spanishLeaks) {
      expect(frOptions.join(' | ')).not.toContain(leak);
    }
    const frGallery = await page.$$eval('#photos-grid-wrapper .gallery-item', (els) => els.map((e) => e.innerText.trim()));
    expect(frGallery.join(' | ')).toContain("L'eau répond par la lumière");
    expect(frGallery.join(' | ')).not.toContain('El agua responde con luz');
  });

  test('hubs EN y FR estan completamente traducidos sin restos de espanol', async ({ page }) => {
    await ir(page, '/en/puerto-escondido-tours/');
    const enBody = await page.locator('body').innerText();
    expect(await page.locator('h1').innerText()).toContain('Tours in Puerto Escondido');
    expect(enBody).not.toContain('Experiencia Nocturna');
    expect(enBody).not.toContain('Armar Mi Itinerario');
    expect(enBody).not.toContain('Diseñamos eco-experiencias');
    expect(enBody).not.toContain('Socio CONANP');

    await ir(page, '/fr/puerto-escondido-excursions/');
    const frBody = await page.locator('body').innerText();
    expect(await page.locator('h1').innerText()).toContain('Excursions à Puerto Escondido');
    expect(frBody).not.toContain('Experiencia Nocturna');
    expect(frBody).not.toContain('Armar Mi Itinerario');
    expect(frBody).not.toContain('Diseñamos eco-experiencias');
    expect(frBody).not.toContain('Socio CONANP');
  });

  test('og-paraiso-laguna-1200x630.jpg se sirve 200 y portadas la referencian', async ({ page, request }) => {
    const imgRes = await request.get(BASE + '/assets/images/og-paraiso-laguna-1200x630.jpg');
    expect(imgRes.status()).toBe(200);

    for (const home of ['/', '/en/', '/fr/']) {
      await ir(page, home);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        'https://paraisolaguna.com/assets/images/og-paraiso-laguna-1200x630.jpg'
      );
    }
  });

  test('las 36 paginas del sitemap cumplen Schema JSON-LD valido, OG absolutas, Google Fonts, titulos <= 65 chars y enlace de privacidad', async ({ page, request }) => {
    const routes = getSitemapRoutes();
    expect(routes.length).toBe(36);

    for (const route of routes) {
      await ir(page, route);
      const data = await page.evaluate(() => {
        const title = document.title.trim();
        const ogImg = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
        const twImg = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '';
        const hasFonts = Boolean(document.querySelector('link[href*="fonts.googleapis.com"]'));
        const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent || '');
        const footerPrivacyLinks = Array.from(
          document.querySelectorAll('footer a[href*="aviso-de-privacidad"], footer a[href*="privacy-policy"], footer a[href*="politique-confidentialite"]')
        ).map((a) => a.getAttribute('href'));
        return { title, ogImg, twImg, hasFonts, jsonLdScripts, footerPrivacyLinks };
      });

      expect(data.title.length, `Titulo > 65 en ${route}: ${data.title}`).toBeLessThanOrEqual(65);
      expect(data.title, `Titulo con Precios/Prix/Rates en ${route}`).not.toMatch(/Precios|Prix|\bRates\b/i);
      expect(data.ogImg.startsWith('https://paraisolaguna.com/'), `og:image no absoluta en ${route}: ${data.ogImg}`).toBe(true);
      expect(data.twImg.startsWith('https://paraisolaguna.com/'), `twitter:image no absoluta en ${route}: ${data.twImg}`).toBe(true);
      expect(data.hasFonts, `Falta Google Fonts en ${route}`).toBe(true);
      expect(data.footerPrivacyLinks.length, `Falta enlace privacidad en footer de ${route}`).toBeGreaterThanOrEqual(1);

      const pRes = await request.get(BASE + data.footerPrivacyLinks[0]);
      expect(pRes.status()).toBe(200);

      for (const raw of data.jsonLdScripts) {
        expect(() => JSON.parse(raw), `JSON-LD invalido en ${route}`).not.toThrow();
        expect(raw, `@type Tour residual en ${route}`).not.toContain('"@type": "Tour"');
        expect(raw, `worstRating 5 en ${route}`).not.toContain('"worstRating": "5"');
      }
    }
  });

  test('el footer movil mantiene altura < 1200px en /, /en/ y /fr/ tras agregar enlace de privacidad', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const home of ['/', '/en/', '/fr/']) {
      await ir(page, home);
      const box = await page.locator('#main-footer').boundingBox();
      expect(box.height).toBeLessThan(1200);
    }
  });
});
