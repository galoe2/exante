# Ex Ante — sito e blog

Sito statico [Astro](https://astro.build) del blog **Ex Ante** ("Prima che accada. Mercati, modelli, dati.") di Gennaro Aloe. Design da terminale finanziario: dark, IBM Plex, un solo accento.

## Comandi

```bash
npm install          # prima volta
npm run dev          # anteprima su http://localhost:4321
npm run build        # build statica in dist/
npm run new-post -- "Titolo dell'articolo" MERCATI   # nuovo articolo (scheletro)
```

## Pubblicare un articolo (manuale)

1. Crea un file Markdown in `src/content/blog/` (o usa `npm run new-post`).
2. Frontmatter richiesto:

```yaml
---
title: "Titolo"
rubrica: MERCATI        # MERCATI | MODELLI | LAB
date: 2026-07-22
abstract: "Una o due frasi."
# readingMinutes: 8     # opzionale (altrimenti calcolato dalle parole)
# stat: "106 ETF"       # opzionale: micro-stat nella card
# sparkline: "0,14 8,11 16,13 …"   # opzionale: mini-grafico nella card
# report: "/reports/ETF_Report_2026-W29.html"  # opzionale: link al report completo
---
```

3. Commit e push su `main`: il workflow `deploy.yml` ricostruisce e pubblica il sito.

Il corpo è Markdown; è supportato anche HTML inline (figure con SVG, come nell'articolo
"Dal war trade al dividendo della pace"). Gli articoli MERCATI ricevono automaticamente
il box disclaimer.

## Articolo settimanale automatico

Ogni sabato il workflow del repo **ETF_Dashboard** genera il report, crea l'articolo
(`ETF_Dashboard/src/make_post.py`) e lo pusha in questo repo insieme al report HTML
completo in `public/reports/`. Il push innesca il deploy. Setup nel README di ETF_Dashboard.

La stessa pipeline riscrive `src/data/market.json`: la sezione "Market Pulse" in home
(SPY/QQQ/breadth/vol/risk, top gainers e losers 1S, RSI estremi + commento breve).
Modificabile anche a mano con lo stesso schema.

La pagina `/mercati/` incornicia sempre il report più recente trovato in
`public/reports/` (con archivio delle settimane precedenti): si aggiorna da sola
a ogni build, senza modifiche al codice.

**Watchlist** (`/watchlist/`): la composizione si definisce in
`ETF_Dashboard/watchlist.json` (da rivedere a inizio mese: ticker, tipo, nota);
`make_watchlist.py` scarica prezzi e performance reali via yfinance e riscrive
`src/data/watchlist.json`. Gira insieme alla pipeline (`run.py --post`).

## Deploy (GitHub Pages)

1. Crea un repo GitHub e pusha questa cartella.
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. Al primo push su `main` il sito è online.

Con dominio custom (es. ex-ante.it) aggiorna `site` in `astro.config.mjs`.
Con GitHub Pages "di progetto" (`user.github.io/repo`) aggiungi anche `base: '/repo'`.

## Da completare a mano

- Link reali in `src/pages/contatti.astro` e `src/pages/lab.astro` (GitHub/demo).
- Screenshot dei progetti Lab in `public/lab/` (campo `img` in `lab.astro`).
- Newsletter: il form è solo UI — collegare `action` a Buttondown/MailerLite/ConvertKit
  in `src/components/Newsletter.astro`.
