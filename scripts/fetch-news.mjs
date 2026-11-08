#!/usr/bin/env node
// Scarica i titoli delle notizie dai feed dei provider e scrive src/data/news.json
// per le pagine /news/ e il riquadro in home.
//
//   npm run news
//
// Sezioni e fonti si cambiano nell'elenco SEZIONI qui sotto. Per ogni fonte:
//   feeds     — feed RSS/Atom (section = etichetta facoltativa mostrata accanto alla fonte)
//   fallback  — feed di ripiego se i feed ufficiali non danno nulla (di solito Google News)
//   publisher — per i feed di Google News: tiene solo i titoli di quella testata
//   escludi   — espressioni regolari: titoli da scartare per quella fonte
//   max, maxAgeDays, lang — quanti titoli, quanto recenti, lingua dei titoli
//
// Si pubblicano solo titolo, fonte, ora e link all'articolo originale: il testo
// degli articoli non viene mai copiato. Nel workflow scrive `items=<n>` in $GITHUB_OUTPUT.

import { writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFeed } from './lib/rss.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'news.json');
const UA = 'Mozilla/5.0 (compatible; ExAnteNews/1.0; +https://galoe2.github.io/exante/)';

// Ricerca di Google News (per le testate senza feed pubblico)
const GN = (q, lang = 'en') =>
  lang === 'it'
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=it&gl=IT&ceid=IT:it`
    : `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
const VIA = 'Google News';

