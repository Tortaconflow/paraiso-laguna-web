// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '*.spec.js',
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    channel: 'chrome',
  },
  webServer: {
    command: 'node tests/server.js',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 10000,
  },
});
