---
title: "Un dashboard ETF che si scrive il commento da solo"
rubrica: LAB
date: 2026-06-29
readingMinutes: 15
abstract: "Pipeline settimanale su 106 ETF: dai segnali di regime alle narrative generate via AI. Architettura, codice, limiti."
stat: "106 ETF"
---

Ogni sabato mattina una pipeline Python scarica i dati di 106 ETF, calcola segnali di momentum, flussi e regime di mercato, scansiona le news della settimana e chiede a un modello linguistico di scrivere il commento — cinque sezioni, dalle rotazioni settoriali alle idee operative. Il tutto gira gratis su GitHub Actions e arriva via email come report HTML. Questo articolo racconta come è costruito e dove sbaglia.

## L'architettura

Tre stadi, ognuno con un output verificabile:

- **Scanner news**: feed RSS degli ultimi 7 giorni, classificati per settore e impatto, sintetizzati via LLM in segnali di rotazione.
- **Motore quantitativo**: yfinance per i prezzi, poi performance relative su sei orizzonti, RSI, drawdown, momentum score per 12 settori e 8 regioni, proxy dei flussi di capitale.
- **Commentario AI**: tutti i numeri e le news vengono serializzati in un JSON e passati al modello con un prompt strutturato: regime di mercato, rotazioni, correlazioni anomale, impatto news, idee di investimento.

## Il punto delicato: il prompt è un contratto

La parte più fragile non è il calcolo, è l'interfaccia tra numeri e linguaggio. Il modello riceve dati già aggregati — mai serie grezze — e un formato di output vincolato. Ogni ambiguità nel prompt diventa una frase generica nel report; ogni metrica in più nel JSON è una tentazione di sovra-interpretare.

> Il modello non analizza il mercato: analizza la mia sintesi del mercato. La qualità del commento è decisa prima, nel design delle feature.

## Il track record come antidoto

Ogni settimana la pipeline salva i ticker citati nelle idee operative e li riprende la settimana dopo, calcolando l'hit rate. Non è un backtest serio — è un promemoria di umiltà integrato nel sistema: se le idee generate non battono il caso, il commento è intrattenimento, non analisi.

## I limiti, dichiarati

- I "flussi di capitale" sono proxy da prezzo e volume, non veri fund flows.
- Le news RSS coprono bene le mega-cap, male tutto il resto.
- L'LLM tende all'eccesso di confidenza: il linguaggio probabilistico va imposto nel prompt, non sperato.

Il codice completo e l'evoluzione del progetto sono nella pagina Lab. La versione attuale del report esce ogni settimana nella rubrica MERCATI.
