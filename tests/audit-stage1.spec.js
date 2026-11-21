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

async function installGtagSpy(page) {
  await page.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
  );
  await page.addInitScript(() => {
    window.open = () => null;
    window.addEventListener('click', (e) => {
      const a = e.target && e.target.closest
        ? e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]')
        : null;
      if (a) e.preventDefault();
    });
  });
}

async function getWhatsappClickEvents(page) {
  return page.evaluate(() =>
    [...(window.dataLayer || [])]
      .map((entry) => Array.from(entry || []))
      .filter((c) => c[0] === 'event' && c[1] === 'whatsapp_click')
  );
}

test.describe('Etapa 1 · Auditoria Critica P0', () => {
  test('todos los enlaces internos en las 36 paginas del sitemap devuelven HTTP 200', async ({ page, request }) => {
    const routes = getSitemapRoutes();
    expect(routes.length).toBe(36);

    const internalTargets = new Set(routes);
    for (const route of routes) {
      await ir(page, route);
      const hrefs = await page.$$eval('a[href]', (els) => els.map((a) => a.getAttribute('href') || ''));
      for (const raw of hrefs) {
        if (!raw || raw.startsWith('#')) continue;
        const lower = raw.toLowerCase();
        if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('javascript:')) continue;
        let urlObj;
        try {
          urlObj = new URL(raw, BASE + route);
        } catch {
          continue;
        }
        if (urlObj.origin !== BASE && urlObj.origin !== 'https://paraisolaguna.com') continue;
        internalTargets.add(urlObj.pathname);
      }
    }

    const failures = [];
    for (const targetPath of internalTargets) {
      const res = await request.get(BASE + targetPath);
      if (res.status() !== 200) {
        failures.push(`${targetPath} -> ${res.status()}`);
      }
    }
    expect(failures).toEqual([]);
  });

  test('GA4 registra whatsapp_click una sola vez por clic en hero, tour y blog', async ({ page }) => {
    await installGtagSpy(page);

    // 1. Hero CTA en /
    await ir(page, '/');
    await page.locator('#hero-btn-primary').click();
    let calls = await getWhatsappClickEvents(page);
    expect(calls.length).toBe(1);
    expect(calls[0][2]).toMatchObject({
      source_section: 'hero_cta',
      language: 'es',
    });

    // 2. Tour hero CTA + burbuja flotante en /bioluminiscencia-oaxaca/
    await ir(page, '/bioluminiscencia-oaxaca/');
    await page.locator('.tour-hero a[href*="wa.me"]').click();
    calls = await getWhatsappClickEvents(page);
    expect(calls.length).toBe(1);
    expect(calls[0][2]).toMatchObject({
      tour_name: 'Bioluminiscencia',
      source_section: 'tour_hero_cta',
      language: 'es',
    });

    await page.locator('#wa-chat-bubble').click();
    calls = await getWhatsappClickEvents(page);
    expect(calls.length).toBe(2);
    expect(calls[1][2]).toMatchObject({
      tour_name: 'Bioluminiscencia',
      source_section: 'floating_bubble',
      language: 'es',
    });

    // 3. Blog inline CTA waQuickChat
    await ir(page, '/blog/guia-bioluminiscencia-manialtepec.html');
    await page.locator('button[onclick*="waQuickChat"]').first().click();
    calls = await getWhatsappClickEvents(page);
    expect(calls.length).toBe(1);
    expect(calls[0][2]).toMatchObject({
      tour_name: 'Bioluminiscencia',
      source_section: 'page_content_cta',
      language: 'es',
    });
  });

  test('GA4 registra whatsapp_click desde el sticky CTA movil (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await installGtagSpy(page);
    await ir(page, '/');
    await page.evaluate(() => window.scrollTo(0, 500));
    const sticky = page.locator('.mobile-sticky-cta');
    await expect(sticky).toBeVisible();
    await sticky.click();
    const calls = await getWhatsappClickEvents(page);
    expect(calls.length).toBe(1);
    expect(calls[0][2]).toMatchObject({
      source_section: 'mobile_sticky_cta',
      language: 'es',
    });
  });

  test('el modal de Chacahua en espanol muestra duracion de 6 Horas', async ({ page }) => {
    await ir(page, '/');
    const detailsLink = page.locator('#tour-card-chacahua .exp-details-link');
    await detailsLink.scrollIntoViewIfNeeded();
    await detailsLink.click();
    await expect(page.locator('#modal-tour-duration')).toHaveText('6 Horas');
  });

  test('contraste WCAG AA >= 4.5:1 en elementos corregidos y hero visible sin retraso', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    const measureContrast = async (selector) => {
      return page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return { found: false };
        const parseRgba = (str) => {
          const m = str.match(/rgba?\(([^)]+)\)/i);
          if (!m) return null;
          const p = m[1].split(',').map((s) => parseFloat(s.trim()));
          return [p[0], p[1], p[2], p.length === 4 ? p[3] : 1];
        };
        const blend = (top, bottom) => {
          const a = top[3];
          return [
            top[0] * a + bottom[0] * (1 - a),
            top[1] * a + bottom[1] * (1 - a),
            top[2] * a + bottom[2] * (1 - a),
            1,
          ];
        };
        const lum = ([r, g, b]) => {
          const ch = [r, g, b].map((v) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
        };

        const fg = parseRgba(getComputedStyle(el).color);
        const layers = [];
        let cur = el;
        while (cur && cur.nodeType === 1) {
          const bg = parseRgba(getComputedStyle(cur).backgroundColor);
          if (bg && bg[3] > 0) layers.push(bg);
          cur = cur.parentElement;
        }
        let bg = [245, 249, 250, 1];
        for (let i = layers.length - 1; i >= 0; i--) {
          bg = blend(layers[i], bg);
        }
        const fgBlended = fg[3] < 1 ? blend(fg, bg) : fg;
        const l1 = lum(fgBlended);
        const l2 = lum(bg);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        return { found: true, ratio, fg: fgBlended, bg };
      }, selector);
    };

    await ir(page, '/');
    const opacities = await page.evaluate(() =>
      ['.hero-coords', '#hero-main-title', '.hero-lead', '.hero-trust-line'].map((s) =>
        parseFloat(getComputedStyle(document.querySelector(s)).opacity)
      )
    );
    expect(opacities).toEqual([1, 1, 1, 1]);

    const bookingH3 = await measureContrast('.booking-box h3');
    expect(bookingH3.found).toBe(true);
    expect(bookingH3.ratio).toBeGreaterThanOrEqual(4.5);

    const widgetBtnDesktop = await measureContrast('button.hero-live-widget-action');
    expect(widgetBtnDesktop.found).toBe(true);
    expect(widgetBtnDesktop.ratio).toBeGreaterThanOrEqual(4.5);

    await page.setViewportSize({ width: 390, height: 844 });
    const widgetBtnMobile = await measureContrast('button.hero-live-widget-action');
    expect(widgetBtnMobile.found).toBe(true);
    expect(widgetBtnMobile.ratio).toBeGreaterThanOrEqual(4.5);

    await ir(page, '/blog/');
    const blogH1 = await measureContrast('.blog-page-hero h1');
    expect(blogH1.found).toBe(true);
    expect(blogH1.ratio).toBeGreaterThanOrEqual(4.5);

    const blogCardTitle = await measureContrast('.blog-card-title');
    expect(blogCardTitle.found).toBe(true);
    expect(blogCardTitle.ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('filtros de galeria en movil (390px) hacen wrap completo sin recorte', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ir(page, '/');
    const filterGroups = page.locator('.gallery-filters');
    const groupCount = await filterGroups.count();
    expect(groupCount).toBeGreaterThan(0);
    for (let i = 0; i < groupCount; i++) {
      await filterGroups.nth(i).scrollIntoViewIfNeeded();
      const rects = await filterGroups.nth(i).locator('.filter-btn').evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { text: el.textContent.trim(), left: r.left, right: r.right, width: r.width, height: r.height };
        })
      );
      expect(rects.length).toBeGreaterThan(0);
      for (const r of rects) {
        expect(r.width).toBeGreaterThan(0);
        expect(r.height).toBeGreaterThan(0);
        expect(r.left).toBeGreaterThanOrEqual(0);
        expect(r.right).toBeLessThanOrEqual(390);
      }
    }
  });

  test('iframes de Google Maps estan localizados por idioma y tienen dimensiones validas', async ({ page }) => {
    const cases = [
      { route: '/', hl: 'hl=es', expectedTitle: 'Ubicación Paraíso Laguna' },
      { route: '/en/', hl: 'hl=en', expectedTitle: 'Paraíso Laguna Location on Google Maps' },
      { route: '/fr/', hl: 'hl=fr', expectedTitle: 'Localisation Paraíso Laguna sur Google Maps' },
    ];
    for (const c of cases) {
      await ir(page, c.route);
      const iframe = page.locator('iframe[src*="maps.google.com/maps"]');
      await expect(iframe).toHaveCount(1);
      await expect(iframe).toHaveAttribute('src', new RegExp(c.hl));
      await expect(iframe).toHaveAttribute('title', c.expectedTitle);
      await expect(iframe).toHaveAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      const box = await iframe.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(200);
    }
  });

  test('hero de paseo-caballo carga imagen y widget lunar en frances se calcula', async ({ page }) => {
    await ir(page, '/paseo-caballo-puerto-escondido/');
    await expect
      .poll(() =>
        page.evaluate(() => {
          const img = document.querySelector('.tour-hero-media img');
          return Boolean(img && img.complete && img.naturalWidth > 0);
        })
      )
      .toBe(true);

    await ir(page, '/fr/');
    const moon = (await page.locator('#moon-phase').innerText()).trim();
    const glow = (await page.locator('#glow-potential').innerText()).trim();
    expect(moon).not.toBe('—');
    expect(moon.length).toBeGreaterThan(0);
    expect(glow).not.toBe('—');
    expect(glow.length).toBeGreaterThan(0);
  });

  test('.htaccess incluye endurecimiento de seguridad y redireccion canonica', async () => {
    const htaccess = fs.readFileSync(path.join(ROOT_DIR, '.htaccess'), 'utf8');
    expect(htaccess).toContain('www\\.paraisolaguna\\.com');
    expect(htaccess).toContain('\\.git');
    expect(htaccess).toContain('\\.md');
    expect(htaccess).toContain('Strict-Transport-Security');
    expect(htaccess).toContain('X-Content-Type-Options');
  });
});