const SEZIONI = [
  {
    id: 'mercati',
    name: 'Mercati',
    fonti: [
      {
        id: 'bloomberg', name: 'Bloomberg', lang: 'en', max: 16, maxAgeDays: 3, publisher: /bloomberg/i,
        feeds: [
          { url: 'https://www.bloomberg.com/feeds/markets/news.rss', section: 'Mercati' },
          { url: 'https://www.bloomberg.com/feeds/economics/news.rss', section: 'Economia' },
        ],
        fallback: [{ url: GN('when:2d site:bloomberg.com/news/articles'), via: VIA }],
      },
      {
        id: 'reuters', name: 'Reuters', lang: 'en', max: 16, maxAgeDays: 3, publisher: /reuters/i,
        feeds: [
          { url: GN('when:2d site:reuters.com/markets'), section: 'Mercati', via: VIA },
          { url: GN('when:2d site:reuters.com/business'), section: 'Economia', via: VIA },
        ],
      },
      {
        id: 'cnbc', name: 'CNBC', lang: 'en', max: 12, maxAgeDays: 3,
        feeds: [
          { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', section: 'Finanza' },
          { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', section: 'Economia' },
        ],
      },
      {
        id: 'marketwatch', name: 'MarketWatch', lang: 'en', max: 10, maxAgeDays: 3,
        feeds: [{ url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories' }],
        // La prima pagina mescola rubriche di consigli personali ("Should I…", "my stepmother…")
        escludi: [
          /\bshould (i|we)\b/i,
          /\b(my|our) (husband|wife|partner|father|mother|dad|mom|stepmother|stepfather|sister|brother|son|daughter|parents|kids|children|adviser|advisor|boyfriend|girlfriend|fiancé|fiancée)\b/i,
          /\bwe['’]re in our \d0s\b/i,
          /\bi['’]m (\d+|in my \d0s)\b/i,
          /\bmoneyist\b/i,
        ],
      },
      {
        id: 'fed', name: 'Fed', lang: 'en', max: 5, maxAgeDays: 21,
        feeds: [{ url: 'https://www.federalreserve.gov/feeds/press_all.xml', section: 'Comunicati' }],
      },
      {
        id: 'bce', name: 'BCE', lang: 'en', max: 5, maxAgeDays: 21,
        feeds: [{ url: 'https://www.ecb.europa.eu/rss/press.html', section: 'Comunicati' }],
      },
    ],
  },
  {
    id: 'mondo',
    name: 'Mondo',
    fonti: [
      {
        id: 'reuters', name: 'Reuters', lang: 'en', max: 10, maxAgeDays: 2, publisher: /reuters/i,
        feeds: [{ url: GN('when:2d site:reuters.com/world'), via: VIA }],
      },
      { id: 'bbc', name: 'BBC', lang: 'en', max: 10, maxAgeDays: 2, feeds: [{ url: 'https://feeds.bbci.co.uk/news/world/rss.xml' }] },
      { id: 'guardian', name: 'The Guardian', lang: 'en', max: 10, maxAgeDays: 2, feeds: [{ url: 'https://www.theguardian.com/world/rss' }] },
      { id: 'aljazeera', name: 'Al Jazeera', lang: 'en', max: 8, maxAgeDays: 2, feeds: [{ url: 'https://www.aljazeera.com/xml/rss/all.xml' }] },
      {
        id: 'ansa', name: 'ANSA', lang: 'it', max: 10, maxAgeDays: 2, publisher: /ansa/i,
        feeds: [{ url: 'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml' }],
        fallback: [{ url: GN('when:2d site:ansa.it/sito/notizie/mondo', 'it'), via: VIA }],
      },
    ],
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia',
    fonti: [
      {
        id: 'reuters', name: 'Reuters', lang: 'en', max: 8, maxAgeDays: 3, publisher: /reuters/i,
        feeds: [{ url: GN('when:3d site:reuters.com/technology'), via: VIA }],
      },
      {
        id: 'bloomberg', name: 'Bloomberg', lang: 'en', max: 8, maxAgeDays: 3, publisher: /bloomberg/i,
        feeds: [{ url: 'https://www.bloomberg.com/feeds/technology/news.rss' }],
        fallback: [{ url: GN('when:3d site:bloomberg.com/news/articles technology'), via: VIA }],
      },
      { id: 'verge', name: 'The Verge', lang: 'en', max: 8, maxAgeDays: 3, feeds: [{ url: 'https://www.theverge.com/rss/index.xml' }] },
      {
        // Sezione tecnologia (il feed generale include molta scienza)
        id: 'ars', name: 'Ars Technica', lang: 'en', max: 8, maxAgeDays: 5,
        feeds: [{ url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' }],
        fallback: [{ url: 'https://feeds.arstechnica.com/arstechnica/index' }],
      },
      { id: 'techcrunch', name: 'TechCrunch', lang: 'en', max: 8, maxAgeDays: 3, feeds: [{ url: 'https://techcrunch.com/feed/' }] },
      {
        id: 'ansa', name: 'ANSA', lang: 'it', max: 8, maxAgeDays: 3, publisher: /ansa/i,
        feeds: [{ url: 'https://www.ansa.it/canale_tecnologia/notizie/tecnologia_rss.xml' }],
        fallback: [{ url: GN('when:3d site:ansa.it/canale_tecnologia', 'it'), via: VIA }],
      },
    ],
  },
  {
    id: 'motori',
    name: 'Motori',
    fonti: [
      {
        id: 'motor1', name: 'Motor1', lang: 'it', max: 8, maxAgeDays: 4, publisher: /motor1/i,
        feeds: [{ url: 'https://it.motor1.com/rss/news/all/', section: 'Auto' }],
        fallback: [{ url: GN('when:4d site:it.motor1.com', 'it'), section: 'Auto', via: VIA }],
      },
      {
        id: 'insideevs', name: 'InsideEVs', lang: 'it', max: 6, maxAgeDays: 4, publisher: /insideevs/i,
        feeds: [{ url: 'https://insideevs.it/rss/news/all/', section: 'Elettrico' }],
        fallback: [{ url: GN('when:4d site:insideevs.it', 'it'), section: 'Elettrico', via: VIA }],
      },
      {
        id: 'motorsport', name: 'Motorsport.com', lang: 'it', max: 8, maxAgeDays: 3, publisher: /motorsport/i,
        feeds: [{ url: 'https://it.motorsport.com/rss/all/news/', section: 'Corse' }],
        fallback: [{ url: GN('when:3d site:it.motorsport.com', 'it'), section: 'Corse', via: VIA }],
      },
      {
        id: 'motoit', name: 'Moto.it', lang: 'it', max: 8, maxAgeDays: 4, publisher: /moto\.it/i,
        feeds: [{ url: GN('when:4d site:moto.it', 'it'), section: 'Moto', via: VIA }],
      },
      {
        id: 'ansa', name: 'ANSA', lang: 'it', max: 6, maxAgeDays: 4, publisher: /ansa/i,
        feeds: [{ url: 'https://www.ansa.it/canale_motori/notizie/motori_rss.xml', section: 'Motori' }],
        fallback: [{ url: GN('when:4d site:ansa.it/canale_motori', 'it'), section: 'Motori', via: VIA }],
      },
      {
        id: 'reuters', name: 'Reuters', lang: 'en', max: 6, maxAgeDays: 4, publisher: /reuters/i,
        feeds: [{ url: GN('when:4d site:reuters.com/business/autos-transportation'), section: 'Industria', via: VIA }],
      },
    ],
  },
];

// Toglie la testata in coda ai titoli di Google News ("Titolo - Reuters")
const SUFFIX =
  /\s+[-–—|]\s+(Reuters|Bloomberg(\.com| News)?|BNN Bloomberg|ANSA(\.it)?|Agenzia ANSA|Moto\.it|Motor1(\.com)?( Italia)?|InsideEVs( Italia)?|Motorsport\.com( Italia)?)\s*$/i;

// Risultati che non sono notizie, arrivati dalla ricerca di Google News: pagine di
// quotazione ("… ETF (TEC.N) | Stock Price & Latest News") e annunci di compravendita
// ("Vendo Bmw R 1200 GS (2013 - 16) usata a Prato (codice 10155619)")
const NON_NOTIZIE = [
  /stock price\s*(&|and)\s*latest news/i,
  /\|\s*stock (price|quote)/i,
  /\bstock quote\b/i,
  /^(vendo|cerco|compro)\s/i,
  /\(codice \d+\)\s*$/i,
];

async function get(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
    signal: AbortSignal.timeout(20000),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function readFeeds(sez, fonte, feeds) {
  const out = [];
  for (const f of feeds) {
    const label = `${sez.name} · ${fonte.name}${f.section ? ` · ${f.section}` : ''}${f.via ? ` (via ${f.via})` : ''}`;
    try {
      let items = parseFeed(await get(f.url));
      if (f.via && fonte.publisher) items = items.filter((it) => !it.publisher || fonte.publisher.test(it.publisher));
      console.log(`  ${label}: ${items.length}`);
      for (const it of items) out.push({ ...it, section: f.section ?? null, via: f.via ?? null });
    } catch (e) {
      console.log(`  ${label}: ERRORE ${e.message}`);
    }
  }
  return out;
}

const now = Date.now();
const items = [];
const report = [];

for (const sez of SEZIONI) {
  const fonti = [];
  for (const fonte of sez.fonti) {
    const filtra = (got) => {
      const maxAge = fonte.maxAgeDays * 86400000;
      const escludi = [...NON_NOTIZIE, ...(fonte.escludi ?? [])];
      const seen = new Set();
      return got
        .filter((it) => it.date && now - it.date.getTime() <= maxAge && it.date.getTime() <= now + 3600000)
        .map((it) => ({ ...it, title: it.title.replace(SUFFIX, '').trim() }))
        .filter((it) => !escludi.some((re) => re.test(it.title)))
        .filter((it) => {
          const key = it.title.toLowerCase();
          if (seen.has(key) || seen.has(it.link)) return false;
          seen.add(key);
          seen.add(it.link);
          return true;
        })
        .sort((a, b) => b.date - a.date)
        .slice(0, fonte.max);
    };
    let scelti = filtra(await readFeeds(sez, fonte, fonte.feeds));
    // Ripiego se il feed non risponde o non ha titoli recenti
    if (scelti.length === 0 && fonte.fallback) {
      console.log(`  ${sez.name} · ${fonte.name}: nessun titolo recente dal feed, provo il ripiego`);
      scelti = filtra(await readFeeds(sez, fonte, fonte.fallback));
    }
    fonti.push({ id: fonte.id, name: fonte.name, count: scelti.length, via: scelti.some((i) => i.via) ? VIA : null });
    for (const it of scelti) {
      items.push({
        title: it.title,
        link: it.link,
        categoria: sez.id,
        source: fonte.id,
        sourceName: fonte.name,
        label: it.section,
        lang: fonte.lang,
        date: it.date.toISOString(),
      });
    }
  }
  report.push({ id: sez.id, name: sez.name, fonti });
}

items.sort((a, b) => (a.date < b.date ? 1 : -1));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), sezioni: report, items }, null, 2) + '\n');
console.log(`News: ${items.length} titoli → ${OUT}`);
for (const s of report) {
  console.log(`  ${s.name}: ${s.fonti.map((f) => `${f.name} ${f.count}${f.via ? ' (via Google News)' : ''}`).join(', ')}`);
}
// Qualche titolo per fonte, per controllare a colpo d'occhio la qualità nel log
for (const s of report) {
  for (const f of s.fonti) {
    const esempi = items.filter((it) => it.categoria === s.id && it.source === f.id).slice(0, 3);
    for (const it of esempi) console.log(`    [${s.id}/${f.id}] ${it.title}`);
  }
}

if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `items=${items.length}\n`);
