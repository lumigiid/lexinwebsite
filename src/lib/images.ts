import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

// Photos live in src/assets so Astro can resize them and convert them to WebP at build time.
const all = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{png,jpg,jpeg,webp}', { eager: true });

/** `assets/people/x.png` (path as written in the content JSON) → optimised URL. */
export async function img(path: string, width = 960): Promise<string> {
  const key = '/src/' + path.replace(/^\/?(src\/)?/, '');
  const mod = all[key];
  if (!mod) throw new Error(`Image not found in src/assets: ${path}`);
  const out = await getImage({ src: mod.default, width: Math.min(width, mod.default.width), format: 'webp' });
  return out.src;
}

/** Like `img`, but falls back to a plain public URL for files kept in `public/` (logos). */
export async function imgOrPublic(path: string, width = 960): Promise<string> {
  const key = '/src/' + path.replace(/^\/?(src\/)?/, '');
  if (all[key]) return img(path, width);
  return import.meta.env.BASE_URL.replace(/\/?$/, '/') + path.replace(/^\//, '');
}
