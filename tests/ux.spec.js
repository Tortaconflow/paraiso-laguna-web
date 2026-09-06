// Suite de regresion de UX — Paraiso Laguna v2.7
// Cada bloque fija uno de los defectos verificados en la auditoria, para que
// no puedan volver a aparecer sin que la suite lo detecte.

const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3100';

const HOMES = ['/', '/en/', '/fr/'];

// Las portadas incrustan un mapa de Google. Esperar al evento "load" ata cada
// prueba a la disponibilidad de un tercero; con el DOM listo basta para todo lo
// que verificamos aqui, que es comportamiento propio del sitio.
async function ir(page, ruta) {
    await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' });
}

const PAGINAS_INTERNAS = [
    '/bioluminiscencia-oaxaca/',
    '/liberacion-tortugas-oaxaca/',
    '/avistamiento-delfines-oaxaca/',
    '/paseo-caballo-puerto-escondido/',
    '/kayak-manglares-manialtepec/',
    '/tour-chacahua/',
    '/puerto-escondido-tours/',
    '/blog/',
    '/blog/guia-bioluminiscencia-manialtepec.html',
    '/en/bioluminescence-tour-oaxaca/',
    '/en/puerto-escondido-tours/',
    '/en/blog/',
    '/fr/bioluminescence-oaxaca/',
    '/fr/puerto-escondido-excursions/',
    '/fr/blog/'
];

// ---------------------------------------------------------------------------
// C1 (CRITICO) · El boton de menu quedaba 80 px fuera de la pantalla, con
// ancho 0, en las 30 paginas que llevan el nombre de marca en el header.
// ---------------------------------------------------------------------------
test.describe('C1 · Navegacion movil alcanzable', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    for (const ruta of PAGINAS_INTERNAS) {
        test(`el boton de menu es visible y tocable en ${ruta}`, async ({ page }) => {
            await ir(page, ruta);
            const burger = page.locator('#hamburger-btn');
            await expect(burger).toBeVisible();

            const caja = await burger.boundingBox();
            expect(caja).not.toBeNull();
            // Dentro del viewport
            expect(caja.x).toBeGreaterThanOrEqual(0);
            expect(caja.x + caja.width).toBeLessThanOrEqual(390);
            // Objetivo tactil minimo WCAG 2.2 AA (2.5.8): 24x24. Aqui exigimos 44.
            expect(caja.width).toBeGreaterThanOrEqual(44);
            expect(caja.height).toBeGreaterThanOrEqual(44);

            // El header no debe desbordar horizontalmente
            const desborde = await page.evaluate(() => {
                const h = document.getElementById('main-header');
                return h.scrollWidth - document.documentElement.clientWidth;
            });
            expect(desborde).toBeLessThanOrEqual(0);
        });
    }

    test('el menu abre, anuncia su estado y cierra con Escape', async ({ page }) => {
        await ir(page, '/bioluminiscencia-oaxaca/');
        const burger = page.locator('#hamburger-btn');
        const drawer = page.locator('#mobile-drawer');

        await expect(burger).toHaveAttribute('aria-expanded', 'false');
        await burger.click();
        await expect(drawer).toHaveClass(/active/);
        await expect(burger).toHaveAttribute('aria-expanded', 'true');

        await page.keyboard.press('Escape');
        await expect(drawer).not.toHaveClass(/active/);
        await expect(burger).toHaveAttribute('aria-expanded', 'false');
        await expect(burger).toBeFocused();
    });
});

