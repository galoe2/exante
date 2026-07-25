import type { CollectionEntry } from 'astro:content';

const MESI = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];

export function fmtDate(d: Date): string {
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MESI[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function readingMinutes(post: CollectionEntry<'blog'>): number {
  if (post.data.readingMinutes) return post.data.readingMinutes;
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function sortPosts(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const RUBRICHE = ['MERCATI', 'MODELLI', 'LAB'] as const;

export const RUBRICA_DESC: Record<string, string> = {
  MERCATI:
    "Lettura settimanale dei mercati: rotazioni settoriali, tesi d'investimento, macro. Esce ogni domenica.",
  MODELLI: 'Statistica, machine learning, AI e credit risk spiegati bene: dal divulgativo al tecnico.',
  LAB: 'Case study dei progetti che costruisco, con codice e screenshot.',
};

export function rubricaSlug(r: string): string {
  return r.toLowerCase();
}
