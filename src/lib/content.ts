import membersData from '../data/members.json';
import postsData from '../data/posts.json';
import type { Lang } from './i18n';

export type Member = (typeof membersData)[number] & Record<string, any>;
export type Post = (typeof postsData)[number] & Record<string, any>;

export const members = membersData as Member[];
export const posts = postsData as Post[];

export type Pub = { year: string; title: string; venue: string; href?: string; authors: string[] };

/** Every publication across members, deduplicated by title (case-insensitive), with its authors. */
export function allPubs(): Pub[] {
  const out: Pub[] = [];
  for (const m of members) {
    for (const p of (m.pubs ?? []) as any[]) {
      const hit = out.find((x) => x.title.toLowerCase() === p.title.toLowerCase());
      if (hit) { if (!hit.authors.includes(m.slug)) hit.authors.push(m.slug); }
      else out.push({ ...p, authors: [m.slug] });
    }
  }
  return out;
}

/** Newest posts first. */
export function postsByDate(): Post[] {
  return posts.slice().sort((a, b) => b.date.localeCompare(a.date));
}

/** Coarse publication type from the venue string (same rule as the prototypes). */
export function pubKind(venue: string): 'book' | 'journal' | 'conf' {
  if (/springer|handbuch/i.test(venue)) return 'book';
  if (/journal|heliyon|procedia|communications|processing & management|intelligence|technologies|medical informatics/i.test(venue)) return 'journal';
  return 'conf';
}

export function initials(m: Member): string {
  return m.ini ?? m.name.split(' ').map((s: string) => s[0]).slice(0, 2).join('');
}

export function pick<T>(v: { id: T; en: T } | T, lang: Lang): T {
  return v && typeof v === 'object' && 'id' in (v as any) ? (v as any)[lang] ?? (v as any).id : (v as T);
}
