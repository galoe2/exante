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
    bgGradient: [[255, 255, 255]],
    border: { color: [62, 92, 143], width: 14, side: 'inline-start' },
    padding: 72,
    logo: undefined,
    font: {
      title: {
        families: ['Inter'],
        weight: 'Bold',
        size: 60,
        color: [15, 23, 42],
        lineHeight: 1.2,
      },
      description: {
        families: ['Inter'],
        size: 26,
        color: [100, 116, 139],
        lineHeight: 1.5,
      },
    },
    fonts: [
      'https://api.fontsource.org/v1/fonts/inter/latin-700-normal.ttf',
      'https://api.fontsource.org/v1/fonts/inter/latin-400-normal.ttf',
    ],
  }),
});
