// Suite de verificación UI — Paraíso Laguna
// Ejecutar con: npx playwright test (requiere @playwright/test y un servidor
// estático sirviendo la raíz del proyecto en http://localhost:3000)

const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const viewports = [
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'mobile', width: 375, height: 667 },
];

for (const vp of viewports) {
    test.describe(`Viewport ${vp.name}`, () => {
        test.use({ viewport: { width: vp.width, height: vp.height } });

        test('carga el hero con CTA de reserva', async ({ page }) => {
            await page.goto(BASE);
            await expect(page.locator('h1')).toBeVisible();
            await expect(page.locator('#hero-cta')).toHaveAttribute('href', /wa\.me\/529541611334/);
        });

        test('las 10 secciones obligatorias existen', async ({ page }) => {
            await page.goto(BASE);
            for (const id of ['inicio', 'monitoreo', 'experiencias', 'paquetes', 'tours', 'galeria', 'testimonios', 'nosotros', 'faq', 'reservar']) {
                await expect(page.locator(`#${id}`)).toHaveCount(1);
            }
        });

        test('muestra los 11 tours en el catálogo', async ({ page }) => {
            await page.goto(BASE);
            await expect(page.locator('#tours .tours-index li')).toHaveCount(11);
        });

        test('el acordeón de FAQ abre y cierra', async ({ page }) => {
            await page.goto(BASE);
            const q = page.locator('.faq-q').first();
            await q.scrollIntoViewIfNeeded();
            await q.click();
            await expect(q).toHaveAttribute('aria-expanded', 'true');
            await q.click();
            await expect(q).toHaveAttribute('aria-expanded', 'false');
        });

        test('el lightbox de galería abre y cierra', async ({ page }) => {
            await page.goto(BASE);
            const item = page.locator('.gallery-item').first();
            await item.scrollIntoViewIfNeeded();
            await item.click();
            await expect(page.locator('#lightbox')).toBeVisible();
            await page.locator('#lightbox-close').click();
            await expect(page.locator('#lightbox')).toBeHidden();
        });

        test('el formulario genera un enlace de WhatsApp', async ({ page, context }) => {
            await page.goto(BASE);
            await page.fill('#f-name', 'Prueba QA');
            await page.selectOption('#f-tour', { index: 1 });
            await page.fill('#f-date', '2027-01-15');
            const popupPromise = context.waitForEvent('page');
            await page.locator('#booking-form button[type="submit"]').click();
            const popup = await popupPromise;
            expect(popup.url()).toContain('api.whatsapp.com/send?phone=529541611334');
        });

        test('sin errores de consola al cargar', async ({ page }) => {
            const errors = [];
            page.on('pageerror', (err) => errors.push(err.message));
            await page.goto(BASE);
            await page.waitForLoadState('networkidle');
            expect(errors).toEqual([]);
        });
    });
}