// ---------------------------------------------------------------------------
// A1 · calculateMoonData no existia: elegir fecha lanzaba ReferenceError y la
// prevision lunar nunca aparecia.
// ---------------------------------------------------------------------------
test.describe('A1 · Predictor lunar por fecha', () => {
    for (const home of HOMES) {
        test(`la prevision se calcula sin errores en ${home}`, async ({ page }) => {
            const errores = [];
            page.on('pageerror', (e) => errores.push(e.message));
            await ir(page, home);
            await page.locator('#booking-date').scrollIntoViewIfNeeded();
            await page.selectOption('#booking-experience', 'Tour Bioluminiscencia');
            await page.fill('#booking-date', '2027-01-18');

            const preview = page.locator('#booking-moon-preview');
            await expect(preview).toHaveClass(/active/);
            await expect(preview).not.toBeEmpty();
            await expect(preview.locator('.moon-preview-badge')).toBeVisible();
            expect(errores).toEqual([]);
        });
    }

    test('la fase mostrada coincide con la del widget del hero para hoy', async ({ page }) => {
        await ir(page, '/');
        const hoy = await page.evaluate(() => {
            const n = new Date();
            return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        });
        const faseWidget = (await page.locator('#moon-phase').innerText()).trim();
        await page.locator('#booking-date').scrollIntoViewIfNeeded();
        await page.selectOption('#booking-experience', 'Tour Bioluminiscencia');
        await page.fill('#booking-date', hoy);
        await expect(page.locator('#booking-moon-preview')).toContainText(faseWidget);
    });

    test('el campo de fecha no acepta dias pasados', async ({ page }) => {
        await ir(page, '/');
        const min = await page.locator('#booking-date').getAttribute('min');
        expect(min).toBeTruthy();
        const hoy = await page.evaluate(() => {
            const n = new Date();
            return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        });
        expect(min).toBe(hoy);
    });
});

// ---------------------------------------------------------------------------
// A2 · Fuera de las 3 portadas no habia ningun punto de contacto persistente
// en movil durante la mayor parte del recorrido.
// ---------------------------------------------------------------------------
test.describe('A2 · Contacto persistente en movil', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    for (const ruta of PAGINAS_INTERNAS) {
        test(`${ruta} mantiene el CTA de WhatsApp al final del scroll`, async ({ page }) => {
            await ir(page, ruta);
            const cta = page.locator('.mobile-sticky-cta');
            await expect(cta).toBeVisible();
            await expect(cta).toHaveAttribute('href', /wa\.me\/529541611334/);

            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await expect(cta).toBeVisible();

            const caja = await cta.boundingBox();
            expect(caja.height).toBeGreaterThanOrEqual(44);
        });
    }

    test('el CTA de las paginas en ingles y frances usa su idioma', async ({ page }) => {
        await ir(page, '/en/bioluminescence-tour-oaxaca/');
        await expect(page.locator('.mobile-sticky-cta')).toContainText('Book on WhatsApp');
        await ir(page, '/fr/bioluminescence-oaxaca/');
        await expect(page.locator('.mobile-sticky-cta')).toContainText('Réserver sur WhatsApp');
    });
});

