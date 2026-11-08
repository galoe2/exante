#!/usr/bin/env bash
# Copia nel sito i file prodotti dalla pipeline ETF (repo pubblico galoe2/etf-dashboard).
#
#   bash scripts/sync-pipeline.sh <cartella del repo etf-dashboard>
#
# - Report HTML (output/): copia quelli nuovi o rigenerati in public/reports/.
# - Articolo settimanale (site_export/src/content/blog/): copiato solo se nuovo,
#   così le modifiche fatte a mano a un articolo già pubblicato restano.
# - market.json e watchlist.json (site_export/src/data/): sempre aggiornati.
#
# Lo usa il workflow deploy.yml; si può lanciare anche in locale con il repo
# etf-dashboard clonato accanto: bash scripts/sync-pipeline.sh ../etf-dashboard
set -euo pipefail
shopt -s nullglob

SRC="$(cd "${1:?Uso: sync-pipeline.sh <cartella etf-dashboard>}" && pwd)"
cd "$(dirname "$0")/.."

mkdir -p public/reports src/content/blog src/data

for f in "$SRC"/output/ETF_Report_*.html; do
  dst="public/reports/$(basename "$f")"
  if [ ! -e "$dst" ] || ! cmp -s "$f" "$dst"; then
    cp "$f" "$dst"
    echo "report aggiornato: $dst"
  fi
done

for f in "$SRC"/site_export/src/content/blog/*.md; do
  dst="src/content/blog/$(basename "$f")"
  if [ ! -e "$dst" ]; then
    cp "$f" "$dst"
    echo "articolo nuovo: $dst"
  fi
done

for name in market.json watchlist.json; do
  f="$SRC/site_export/src/data/$name"
  if [ -e "$f" ] && ! cmp -s "$f" "src/data/$name"; then
    cp "$f" "src/data/$name"
    echo "dati aggiornati: src/data/$name"
  fi
done
