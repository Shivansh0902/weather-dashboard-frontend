// vitest.config.js
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  test: {
    globals: true,
    environment: 'jsdom',
    ssr: false,
    // restore default excludes and skip App.test.js
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**',
      'src/App.test.js'
    ],
    setupFiles: './src/setupTests.js'
  }
});
