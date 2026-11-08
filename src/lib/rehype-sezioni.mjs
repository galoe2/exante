// Plugin rehype: riconosce le sezioni firma degli articoli e le avvolge in un
// <section> con una classe dedicata, così il template le può evidenziare.
//
//   ## Prima che accada  →  <section class="sezione-pca">…</section>
//   ## Fonti             →  <section class="sezione-fonti">…</section>
//
// La sezione comprende il titolo e tutto quello che segue fino al titolo
// di livello 1 o 2 successivo. Chi scrive l'articolo usa solo Markdown.

const SEZIONI = [
  { match: /^prima che accada\b/i, className: 'sezione-pca' },
  { match: /^fonti\b/i, className: 'sezione-fonti' },
];

function testo(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(testo).join('');
}

function isTitolo(node, livelli) {
  return node.type === 'element' && livelli.includes(node.tagName);
}

export default function rehypeSezioni() {
  return (tree) => {
    const figli = tree.children;
    const out = [];
    for (let i = 0; i < figli.length; i++) {
      const node = figli[i];
      const sezione = isTitolo(node, ['h2']) && SEZIONI.find((s) => s.match.test(testo(node).trim()));
      if (!sezione) {
        out.push(node);
        continue;
      }
      const section = {
        type: 'element',
        tagName: 'section',
        properties: { className: [sezione.className] },
        children: [node],
      };
      let j = i + 1;
      while (j < figli.length && !isTitolo(figli[j], ['h1', 'h2'])) {
        section.children.push(figli[j]);
        j++;
      }
      out.push(section);
      i = j - 1;
    }
    tree.children = out;
  };
}
