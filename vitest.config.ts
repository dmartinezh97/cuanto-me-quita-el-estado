import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@fiscal': resolve(__dirname, 'src/fiscal'),
    },
  },
  test: {
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', 'test-popup.spec.js'],
  },
});
