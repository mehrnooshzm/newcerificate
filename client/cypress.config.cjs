// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Vite dev server default port
    supportFile: false,
    setupNodeEvents(on, config) {
      // implement node event listeners if needed
      return config;
    },
  },
});
