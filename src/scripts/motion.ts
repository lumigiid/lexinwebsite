// Page motion, built on the `motion` package (vanilla, no React).
//
// Vocabulary (kept deliberately small so it reads as one hand):
//   words   headlines rise out of a mask, word by word
//   build   the home diagram assembles roof → pillars → foundation → base
//   wipe    photos open with a clip-path wipe, not a fade
//   rise    blocks and grid items fade up with a stagger
//   scroll  tricolour progress line, parallax on the knot watermark, header tucks away
//   pull    large CTAs lean a few px toward the cursor (fine pointers only)
//
// Rules: transform / opacity / clip-path only, ease-out curves with no overshoot,
// nothing runs under prefers-reduced-motion, and content is never left hidden
// (everything pending is released by scroll, load, or a timer).
import { animate, scroll, stagger } from 'motion';

const EASE = [0.16, 1, 0.3, 1] as const; // expo-out: fast start, long soft landing
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

const seen = new WeakSet<Element>();
const placed = (el: Element) => {
  const p = getComputedStyle(el).position;
  return p === 'absolute' || p === 'fixed' || p === 'sticky';
};
const takeable = (el: Element): el is HTMLElement =>
  el instanceof HTMLElement && !el.hidden && !seen.has(el) && !placed(el) &&
  !el.matches('.filterbar, aside, .rail-layer, [data-no-motion]');

const clean = (el: HTMLElement, ...props: string[]) => () => props.forEach((p) => el.style.removeProperty(p));

// ---------- pending queue (scroll-driven; cannot strand content) ----------
const pending = new Map<HTMLElement, () => void>();
let queued = false;
function flush() {
  queued = false;
  const line = innerHeight * 0.92;
  pending.forEach((run, el) => {
    if (!el.isConnected || el.getBoundingClientRect().top < line) {
      pending.delete(el);
      run();
    }
  });
}
function schedule() {
  if (queued || pending.size === 0) return;
  queued = true;
  setTimeout(flush, 16);
}

// ---------- words: masked headline reveal ----------
function splitWords(root: HTMLElement): HTMLElement[] {
  const words: HTMLElement[] = [];
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        (n.textContent || '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span');
          w.className = 'mo-w';
          w.setAttribute('aria-hidden', 'true');
          const i = document.createElement('span');
          i.className = 'mo-wi';
          i.textContent = part;
          w.append(i);
          frag.append(w);
          words.push(i);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !(n as Element).matches('br')) walk(n);
    });
  };
  root.setAttribute('aria-label', (root.textContent || '').replace(/\s+/g, ' ').trim());
  walk(root);
  words.forEach((w) => (w.style.transform = 'translateY(115%)'));
  return words;
}
function playWords(words: HTMLElement[], delay = 0) {
  animate(words, { y: ['115%', '0%'] }, { duration: 0.95, delay: stagger(0.05, { startDelay: delay }), ease: EASE })
    .finished.then(() => words.forEach((w) => w.style.removeProperty('transform')));
}

// ---------- rise / wipe ----------
function rise(el: HTMLElement, delay = 0, dist = 18) {
  seen.add(el);
  animate(el, { opacity: [0, 1], y: [dist, 0] }, { duration: 0.8, delay, ease: EASE }).finished.then(clean(el, 'opacity', 'transform'));
}
function wipe(el: HTMLElement, delay = 0) {
  seen.add(el);
  animate(el, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }, { duration: 1.0, delay, ease: EASE }).finished.then(clean(el, 'clip-path'));
}

function later(el: HTMLElement, run: () => void, hide: () => void) {
  hide();
  pending.set(el, run);
}


