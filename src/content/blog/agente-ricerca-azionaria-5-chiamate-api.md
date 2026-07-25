---
title: "Come ho costruito un agente di ricerca azionaria con 5 chiamate API in sequenza"
rubrica: LAB
date: 2026-06-14
readingMinutes: 14
abstract: "Orchestrare Claude come un analista junior: screening settoriale, ranking delle idee e note di sintesi, in cinque passi."
stat: "5 CALL"
---

L'idea è semplice: se un analista junior lavora per passi — prima il quadro macro, poi lo screening, poi l'approfondimento — perché chiedere a un LLM di fare tutto in una chiamata sola? Alpha Scout scompone la ricerca azionaria in cinque chiamate sequenziali all'API di Claude, dove ogni passo riceve solo l'output del precedente.

## I cinque passi

- **1 — Regime**: dai dati macro sintetici, il modello classifica il contesto (risk-on, risk-off, rotazionale) e dichiara le ipotesi.
- **2 — Screening settoriale**: dato il regime, ordina i settori per attrattività relativa con una motivazione per ciascuno.
- **3 — Generazione idee**: per i tre settori migliori, propone titoli candidati con tesi in una riga.
- **4 — Ranking**: valuta ogni idea su convinzione, orizzonte e rischio specifico, e produce una classifica.
- **5 — Nota di sintesi**: scrive la nota finale in stile sell-side, con le prime tre idee e i loro "se" espliciti.

## Perché in sequenza e non in una chiamata

La qualità del passo 5 dipende dalla disciplina dei passi 1-4. Con una chiamata unica il modello mescola livelli di analisi e ancora le conclusioni alle prime frasi che genera. La sequenza impone quello che per un umano è il metodo: prima il contesto, poi il filtro, poi la scelta.

> Un agente non è un modello più intelligente: è un modello messo nelle condizioni di non barare.

## Cosa ho imparato

- **Il contratto tra i passi è tutto**: ogni chiamata restituisce JSON validato; una frase libera al passo 2 diventa rumore al passo 4.
- **La temperatura giusta cambia per passo**: bassa per screening e ranking, più alta per la generazione di idee.
- **Il costo è trascurabile, la latenza no**: cinque chiamate sequenziali significano attese percepibili — da mascherare con lo streaming dell'interfaccia.

Il progetto è nella pagina Lab, con il codice dell'orchestratore React e i prompt completi dei cinque passi.
