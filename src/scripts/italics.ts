// English technical terms inside Indonesian pages are set in italics, wherever they
// appear (body text, headings, labels, buttons). Left upright: product and institution
// names, publication titles, people's names. Runs on lang="id" pages only.
const TERMS = [
  'retrieval-augmented generation', 'large language models?', 'natural language processing',
  'knowledge graphs?', 'legal judgment prediction', 'legal entailment', 'machine learning', 'machine ethics',
  'logic programming', 'representation learning', 'information retrieval', 'information extraction',
  'sentiment analysis', 'social network analysis', 'text mining', 'data mining', 'text / data mining',
  'user experience(?: \\(ux\\))?', 'human in the loop', 'keynote opening speaker', 'opening speaker',
  'keynote speakers?', 'keynote', 'policy briefs?', 'associate professor', 'research scientist',
  'chief scientist', 'research associate', 'research engineer', 'co-?founder', 'dies natalis',
  'alumni back to campus', 'AI literacy', 'AI governance', 'legal tech', 'regtech', 'cyber notary',
  'digital strategy', 'digital business', 'information systems', 'notarial law', 'open data',
  'explainability', 'traceability', 'safeguards?', 'hands-on', 'milestone', 'spin-?offs?', 'ventures?',
  '(?<!Google for )start-?ups?(?! Wheel| and Pitching)', 'benchmarks?', 'datasets?', 'embeddings?', 'grounding', 'retrieval', 'fellowship',
  'workshop', 'webinar', 'booth', 'RAG', 'LLMs?', 'NLP',
];
const RE = new RegExp(`(?<![\\w-])(${TERMS.join('|')})(?![\\w-])`, 'gi');

const SKIP = 'script,style,svg,em,i,time,code,pre,.pub,.pub-row,.pub-card,.person,.inst,.type-tag,[data-no-italic]';

function run() {
  if (document.documentElement.lang !== 'id') return;
  document.querySelectorAll<HTMLElement>('main, footer').forEach((root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n as Text;
      const el = t.parentElement;
      RE.lastIndex = 0;
      if (el && !el.closest(SKIP) && RE.test(t.data)) nodes.push(t);
      RE.lastIndex = 0;
    }
    nodes.forEach((t) => {
      const frag = document.createDocumentFragment();
      let last = 0;
      t.data.replace(RE, (m, _g, offset: number) => {
        if (offset > last) frag.append(t.data.slice(last, offset));
        const em = document.createElement('em');
        em.className = 'tx';
        em.textContent = m;
        frag.append(em);
        last = offset + m.length;
        return m;
      });
      if (last < t.data.length) frag.append(t.data.slice(last));
      t.replaceWith(frag);
    });
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
else run();
