// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '*.spec.js',
  fullyParallel: false,
  // La suite crecio de 48 a 106 pruebas y el servidor estatico sirve ~46 MB de
  // fotografia: con 3 procesos concurrentes algunas navegaciones agotaban los
  // 30 s por defecto sin que hubiera ningun fallo funcional.
  workers: 2,
  timeout: 60000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    channel: 'chrome',
    navigationTimeout: 45000,
  },
  webServer: {
    command: 'node tests/server.js',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: true,
    timeout: 10000,
  },
});