// ---------- per-component entrances: every kind of thing arrives its own way ----------
type From = { x?: number; y?: number; scale?: number };
interface Variant {
  sel: string;
  from: From;
  duration?: number;
  step?: number;               // stagger between siblings
  centre?: boolean;            // stagger outward from the middle instead of left to right
  clip?: boolean;              // wipe from the left instead of translating
}
const VARIANTS: Variant[] = [
  { sel: '.area-row', from: { x: -36 }, step: 0.09 },                         // research rows slide in from the left
  { sel: '.latest', from: { x: 36 }, step: 0.09 },                            // news slides in from the right
  { sel: '.prod-card', from: { y: 24, scale: 0.94 }, duration: 0.95, step: 0.14 }, // product cards zoom up
  { sel: '.partner-cell', from: { scale: 0.82 }, step: 0.08, centre: true },  // logos fan out from the middle
  { sel: '.recog, .f-recog, .fchip', from: { scale: 0.5 }, duration: 0.55, step: 0.06 }, // chips pop in one by one
  { sel: '.eyebrow, .mini-lbl', from: {}, clip: true, duration: 0.7 },        // labels are drawn in left to right
  { sel: '.forum', from: { y: 28, scale: 0.96 }, duration: 1 },
  { sel: '.aud, .path', from: { y: 34 }, step: 0.1 },
  { sel: '.mcard', from: { y: 18, scale: 0.9 }, step: 0.06 },
  { sel: '.ev-card', from: { x: -30 }, step: 0.1 },
  { sel: '.client figcaption', from: { y: 12 }, duration: 0.7 },
];
const VARIANT_SEL = VARIANTS.map((v) => v.sel).join(', ');
function applyVariants() {
  VARIANTS.forEach((v) => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(v.sel)).filter((e) => takeable(e) && !e.closest('.diagram'));
    // index each element among its siblings of the same kind
    const groups = new Map<Element, HTMLElement[]>();
    els.forEach((e) => { const k = e.parentElement || document.body; (groups.get(k) || groups.set(k, []).get(k)!).push(e); });
    groups.forEach((list) => {
      list.forEach((el, i) => {
        seen.add(el);
        const mid = (list.length - 1) / 2;
        const order = v.centre ? Math.abs(i - mid) : i;
        const delay = Math.min(order, 7) * (v.step ?? 0.07);
        const run = () => {
          const done = clean(el, 'opacity', 'transform', 'clip-path');
          const kf: Record<string, unknown> = { opacity: [0, 1] };
          if (v.clip) kf.clipPath = ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'];
          if (v.from.x) kf.x = [v.from.x, 0];
          if (v.from.y) kf.y = [v.from.y, 0];
          if (v.from.scale) kf.scale = [v.from.scale, 1];
          animate(el, kf as never, { duration: v.duration ?? 0.8, delay, ease: EASE }).finished.then(done);
        };
        later(el, run, () => (el.style.opacity = '0'));
      });
    });
  });
}

