import { OGImageRoute } from 'astro-og-canvas';

// Genera le immagini OG (1200x630) a build time: una per articolo + una di default.
// import.meta.glob (sincrono) invece di getCollection: negli endpoint dinamici
// astro:content non è affidabile in fase di raccolta delle route.
const modules = import.meta.glob('../../content/blog/*.md', { eager: true }) as Record<
  string,
  { frontmatter: { title: string; rubrica: string; abstract: string } }
>;

const pages: Record<string, { title: string; description: string }> = {
  site: {
    title: 'Ex Ante',
    description: 'Prima che accada. Mercati, modelli, dati.',
  },
};
for (const [path, mod] of Object.entries(modules)) {
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  pages[slug] = {
    title: mod.frontmatter.title,
    description: `${mod.frontmatter.rubrica} · ${mod.frontmatter.abstract}`,
  };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[8, 11, 18]],
    border: { color: [255, 122, 41], width: 14, side: 'inline-start' },
    padding: 72,
    logo: undefined,
    font: {
      title: {
        families: ['IBM Plex Sans'],
        weight: 'SemiBold',
        size: 60,
        color: [230, 233, 240],
        lineHeight: 1.2,
      },
      description: {
        families: ['IBM Plex Mono'],
        size: 26,
        color: [151, 161, 180],
        lineHeight: 1.5,
      },
    },
    fonts: [
      'https://api.fontsource.org/v1/fonts/ibm-plex-sans/latin-600-normal.ttf',
      'https://api.fontsource.org/v1/fonts/ibm-plex-mono/latin-400-normal.ttf',
    ],
  }),
});
