import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://cuantomequitaelestado.com',
  trailingSlash: 'always',
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
        '@fiscal': '/src/fiscal'
      }
    }
  },
  output: 'static'
});
