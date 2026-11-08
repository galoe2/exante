import { defineConfig } from 'astro/config';
import rehypeSezioni from './src/lib/rehype-sezioni.mjs';

export default defineConfig({
  // GitHub Pages di progetto. Con un dominio custom (es. https://ex-ante.it):
  // site: 'https://ex-ante.it' e rimuovere `base`.
  site: 'https://galoe2.github.io',
  base: '/exante',
  trailingSlash: 'ignore',
  redirects: {
    '/dashboard': '/mercati',
  },
  markdown: {
    // Evidenzia le sezioni "Prima che accada" e "Fonti" negli articoli
    rehypePlugins: [rehypeSezioni],
  },
});
