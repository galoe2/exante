// Parser minimale per feed RSS 2.0 e Atom: estrae solo titolo, link, data e,
// per Google News, il nome della testata. Nessuna dipendenza esterna.

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—',
  hellip: '…', euro: '€', pound: '£', yen: '¥', copy: '©', reg: '®', trade: '™',
};

export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
}

function cdata(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

export function clean(s) {
  // CDATA → testo; entità (anche doppie, es. &amp;#39;) → caratteri; via i tag
  let t = decodeEntities(cdata(s ?? ''));
  t = decodeEntities(t);
  return t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : '';
}

function attr(block, name, attribute) {
  const m = block.match(new RegExp(`<${name}\\s[^>]*${attribute}=["']([^"']+)["'][^>]*>`, 'i'));
  return m ? m[1] : '';
}

/** Restituisce [{ title, link, date (Date|null), publisher }] */
export function parseFeed(xml) {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  for (const b of blocks) {
    const title = clean(tag(b, 'title'));
    let link = clean(tag(b, 'link'));
    if (!link) link = attr(b, 'link', 'href'); // Atom
    if (!link) {
      const guid = clean(tag(b, 'guid'));
      if (/^https?:\/\//.test(guid)) link = guid;
    }
    const rawDate = clean(tag(b, 'pubDate') || tag(b, 'dc:date') || tag(b, 'published') || tag(b, 'updated'));
    const t = Date.parse(rawDate);
    const publisher = clean(tag(b, 'source'));
    if (title && /^https?:\/\//.test(link)) {
      items.push({ title, link: decodeEntities(link), date: Number.isNaN(t) ? null : new Date(t), publisher });
    }
  }
  return items;
}
