import { defineConfig } from 'astro/config';

export default defineConfig({
  // GitHub Pages di progetto. Con un dominio custom (es. https://ex-ante.it):
  // site: 'https://ex-ante.it' e rimuovere `base`.
  site: 'https://galoe2.github.io',
  base: '/exante',
  trailingSlash: 'ignore',
  redirects: {
    '/dashboard': '/mercati',
  },
});
