const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:3100';

test.describe('Internacionalización (i18n) y Switchers', () => {

    test('la página raíz en español tiene lang="es", canonical y hreflangs válidos', async ({ page }) => {
        await page.goto(BASE + '/');
        await expect(page.locator('html')).toHaveAttribute('lang', 'es');
        
        const canonical = page.locator('link[rel="canonical"]');
        await expect(canonical).toHaveAttribute('href', 'https://paraisolaguna.com/');
        
        const hreflangEs = page.locator('link[rel="alternate"][hreflang="es"]');
        const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"]');
        const hreflangFr = page.locator('link[rel="alternate"][hreflang="fr"]');
        
        await expect(hreflangEs).toHaveAttribute('href', 'https://paraisolaguna.com/');
        await expect(hreflangEn).toHaveAttribute('href', 'https://paraisolaguna.com/en/');
        await expect(hreflangFr).toHaveAttribute('href', 'https://paraisolaguna.com/fr/');
    });

    test('la página en inglés /en/ tiene lang="en", canonical y contenido traducido', async ({ page }) => {
        await page.goto(BASE + '/en/');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        
        const canonical = page.locator('link[rel="canonical"]');
        await expect(canonical).toHaveAttribute('href', 'https://paraisolaguna.com/en/');
        
        await expect(page.locator('#hero-main-title')).toContainText('There is a lagoon');
        await expect(page.locator('.lang-switcher .lang-btn.active')).toHaveText('EN');
    });

    test('la página en francés /fr/ tiene lang="fr", canonical y contenido traducido', async ({ page }) => {
        await page.goto(BASE + '/fr/');
        await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
        
        const canonical = page.locator('link[rel="canonical"]');
        await expect(canonical).toHaveAttribute('href', 'https://paraisolaguna.com/fr/');
        
        await expect(page.locator('#hero-main-title')).toContainText('Il y a une lagune');
        await expect(page.locator('.lang-switcher .lang-btn.active')).toHaveText('FR');
    });

    test('todas las 6 subpáginas en inglés y francés cargan correctamente sin 404', async ({ page }) => {
        const testUrls = [
            '/en/bioluminescence-tour-oaxaca/',
            '/en/turtle-release-puerto-escondido/',
            '/en/dolphin-whale-watching-puerto-escondido/',
            '/en/sunset-horseback-riding-puerto-escondido/',
            '/en/kayak-manialtepec-lagoon/',
            '/en/chacahua-national-park-tour/',
            '/en/puerto-escondido-tours/',
            '/fr/bioluminescence-oaxaca/',
            '/fr/liberation-tortues-puerto-escondido/',
            '/fr/dauphins-baleines-puerto-escondido/',
            '/fr/balade-cheval-coucher-soleil/',
            '/fr/kayak-lagune-manialtepec/',
            '/fr/parc-national-chacahua-tour/',
            '/fr/puerto-escondido-excursions/'
        ];

        for (const u of testUrls) {
            const res = await page.goto(BASE + u);
            expect(res.status()).toBe(200);
            await expect(page.locator('h1')).toBeVisible();
        }
    });

    test('el modal de tour en inglés muestra textos en inglés', async ({ page }) => {
        await page.goto(BASE + '/en/');
        await page.evaluate(() => window.openTourModal('biolum'));
        await expect(page.locator('#modal-tour-title')).toHaveText('Magic Bioluminescence');
        await expect(page.locator('#modal-tour-tag')).toHaveText('Night Experience');
    });

    test('el modal de tour en francés muestra textos en francés', async ({ page }) => {
        await page.goto(BASE + '/fr/');
        await page.evaluate(() => window.openTourModal('biolum'));
        await expect(page.locator('#modal-tour-title')).toHaveText('Bioluminescence Magique');
        await expect(page.locator('#modal-tour-tag')).toHaveText('Expérience Nocturne');
    });

});