// ---------------------------------------------------------------------------
// A3 · Los chips del asistente pasaban nombres con emoji que no coincidian con
// ninguna opcion: el <select> quedaba vacio y se perdia la intencion.
// ---------------------------------------------------------------------------
test.describe('A3 · Los chips trasladan la eleccion al formulario', () => {
    for (const home of HOMES) {
        test(`los 5 chips preseleccionan una experiencia en ${home}`, async ({ page }) => {
            await ir(page, home);
            const etiquetas = await page.$$eval('.wa-chat-chip',
                els => els.map(e => e.getAttribute('onclick').match(/'([^']+)'/)[1]));
            expect(etiquetas.length).toBe(5);

            for (const etiqueta of etiquetas) {
                const valor = await page.evaluate((n) => {
                    const s = document.getElementById('booking-experience');
                    s.value = '';
                    window.selectTourAndScroll(n);
                    return s.value;
                }, etiqueta);
                expect(valor, `el chip "${etiqueta}" no encontro experiencia`).not.toBe('');
            }
        });
    }

    test('un nombre desconocido conserva la eleccion previa', async ({ page }) => {
        await ir(page, '/');
        const valor = await page.evaluate(() => {
            const s = document.getElementById('booking-experience');
            s.value = 'Tour Chacahua';
            window.selectTourAndScroll('Nombre que no existe ZZZ');
            return s.value;
        });
        expect(valor).toBe('Tour Chacahua');
    });

    test('la preseleccion se confirma en pantalla', async ({ page }) => {
        await ir(page, '/');
        await page.evaluate(() => window.selectTourAndScroll('Tour Chacahua'));
        await expect(page.locator('#booking-selection-note')).toContainText('Chacahua');
    });
});

// ---------------------------------------------------------------------------
// Q2 · 18 controles eran <div onclick> sin foco ni semantica.
// ---------------------------------------------------------------------------
test.describe('Q2 · Operables con teclado', () => {
    test('tarjetas de expedicion, fotos y chips reciben foco y rol', async ({ page }) => {
        await ir(page, '/');
        for (const sel of ['.sec-exp-card', '.gallery-item', '.wa-chat-chip']) {
            const els = page.locator(sel);
            const n = await els.count();
            expect(n).toBeGreaterThan(0);
            for (let i = 0; i < n; i++) {
                await expect(els.nth(i)).toHaveAttribute('role', 'button');
                await expect(els.nth(i)).toHaveAttribute('tabindex', '0');
            }
        }
    });

    test('una tarjeta de expedicion se abre con Enter', async ({ page }) => {
        await ir(page, '/');
        const card = page.locator('.sec-exp-card').first();
        await card.scrollIntoViewIfNeeded();
        await card.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#tour-modal')).toHaveClass(/active/);
    });

    test('el modal de tour cierra con Escape y devuelve el foco', async ({ page }) => {
        await ir(page, '/');
        const card = page.locator('.sec-exp-card').first();
        await card.scrollIntoViewIfNeeded();
        await card.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#tour-modal')).toHaveClass(/active/);
        await expect(page.locator('#modal-close')).toBeFocused();

        await page.keyboard.press('Escape');
        await expect(page.locator('#tour-modal')).not.toHaveClass(/active/);
        await expect(card).toBeFocused();
    });

    test('el acordeon de FAQ expone su estado', async ({ page }) => {
        await ir(page, '/');
        const q = page.locator('.faq-question').first();
        await q.scrollIntoViewIfNeeded();
        await expect(q).toHaveAttribute('aria-expanded', 'false');
        await q.click();
        await expect(q).toHaveAttribute('aria-expanded', 'true');
        await q.click();
        await expect(q).toHaveAttribute('aria-expanded', 'false');
    });

    test('la accion del widget del hero es un boton alcanzable', async ({ page }) => {
        await ir(page, '/');
        const btn = page.locator('button.hero-live-widget-action');
        await expect(btn).toBeVisible();
        const anidado = await btn.evaluate(el => !!el.closest('a'));
        expect(anidado).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Q3 · Controles que simulaban funcionar.
// ---------------------------------------------------------------------------
test.describe('Q3 · Sin controles ni datos simulados', () => {
    test('ninguna pagina conserva el boletin que solo mostraba un alert', async ({ page }) => {
        for (const ruta of ['/', '/en/', '/fr/', '/bioluminiscencia-oaxaca/', '/blog/']) {
            await ir(page, ruta);
            await expect(page.locator('.newsletter-form')).toHaveCount(0);
            await expect(page.locator('.footer-follow a')).toHaveCount(2);
        }
    });

    test('el widget en vivo solo muestra datos que se calculan', async ({ page }) => {
        await ir(page, '/');
        const filas = await page.$$eval('.hero-live-widget-list li', els => els.map(e => e.innerText));
        expect(filas.length).toBe(2);
        expect(filas.join(' ')).not.toContain('28.2');
    });

    // Nota: los articulos en espanol sobrescriben waQuickChat con un script en
    // linea propio, asi que su CTA ya abria WhatsApp. Lo que se fija aqui es el
    // respaldo de app.js para cualquier pagina sin ese script: antes no hacia
    // absolutamente nada porque no existen ni #booking-experience ni #contacto.
    test('en una pagina sin formulario, el respaldo abre WhatsApp', async ({ page, context }) => {
        await ir(page, '/en/blog/');
        const popup = context.waitForEvent('page');
        await page.evaluate(() => {
            delete window.waQuickChat;
            window.selectTourAndScroll('Bioluminescence');
        });
        const abierta = await popup;
        await expect(abierta).toHaveURL(/whatsapp\.com\/send\/?\?phone=529541611334/);
    });
});

// ---------------------------------------------------------------------------
// Q1 · Contraste de los enlaces de accion y etiquetas de campo.
// ---------------------------------------------------------------------------
test.describe('Q1 · Contraste AA en texto de accion', () => {
    test('los enlaces y etiquetas alcanzan 4.5:1 sobre su fondo', async ({ page }) => {
        await ir(page, '/');
        const resultados = await page.evaluate(() => {
            const lum = (c) => {
                const [r, g, b] = c.map(v => {
                    v /= 255;
                    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
                });
                return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            };
            const parse = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
            const ratio = (fg, bg) => {
                const a = Math.max(lum(fg), lum(bg)), b = Math.min(lum(fg), lum(bg));
                return (a + 0.05) / (b + 0.05);
            };
            const fondo = (el) => {
                let e = el;
                while (e && e !== document.documentElement) {
                    const bg = getComputedStyle(e).backgroundColor;
                    const alpha = bg.match(/rgba?\([^)]*,\s*([\d.]+)\)/);
                    const p = parse(bg);
                    if (p.length === 3 && (!alpha || parseFloat(alpha[1]) > 0.85)) return p;
                    e = e.parentElement;
                }
                return [255, 255, 255];
            };
            return ['.exp-link', '.exp-details-link', '.sec-card-more', '.form-group label', '.sec-card-tag']
                .map(sel => {
                    const el = document.querySelector(sel);
                    if (!el) return null;
                    return { sel, ratio: +ratio(parse(getComputedStyle(el).color), fondo(el)).toFixed(2) };
                }).filter(Boolean);
        });

        expect(resultados.length).toBeGreaterThan(0);
        for (const r of resultados) {
            expect(r.ratio, `${r.sel} tiene ${r.ratio}:1`).toBeGreaterThanOrEqual(4.5);
        }
    });
});

// ---------------------------------------------------------------------------
// Filtro de experiencias: coherencia y salida clara.
// ---------------------------------------------------------------------------
test.describe('Filtro de experiencias', () => {
    test('informa cuantas quedan y permite volver a verlas todas', async ({ page }) => {
        await ir(page, '/');
        await page.locator('#exp-category-filters').scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: /Vida Silvestre/ }).click();

        const estado = page.locator('#exp-filter-status');
        await expect(estado).toBeVisible();
        await expect(estado).toContainText('2');

        // Las expediciones de dia completo no deben seguir visibles bajo filtro
        await expect(page.locator('#secondary-tours-wrapper')).toBeHidden();

        await estado.locator('button').click();
        await expect(estado).toBeHidden();
        await expect(page.locator('#secondary-tours-wrapper')).toBeVisible();
    });
});

// ---------------------------------------------------------------------------
// Integridad: la consola debe seguir limpia en todos los idiomas.
// ---------------------------------------------------------------------------
test.describe('Sin errores nuevos en consola', () => {
    for (const ruta of ['/', '/en/', '/fr/', '/bioluminiscencia-oaxaca/', '/puerto-escondido-tours/', '/blog/']) {
        test(`consola limpia en ${ruta}`, async ({ page }) => {
            const errores = [];
            // Excepciones de JavaScript: siempre son responsabilidad del sitio.
            page.on('pageerror', (e) => errores.push('pageerror: ' + e.message));

            // Mensajes de consola: se ignoran los fallos de recursos de
            // terceros (fuentes y mapa de Google), que dependen de la red del
            // entorno de pruebas y no del codigo del proyecto.
            page.on('console', (m) => {
                if (m.type() !== 'error') return;
                const texto = m.text();
                const externo = /Failed to load resource/.test(texto) &&
                    !/127\.0\.0\.1:3100|localhost:3100/.test(texto + ' ' + (m.location()?.url || ''));
                if (!externo) errores.push(texto);
            });

            // Peticiones a nuestro propio servidor: ninguna debe fallar.
            const rotos = [];
            page.on('response', (r) => {
                const u = r.url();
                if (/127\.0\.0\.1:3100|localhost:3100/.test(u) && r.status() >= 400) {
                    rotos.push(r.status() + ' ' + u);
                }
            });

            await ir(page, ruta);
            await page.waitForLoadState('networkidle');
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(400);

            expect(errores, 'errores de consola propios').toEqual([]);
            expect(rotos, 'recursos propios rotos').toEqual([]);
        });
    }
});

// ---------------------------------------------------------------------------
// Cache y carga de scripts.
// styles.css y app.js cambiaron, pero las paginas seguian pidiendo ?v=10, asi
// que un visitante recurrente habria seguido viendo la version antigua. Tres
// paginas del blog ni siquiera llevaban parametro de version.
// Ademas blog/liberacion-tortugas-puerto-escondido.html invocaba
// toggleMobileMenu() sin cargar nunca app.js: su boton de menu no hacia nada.
// ---------------------------------------------------------------------------
const TODAS_LAS_PAGINAS = ['/'].concat(HOMES.slice(1)).concat(PAGINAS_INTERNAS).concat([
    '/blog/liberacion-tortugas-puerto-escondido.html',
    '/en/blog/manialtepec-bioluminescence-guide.html',
    '/fr/blog/liberation-tortues-puerto-escondido.html'
]);

test.describe('Cache y carga de scripts', () => {
    for (const ruta of TODAS_LAS_PAGINAS) {
        test(`${ruta} carga hoja de estilos y script con version`, async ({ page }) => {
            await ir(page, ruta);

            const css = await page.getAttribute('link[rel="stylesheet"][href*="styles.css"]', 'href');
            expect(css, 'falta la hoja de estilos').toBeTruthy();
            expect(css, `sin parametro de version: ${css}`).toMatch(/styles\.css\?v=\d+/);

            const js = await page.getAttribute('script[src*="app.js"]', 'src');
            expect(js, 'la pagina no carga app.js').toBeTruthy();
            expect(js, `sin parametro de version: ${js}`).toMatch(/app\.js\?v=\d+/);
        });
    }

    test('el boton de menu funciona en el articulo de tortugas', async ({ page }) => {
        // Esta pagina no cargaba app.js: toggleMobileMenu no existia.
        await ir(page, '/blog/liberacion-tortugas-puerto-escondido.html');
        const definida = await page.evaluate(() => typeof window.toggleMobileMenu === 'function');
        expect(definida, 'toggleMobileMenu no esta definida').toBe(true);

        await page.setViewportSize({ width: 390, height: 844 });
        const burger = page.locator('#hamburger-btn');
        await expect(burger).toBeVisible();
        await burger.click();
        await expect(page.locator('#mobile-drawer')).toHaveClass(/active/);
    });
});

// ---------------------------------------------------------------------------
// Siete paginas mostraban el boton de menu sin que existiera ningun cajon que
// abrir: el boton era decorativo. En movil esas paginas no tenian navegacion
// alguna, porque el <nav> horizontal se oculta por debajo de 768 px.
// ---------------------------------------------------------------------------
test.describe('El boton de menu abre un menu real', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    for (const ruta of TODAS_LAS_PAGINAS) {
        test(`${ruta} tiene menu movil operativo`, async ({ page }) => {
            await ir(page, ruta);

            const burger = page.locator('#hamburger-btn');
            await expect(burger).toBeVisible();

            const drawer = page.locator('#mobile-drawer');
            await expect(drawer, 'el boton existe pero no hay cajon que abrir').toHaveCount(1);

            await burger.click();
            await expect(drawer).toHaveClass(/active/);

            // El menu debe llevar a alguna parte
            const enlaces = await drawer.locator('.drawer-nav a[href]').count();
            expect(enlaces).toBeGreaterThan(0);

            await page.keyboard.press('Escape');
            await expect(drawer).not.toHaveClass(/active/);
        });
    }
});
