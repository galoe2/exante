#!/usr/bin/env node
// Scarica i titoli delle notizie dai feed dei provider e scrive src/data/news.json
// per la pagina /news/ e il riquadro in home.
//
//   npm run news
//
// Si pubblicano solo titolo, fonte, ora e link all'articolo originale: il testo
// degli articoli non viene mai copiato. Reuters non ha feed pubblici dal 2020:
// i suoi titoli arrivano dalla ricerca di Google News. Se bloomberg.com rifiuta
// i server di GitHub, anche Bloomberg passa da Google News.
//
// Nel workflow scrive anche `items=<n>` in $GITHUB_OUTPUT.

import { writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFeed } from './lib/rss.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'news.json');
const UA = 'Mozilla/5.0 (compatible; ExAnteNews/1.0; +https://galoe2.github.io/exante/)';
const GN = (q) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;

const SOURCES = [
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    max: 18,
    maxAgeDays: 3,
    publisher: /bloomberg/i,
    feeds: [
      { url: 'https://www.bloomberg.com/feeds/markets/news.rss', section: 'Mercati' },
      { url: 'https://www.bloomberg.com/feeds/economics/news.rss', section: 'Economia' },
      { url: 'https://www.bloomberg.com/feeds/technology/news.rss', section: 'Tecnologia' },
    ],
    fallback: [{ url: GN('when:2d site:bloomberg.com/news/articles'), section: 'Notizie', via: 'Google News' }],
  },
  {
    id: 'reuters',
    name: 'Reuters',
    max: 18,
    maxAgeDays: 3,
    publisher: /reuters/i,
    feeds: [
      { url: GN('when:2d site:reuters.com/markets'), section: 'Mercati', via: 'Google News' },
      { url: GN('when:2d site:reuters.com/business'), section: 'Economia', via: 'Google News' },
    ],
  },
  {
    id: 'cnbc',
    name: 'CNBC',
    max: 12,
    maxAgeDays: 3,
    feeds: [
      { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', section: 'Finanza' },
      { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', section: 'Economia' },
    ],
  },
  {
    id: 'marketwatch',
    name: 'MarketWatch',
    max: 12,
    maxAgeDays: 3,
    feeds: [{ url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', section: 'Prima pagina' }],
  },
  {
    id: 'fed',
    name: 'Fed',
    max: 5,
    maxAgeDays: 21,
    feeds: [{ url: 'https://www.federalreserve.gov/feeds/press_all.xml', section: 'Comunicati' }],
  },
  {
    id: 'bce',
    name: 'BCE',
    max: 5,
    maxAgeDays: 21,
    feeds: [{ url: 'https://www.ecb.europa.eu/rss/press.html', section: 'Comunicati' }],
  },
];

// Toglie la testata in coda ai titoli di Google News ("Titolo - Reuters")
const SUFFIX = /\s+[-–—|]\s+(Reuters|Bloomberg(\.com| News)?|BNN Bloomberg)\s*$/i;

// Risultati che non sono notizie: pagine di quotazione dei titoli (arrivano dalla
// ricerca di Google News, es. "Harbor … ETF (TEC.N) | Stock Price & Latest News")
const NON_NOTIZIE = [/stock price\s*(&|and)\s*latest news/i, /\|\s*stock (price|quote)/i, /\bstock quote\b/i];

async function get(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml, */*' },
    signal: AbortSignal.timeout(20000),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function readFeeds(src, feeds) {
  const out = [];
  for (const f of feeds) {
    try {
      let items = parseFeed(await get(f.url));
      if (f.via && src.publisher) items = items.filter((it) => !it.publisher || src.publisher.test(it.publisher));
      console.log(`  ${src.name} · ${f.section}${f.via ? ` (via ${f.via})` : ''}: ${items.length}`);
      for (const it of items) out.push({ ...it, section: f.section, via: f.via ?? null });
    } catch (e) {
      console.log(`  ${src.name} · ${f.section}: ERRORE ${e.message}`);
    }
  }
  return out;
}

const now = Date.now();
const all = [];
const report = [];

for (const src of SOURCES) {
  let got = await readFeeds(src, src.feeds);
  if (got.length === 0 && src.fallback) {
    console.log(`  ${src.name}: feed ufficiale non raggiungibile, provo il ripiego`);
    got = await readFeeds(src, src.fallback);
  }
  const maxAge = src.maxAgeDays * 86400000;
  const seen = new Set();
  const items = got
    .filter((it) => it.date && now - it.date.getTime() <= maxAge && it.date.getTime() <= now + 3600000)
    .map((it) => ({ ...it, title: it.title.replace(SUFFIX, '').trim() }))
    .filter((it) => !NON_NOTIZIE.some((re) => re.test(it.title)))
    .filter((it) => {
      const key = it.title.toLowerCase();
      if (seen.has(key) || seen.has(it.link)) return false;
      seen.add(key);
      seen.add(it.link);
      return true;
    })
    .sort((a, b) => b.date - a.date)
    .slice(0, src.max);
  report.push({ id: src.id, name: src.name, count: items.length, via: items.some((i) => i.via) ? 'Google News' : null });
  for (const it of items) {
    all.push({ title: it.title, link: it.link, source: src.id, section: it.section, date: it.date.toISOString() });
  }
}

all.sort((a, b) => (a.date < b.date ? 1 : -1));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), sources: report, items: all }, null, 2) + '\n');
console.log(`News: ${all.length} titoli → ${OUT}`);
for (const it of all.slice(0, 8)) console.log(`  [${it.source}] ${it.title}`);

if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `items=${all.length}\n`);
