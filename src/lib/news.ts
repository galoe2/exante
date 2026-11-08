// Notizie dai provider (src/data/news.json, scritto da scripts/fetch-news.mjs a ogni
// build). Il file non è nel repo: se manca, le pagine mostrano lo stato vuoto.
import fs from 'node:fs';
import path from 'node:path';

export interface NewsItem {
  title: string;
  link: string;
  categoria: string;
  source: string;
  sourceName: string;
  label: string | null;
  lang: string;
  date: string;
}

export interface NewsData {
  updated: string | null;
  sezioni: { id: string; name: string; fonti: { id: string; name: string; count: number; via: string | null }[] }[];
  items: NewsItem[];
}

// Sezioni della pagina News (le fonti di ciascuna sono in scripts/fetch-news.mjs)
export const SEZIONI_NEWS = [
  { id: 'mercati', name: 'Mercati', desc: 'Mercati, economia e banche centrali.' },
  { id: 'mondo', name: 'Mondo', desc: 'Esteri e geopolitica.' },
  { id: 'tecnologia', name: 'Tecnologia', desc: 'AI, chip, software e big tech.' },
  { id: 'motori', name: 'Motori', desc: 'Auto, moto, elettrico e corse.' },
];

export function loadNews(): NewsData {
  try {
    const d = JSON.parse(fs.readFileSync(path.resolve('./src/data/news.json'), 'utf8'));
    return { updated: d.updated ?? null, sezioni: d.sezioni ?? [], items: d.items ?? [] };
  } catch {
    return { updated: null, sezioni: [], items: [] };
  }
}

/** Nomi delle fonti di una sezione, nell'ordine dello script */
export function fontiSezione(news: NewsData, id: string): { nomi: string[]; viaGoogle: string[] } {
  const fonti = news.sezioni.find((s) => s.id === id)?.fonti ?? [];
  const attive = fonti.filter((f) => f.count > 0);
  return { nomi: attive.map((f) => f.name), viaGoogle: attive.filter((f) => f.via).map((f) => f.name) };
}

const TZ = 'Europe/Rome';

/** "14:32" (ora italiana) */
export function fmtOra(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

/** Chiave del giorno in ora italiana, "2026-11-08" */
export function giornoKey(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(iso)
  );
}

/** "Domenica 8 novembre" */
export function fmtGiorno(iso: string): string {
  const s = new Intl.DateTimeFormat('it-IT', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(iso)
  );
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "8 nov, 14:32" */
export function fmtQuando(iso: string): string {
  const d = new Date(iso);
  const giorno = new Intl.DateTimeFormat('it-IT', { timeZone: TZ, day: 'numeric', month: 'short' }).format(d);
  return `${giorno}, ${fmtOra(iso)}`;
}

/** Le ultime n notizie, al massimo `perFonte` per fonte, per variare i riquadri */
export function ultimeNotizie(items: NewsItem[], n = 6, perFonte = 2): NewsItem[] {
  const out: NewsItem[] = [];
  const conta: Record<string, number> = {};
  for (const it of items) {
    if ((conta[it.source] ?? 0) >= perFonte) continue;
    conta[it.source] = (conta[it.source] ?? 0) + 1;
    out.push(it);
    if (out.length === n) break;
  }
  return out;
}
