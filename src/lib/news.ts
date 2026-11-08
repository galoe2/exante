// Notizie dai provider (src/data/news.json, scritto da scripts/fetch-news.mjs a ogni
// build). Il file non è nel repo: se manca, la sezione mostra lo stato vuoto.
import fs from 'node:fs';
import path from 'node:path';

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  section: string;
  date: string;
}

export interface NewsData {
  updated: string | null;
  sources: { id: string; name: string; count: number; via: string | null }[];
  items: NewsItem[];
}

export const NEWS_SOURCES = [
  { id: 'bloomberg', name: 'Bloomberg' },
  { id: 'reuters', name: 'Reuters' },
  { id: 'cnbc', name: 'CNBC' },
  { id: 'marketwatch', name: 'MarketWatch' },
  { id: 'fed', name: 'Fed' },
  { id: 'bce', name: 'BCE' },
];

export function sourceName(id: string): string {
  return NEWS_SOURCES.find((s) => s.id === id)?.name ?? id;
}

export function loadNews(): NewsData {
  try {
    return JSON.parse(fs.readFileSync(path.resolve('./src/data/news.json'), 'utf8'));
  } catch {
    return { updated: null, sources: [], items: [] };
  }
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

/** Le ultime n notizie, al massimo `perFonte` per fonte, per variare il riquadro in home */
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
