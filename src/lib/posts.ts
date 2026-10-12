// Shared view-model for Wawasan (insights) posts, used by the index and the article pages.
import { members, type Post } from './content';
import { url, link, type Lang } from './i18n';
import { imgOrPublic } from './images';

export const TYPES: Record<string, { id: string; en: string; bg: string; fg: string; panel: string; ink: string }> = {
  opinion: { id: 'Artikel & opini', en: 'Articles & opinion', bg: 'var(--navy-50)', fg: 'var(--navy-700)', panel: 'var(--grad-mist)', ink: 'var(--navy-500)' },
  brief: { id: 'Policy brief', en: 'Policy brief', bg: 'var(--yellow-100)', fg: 'var(--navy-900)', panel: 'var(--grad-mist)', ink: 'var(--navy-700)' },
  explainer: { id: 'Penjelasan riset', en: 'Research explainer', bg: 'var(--navy-50)', fg: 'var(--navy-700)', panel: 'var(--grad-mist)', ink: 'var(--navy-500)' },
  release: { id: 'Catatan rilis produk', en: 'Product release notes', bg: 'var(--red-50)', fg: 'var(--red-700)', panel: 'var(--grad-night)', ink: 'var(--yellow-300)' },
  event: { id: 'Liputan acara', en: 'Event coverage', bg: 'var(--navy-50)', fg: 'var(--navy-700)', panel: 'var(--grad-night)', ink: 'var(--yellow-300)' },
};

const AV: Record<string, string> = { lead: 'var(--grad-signature)', fac: 'linear-gradient(135deg,var(--navy-500),var(--navy-700))', staff: 'linear-gradient(135deg,var(--red-500),var(--red-700))' };

const MONTHS = {
  id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
export const fmtLongDate = (d: string, lang: Lang) => {
  const [y, m, dd] = d.split('-').map(Number);
  return lang === 'id' ? `${dd} ${MONTHS.id[m - 1]} ${y}` : `${MONTHS.en[m - 1]} ${dd}, ${y}`;
};

export async function postView(p: Post, lang: Lang) {
  const T = TYPES[p.type];
  const photo = p.photo ? await imgOrPublic(p.photo, 1400) : '';
  return {
    slug: p.slug, type: p.type, date: p.date, icon: p.icon as string,
    title: p.title[lang] as string, dek: p.dek[lang] as string, body: p.body[lang] as string[],
    photoBg: photo ? `url("${photo}") ${p.photoPos || 'center'}/${p.photoSize || 'cover'} no-repeat${p.photoSize ? ', ' + (p.photoFill || T.panel) : ''}` : 'none',
    typeLabel: T[lang], typeBg: T.bg, typeFg: T.fg, panel: T.panel, ink: T.ink,
    dateLabel: fmtLongDate(p.date, lang), href: url(lang, 'wawasan/' + p.slug + '/'),
    authors: (p.people as string[]).map((s) => {
      const m = members.find((x) => x.slug === s)!;
      return { name: m.name, ini: m.ini, avBg: AV[m.g], href: url(lang, 'anggota/' + s + '/') };
    }),
    sources: p.sources as { name: string; href: string }[],
    srcLabel: (p.sources as any[]).map((s) => s.name).join(' · '),
    link: p.link ? { label: p.link.label[lang] as string, href: link(lang, p.link.href) } : null,
    gallery: await Promise.all(((p.gallery || []) as any[]).map(async (x) => ({
      cap: x.cap[lang] as string, ratio: x.ratio || '16/9',
      bg: `url("${await imgOrPublic(x.src, 1400)}") center/${x.fit || 'cover'} no-repeat${x.fit ? ', #FFFFFF' : ''}`,
    }))),
  };
}