function setup() {
  if (reduce) return;
  document.documentElement.classList.add('mo');

  // 1. Headlines: hero + page titles play on load; section titles when they arrive.
  const heads = Array.from(document.querySelectorAll<HTMLElement>('.hero-h1, .ph-h1, .h-sec, .forum-h')).filter(takeable);
  heads.forEach((h) => {
    seen.add(h);
    const words = splitWords(h);
    const lead = h.matches('.hero-h1, .ph-h1');
    if (lead) playWords(words, 0.12);
    else pending.set(h, () => playWords(words));
  });

  // 2. Lead-in copy under the headline, staggered after the words.
  const lead = [
    ...document.querySelectorAll<HTMLElement>('.hero-grid > div:first-child > :not(.hero-h1)'),
    ...document.querySelectorAll<HTMLElement>('.page-header .ph-inner > :not(.ph-h1)'),
    ...document.querySelectorAll<HTMLElement>('.page-header > .container > :not(h1)'),
  ].filter(takeable);
  lead.forEach((el, i) => {
    el.style.opacity = '0';
    rise(el, 0.35 + Math.min(i, 5) * 0.09, 14);
  });

  // 3. The home diagram builds itself, top to bottom.
  const dia = document.querySelector<HTMLElement>('.diagram');
  if (dia) {
    seen.add(dia);
    const steps: Array<[string, number]> = [['.diagram-head', 0.3], ['.roof', 0.45], ['.rule-row', 0.7]];
    steps.forEach(([sel, d]) => dia.querySelectorAll<HTMLElement>(sel).forEach((el) => { el.style.opacity = '0'; rise(el, d, sel === '.roof' ? -22 : 14); }));
    dia.querySelectorAll<HTMLElement>('.pillar').forEach((el, i) => { el.style.opacity = '0'; rise(el, 0.78 + i * 0.07, 26); });
    dia.querySelectorAll<HTMLElement>('.found').forEach((el) => { el.style.opacity = '0'; rise(el, 1.2, 18); });
    dia.querySelectorAll<HTMLElement>('.infra').forEach((el) => { el.style.opacity = '0'; rise(el, 1.35, 18); });
  }

  // 4. Photos open with a wipe.
  document.querySelectorAll<HTMLElement>('.client-photo, .photo, .u-24b977, .u-8c83d3, .u-fd8a27').forEach((el) => {
    if (!takeable(el)) return;
    seen.add(el);
    later(el, () => wipe(el), () => (el.style.clipPath = 'inset(0 0 100% 0)'));
  });

  // 4b. Components with their own entrance.
  applyVariants();

  // 5. Everything else below the fold rises; a grid rises item by item.
  document.querySelectorAll<HTMLElement>('main section').forEach((sec) => {
    if (sec.matches('.hero, .page-header')) return;
    const wrap = sec.querySelector<HTMLElement>(':scope > .container, :scope > .wrap, :scope > div');
    if (!wrap) return;
    Array.from(wrap.children).forEach((child) => {
      if (!takeable(child)) return;
      const kids = Array.from(child.children).filter(takeable) as HTMLElement[];
      const grid = getComputedStyle(child).display === 'grid';
      if (grid && kids.length >= 2 && kids.length <= 12) {
        kids.forEach((k, i) => { seen.add(k); later(k, () => rise(k, Math.min(i, 6) * 0.08, 22), () => (k.style.opacity = '0')); });
      } else if (child.querySelector(VARIANT_SEL)) {
        // children carry their own entrance; leave this wrapper alone
        seen.add(child);
      } else {
        seen.add(child);
        later(child, () => rise(child, 0, 18), () => (child.style.opacity = '0'));
      }
    });
  });

  flush();
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('load', schedule);
  setTimeout(schedule, 600);

  // 6. Scroll-linked: tricolour progress line + parallax on the knot watermark.
  const bar = document.createElement('div');
  bar.className = 'mo-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));

  const hero = document.querySelector<HTMLElement>('.hero');
  const heroMark = document.querySelector<HTMLElement>('.hero-mark');
  if (hero && heroMark) {
    scroll(animate(heroMark, { y: [0, -110] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
  }
  const ph = document.querySelector<HTMLElement>('.page-header');
  const phMark = document.querySelector<HTMLElement>('.page-header .ph-mark');
  if (ph && phMark) {
    scroll(animate(phMark, { y: [0, 70] }, { ease: 'linear' }), { target: ph, offset: ['start start', 'end start'] });
  }

  // 7. Header tucks away on the way down, returns on the way up.
  const header = document.querySelector<HTMLElement>('.site-header');
  if (header) {
    let last = scrollY;
    // Pages with a sticky sidebar keep the header put, so nothing is left floating under a gap.
    let sticky: boolean | null = null;
    const hasSticky = () => (sticky ??= Array.from(document.querySelectorAll('main *')).some((e) => getComputedStyle(e).position === 'sticky'));
    addEventListener('resize', () => { sticky = null; }, { passive: true });
    addEventListener('scroll', () => {
      const y = scrollY, d = y - last;
      if (hasSticky()) { header.classList.remove('is-away'); last = y; return; }
      const menuOpen = !!header.querySelector('.nav-mobile:not([hidden])');
      if (y < 160 || d < -6 || menuOpen || header.matches(':focus-within')) header.classList.remove('is-away');
      else if (d > 6) header.classList.add('is-away');
      last = y;
    }, { passive: true });
  }

  // 8. Large CTAs lean toward the cursor.
  if (fine) {
    document.querySelectorAll<HTMLElement>('.hero-ctas .lx-btn, .forum-cta .lx-btn, .work-contact .lx-btn, .train-cta .lx-btn').forEach((btn) => {
      const move = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect();
        const dx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 10;
        const dy = ((e.clientY - (r.top + r.height / 2)) / r.height) * 8;
        animate(btn, { x: dx, y: dy }, { type: 'spring', stiffness: 220, damping: 28 });
      };
      btn.addEventListener('pointermove', move);
      btn.addEventListener('pointerleave', () => animate(btn, { x: 0, y: 0 }, { type: 'spring', stiffness: 220, damping: 28 }));
    });
  }
}

// Used by page scripts for popovers/menus: opacity only, so inline transforms are never fought.
export function fadeIn(el: HTMLElement, duration = 0.18) {
  if (reduce) return;
  animate(el, { opacity: [0, 1] }, { duration, ease: EASE });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
else setup();
