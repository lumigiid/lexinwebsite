import i18n from '../data/i18n.json';

export type Lang = 'id' | 'en';
export const LANGS: Lang[] = ['id', 'en'];

type Page = keyof typeof i18n;

/** All copy for one page in one language (from `src/data/i18n.json`). */
export function dict(page: Page, lang: Lang): any {
  return (i18n as any)[page][lang];
}

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** Build an internal URL for a language. `path` is the Indonesian slug, e.g. `riset#area-1`. */
export function url(lang: Lang, path = ''): string {
  const p = path.replace(/^\//, '');
  return BASE + (lang === 'en' ? 'en/' : '') + p;
}

/** Public asset URL (files under `public/`). */
export function asset(path: string): string {
  return BASE + path.replace(/^\//, '');
}

const PROTO: Record<string, string> = {
  'Lexin Home v2': '',
  'Lexin Riset': 'riset',
  'Lexin Produk': 'produk',
  'Lexin Anggota': 'anggota',
  'Lexin Publikasi': 'publikasi',
  'Lexin Acara': 'acara',
  'Lexin Partisipasi': 'partisipasi',
  'Lexin Wawasan': 'wawasan',
  'Lexin Kontak': 'kontak',
};

/**
 * Translate a prototype link (`Lexin Riset.dc.html#area-1`) into a real route.
 * External links and mailto: pass through unchanged.
 */
export function link(lang: Lang, href: string): string {
  const m = href.match(/^Lexin ([A-Za-z0-9 ]+)\.dc\.html(?:#(.*))?$/);
  if (!m) return href;
  const name = 'Lexin ' + m[1];
  const hash = m[2];
  if (name === 'Lexin Profil') return url(lang, 'anggota/' + (hash ?? '') + (hash ? '/' : ''));
  if (name === 'Lexin Wawasan Artikel') return url(lang, 'wawasan/' + (hash ?? '') + (hash ? '/' : ''));
  const route = PROTO[name] ?? '';
  return url(lang, (route ? route + '/' : '') + (hash ? '#' + hash : ''));
}

export const NAV_ROUTES = ['riset', 'produk', 'anggota', 'publikasi', 'acara', 'partisipasi', 'wawasan'] as const;

const MONTHS = {
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** `2026-09-15` → `15 Sep 2026` (id) / `Sep 15, 2026` (en). */
export function fmtDate(d: string, lang: Lang): string {
  const [y, m, dd] = d.split('-').map(Number);
  const M = MONTHS[lang];
  return lang === 'id' ? `${dd} ${M[m - 1]} ${y}` : `${M[m - 1]} ${dd}, ${y}`;
}
