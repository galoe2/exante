---
title: "Spiegazioni controfattuali: cosa serve per fidarsi di un modello"
rubrica: MODELLI
date: 2026-06-21
readingMinutes: 11
abstract: "\"Cosa sarebbe dovuto cambiare per un esito diverso?\" Dalla ricerca alla pratica: controfattuali utili, non solo eleganti."
stat: "XAI"
---

Quando un modello rifiuta una richiesta di credito, la domanda del cliente non è "quali feature hanno pesato di più?" — è "cosa sarei dovuto essere per avere un sì?". La prima domanda la risolvono le feature importance; la seconda richiede spiegazioni controfattuali: il punto più vicino, nello spazio delle variabili, in cui la decisione cambia.

## L'eleganza non basta

La letteratura produce controfattuali matematicamente impeccabili e praticamente inutili: "se il tuo reddito fosse stato di 400 euro superiore e la tua anzianità lavorativa di 14 mesi maggiore". Formalmente minimo, umanamente irricevibile. Un controfattuale utile deve rispettare tre vincoli che l'ottimizzazione pura ignora:

- **Azionabilità**: suggerire di cambiare l'età o lo stato civile non è una spiegazione, è un insulto.
- **Plausibilità**: il punto proposto deve stare nella distribuzione dei dati reali, non in un angolo vuoto dello spazio delle feature.
- **Sparsità**: due variabili da cambiare si capiscono, sette no.

## Il test che uso in pratica

Prima di adottare un metodo controfattuale in un processo di credito, lo sottopongo a una prova semplice: genero le spiegazioni per cento casi rifiutati e le leggo come le leggerebbe un gestore di filiale. Se più della metà suona come una condizione che un cliente reale potrebbe effettivamente raggiungere in 12-18 mesi, il metodo è candidabile. Altrimenti è ricerca — legittima, ma non spendibile.

> La fiducia in un modello non nasce dal capire come funziona: nasce dal sapere cosa dovrebbe succedere perché decida diversamente.

## Controfattuali come strumento di audit

C'è un secondo uso, meno citato: i controfattuali rivelano le patologie del modello meglio di molte metriche. Se per invertire una decisione basta una variazione minuscola di una variabile fragile, il modello è instabile proprio dove fa più male. Le spiegazioni nate per il cliente finiscono per servire soprattutto al model risk management.
