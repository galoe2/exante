---
title: "LightGBM contro regressione logistica: quanto vale davvero +4 punti di Gini"
rubrica: MODELLI
date: 2026-07-06
readingMinutes: 12
abstract: "Un confronto onesto su dati di credit risk: performance, stabilità, spiegabilità e il costo reale della complessità."
stat: "ΔGINI +4,0 PT"
---

Nel credit risk la domanda ricorrente è sempre la stessa: il gradient boosting batte la regressione logistica, ma di quanto — e quel vantaggio sopravvive al passaggio in produzione? Ho rifatto il confronto su un dataset reale di scoring, con la stessa pipeline di feature engineering per entrambi i modelli, e la risposta corta è: +4 punti di Gini sul test set. La risposta lunga è più interessante.

## Il confronto, alla pari

Un benchmark onesto richiede tre condizioni che spesso mancano: stesse variabili in ingresso, stessa gestione dei missing, stessa finestra temporale di validazione. Se il boosting vede feature che la logistica non vede, non stiamo confrontando algoritmi ma dataset. Con le condizioni allineate, il divario tipico che osservo è tra 3 e 5 punti di Gini — coerente con la letteratura, lontano dai +10 che si leggono nelle slide commerciali.

## Dove nasce il vantaggio

Il boosting guadagna quasi tutto su due fronti: interazioni non lineari tra variabili comportamentali e gestione automatica delle soglie. La logistica, per pareggiare, richiede binning accurato e termini di interazione espliciti — lavoro artigianale che il boosting fa da solo. Ma è proprio qui il punto:

> Il costo della complessità non si paga in training: si paga in monitoraggio, model risk management e conversazioni con il regolatore.

## La stabilità conta più del picco

Sul out-of-time il divario si restringe: parte del vantaggio del boosting è overfitting elegante sulle stagionalità del campione. La logistica degrada in modo più prevedibile — e la prevedibilità del degrado è una feature, non un difetto, quando il modello deve reggere tre anni di vita regolamentare.

## Quando scegliere cosa

- **Logistica**: quando la spiegabilità è vincolo regolamentare, il team è piccolo, il ciclo di vita del modello è lungo.
- **Boosting**: quando i volumi giustificano il monitoraggio continuo e i 4 punti di Gini si traducono in perdite evitate misurabili.
- **Ibrido**: logistica come modello master, boosting come challenger per scoprire dove la logistica perde segnale.

Quattro punti di Gini valgono molto o poco: dipende interamente da quanto costa, nella vostra organizzazione, tenerli in piedi.
