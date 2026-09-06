const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:3100';

const pagesToTest = [
    '/',
    '/en/',
    '/fr/',
    '/bioluminiscencia-oaxaca/',
    '/liberacion-tortugas-oaxaca/',
    '/avistamiento-delfines-oaxaca/',
    '/paseo-caballo-puerto-escondido/',
    '/kayak-manglares-manialtepec/',
    '/tour-chacahua/',
    '/puerto-escondido-tours/',
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

test.describe('Verificación de Renderizado de Imágenes', () => {

    for (const urlPath of pagesToTest) {
        test('la página ' + urlPath + ' carga todas sus imágenes sin errores 404', async ({ page }) => {
            const failedImages = [];
            page.on('response', (response) => {
                const reqUrl = response.url();
                if (reqUrl.match(/\.(webp|jpg|jpeg|png|svg)(\?.*)?$/i) && response.status() >= 400) {
                    failedImages.push({ url: reqUrl, status: response.status() });
                }
            });

            await page.goto(BASE + urlPath);
            await page.waitForLoadState('networkidle');

            // Scroll down to load all lazy images
            await page.evaluate(async () => {
                window.scrollTo(0, document.body.scrollHeight / 2);
                await new Promise(r => setTimeout(r, 200));
                window.scrollTo(0, document.body.scrollHeight);
                await new Promise(r => setTimeout(r, 200));
            });

            expect(failedImages).toEqual([]);

            const zeroWidthImages = await page.$$eval('img', (imgs) => {
                return imgs
                    .filter(img => img.complete && img.naturalWidth === 0 && img.getAttribute('src'))
                    .map(img => img.src);
            });

            expect(zeroWidthImages).toEqual([]);
        });
    }

});
