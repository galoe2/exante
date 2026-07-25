#!/usr/bin/env node
// Crea lo scheletro di un nuovo articolo:
//   npm run new-post -- "Titolo dell'articolo" MERCATI
// Rubriche valide: MERCATI, MODELLI, LAB (default: MERCATI)

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [title, rubricaArg] = process.argv.slice(2);
if (!title) {
  console.error('Uso: npm run new-post -- "Titolo dell\'articolo" [MERCATI|MODELLI|LAB]');
  process.exit(1);
}

const rubrica = (rubricaArg || 'MERCATI').toUpperCase();
if (!['MERCATI', 'MODELLI', 'LAB'].includes(rubrica)) {
  console.error(`Rubrica non valida: ${rubrica}. Usa MERCATI, MODELLI o LAB.`);
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60);

const date = new Date().toISOString().slice(0, 10);
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'blog');
const file = join(dir, `${slug}.md`);

if (existsSync(file)) {
  console.error(`Esiste già: ${file}`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });
writeFileSync(
  file,
  `---
title: "${title.replace(/"/g, '\\"')}"
rubrica: ${rubrica}
date: ${date}
abstract: "TODO: abstract in 1-2 frasi."
# readingMinutes: 8        # opzionale, altrimenti calcolato dalle parole
# stat: "106 ETF"          # opzionale, micro-stat nella card
# sparkline: "0,14 8,11 16,13 24,9 32,10 40,6 48,8 56,4 64,5"  # opzionale
---

Scrivi qui l'articolo in Markdown.

## Primo titolo di sezione

Testo…
`,
  'utf8'
);

console.log(`Creato: ${file}`);
