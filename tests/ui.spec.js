// Suite de verificación UI — Paraíso Laguna
// Ejecutar con: npx playwright test

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
            await expect(page.locator('#hero-btn-primary')).toHaveAttribute('href', /wa\.me\/529541611334/);
        });

        test('el widget de la laguna calcula la fase lunar real', async ({ page }) => {
            await page.goto(BASE);
            await expect(page.locator('#moon-phase')).not.toHaveText('—');
            await expect(page.locator('#glow-potential')).not.toHaveText('—');
        });

        test('las 8 secciones del arco Dream-Discover-Trust-Book existen', async ({ page }) => {
            await page.goto(BASE);
            for (const id of ['inicio', 'experiencias', 'paquetes', 'galeria', 'nosotros', 'testimonios', 'faqs', 'contacto']) {
                await expect(page.locator(`#${id}`)).toHaveCount(1);
            }
        });

        test('muestra los 11 tours entre tarjetas principales y secundarias', async ({ page }) => {
            await page.goto(BASE);
            const principales = page.locator('#grid-tours-wrapper .exp-card');
            const secundarias = page.locator('#secondary-tours-wrapper .sec-exp-card');
            await expect(principales).toHaveCount(6);
            await expect(secundarias).toHaveCount(5);
        });

        test('el acordeón de FAQ abre y cierra', async ({ page }) => {
            await page.goto(BASE);
            const item = page.locator('.faq-item').first();
            const q = item.locator('.faq-question');
            await q.scrollIntoViewIfNeeded();
            await q.click();
            await expect(item).toHaveClass(/active/);
            await q.click();
            await expect(item).not.toHaveClass(/active/);
        });

        test('el lightbox de galería abre y cierra', async ({ page }) => {
            await page.goto(BASE);
            const item = page.locator('.gallery-item').first();
            await item.scrollIntoViewIfNeeded();
            await item.click();
            await expect(page.locator('#lightbox-modal')).toBeVisible();
            await page.locator('.lightbox-close').click();
            await expect(page.locator('#lightbox-modal')).toBeHidden();
        });

        test('el formulario genera un enlace de WhatsApp', async ({ page, context }) => {
            await page.goto(BASE);
            await page.locator('#booking-name').scrollIntoViewIfNeeded();
            await page.fill('#booking-name', 'Prueba QA');
            await page.selectOption('#booking-experience', { index: 1 });
            await page.fill('#booking-date', '2027-01-15');
            const popupPromise = context.waitForEvent('page');
            await page.locator('#whatsapp-booking-form button[type="submit"]').click();
            const popup = await popupPromise;
            await expect(popup).toHaveURL(/api\.whatsapp\.com\/send\?phone=529541611334/);
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

test.describe('Conversión móvil (barra sticky)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('la barra sticky de WhatsApp es visible y la burbuja flotante no', async ({ page }) => {
        await page.goto(BASE);
        await expect(page.locator('.mobile-sticky-cta')).toBeVisible();
        await expect(page.locator('.wa-widget-container')).toBeHidden();
    });
});

test.describe('Conversión desktop (burbuja flotante)', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('la burbuja de WhatsApp es visible y la barra sticky no', async ({ page }) => {
        await page.goto(BASE);
        await expect(page.locator('.wa-widget-container')).toBeVisible();
        await expect(page.locator('.mobile-sticky-cta')).toBeHidden();
    });
});
