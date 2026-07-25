import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    rubrica: z.enum(['MERCATI', 'MODELLI', 'LAB']),
    date: z.coerce.date(),
    abstract: z.string(),
    // Se assente viene calcolato dal numero di parole (200 wpm)
    readingMinutes: z.number().optional(),
    // Micro-stat mono nel footer della card (es. "106 ETF", "ΔGINI +4,0 PT")
    stat: z.string().optional(),
    // Sparkline SVG 64×18 nel footer della card: stringa di punti "x,y x,y …"
    sparkline: z.string().optional(),
    // Link al report HTML completo (articoli generati dalla pipeline ETF)
    report: z.string().optional(),
  }),
});

export const collections = { blog };
