// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pages from the previous (WordPress) site, which was in English, mapped to their nearest
// page on this site. Each key also covers `<key>/` and `<key>/index.html` on a static host.
const OLD_SITE = {
  '/research': '/en/riset/',
  '/products': '/en/produk/',
  '/people': '/en/anggota/',
  '/personnel': '/en/anggota/',
  '/personnel/panca': '/en/anggota/panca-hadi-putra/',
  '/personnel/adila': '/en/anggota/adila-alfa-krisnadhi/',
  '/personnel/alfan': '/en/anggota/alfan-farizki-wicaksono/',
  '/personnel/mahendra': '/en/anggota/rahmad-mahendra/',
  '/personnel/indra-budi': '/en/anggota/indra-budi/',
  '/publication-news': '/en/publikasi/',
  '/tag/publication': '/en/publikasi/',
  '/contact-us': '/en/kontak/',
  '/lexid-the-metadata-and-semantic-knowledge-graph-construction-of-indonesian-legal-document': '/en/wawasan/lexid-knowledge-graph/',
  '/legalbench-prototyping-a-collaborative-benchmark-for-legal-reasoning': '/en/wawasan/klasifikasi-putusan-pengadilan-pajak/',
  '/2020/06/21': '/en/wawasan/lexid-knowledge-graph/',
  '/2020/05/07': '/en/wawasan/klasifikasi-putusan-pengadilan-pajak/',
};

// Static site. Bahasa Indonesia lives at `/`, English at `/en/…`.
export default defineConfig({
  site: 'https://lexin.cs.ui.ac.id',
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  redirects: OLD_SITE,
  integrations: [
    sitemap({
      // Link each Indonesian page to its English twin (hreflang) in the sitemap too.
      i18n: { defaultLocale: 'id', locales: { id: 'id-ID', en: 'en-US' } },
      filter: (page) => !Object.keys(OLD_SITE).some((from) => new URL(page).pathname.replace(/\/$/, '') === from),
    }),
  ],
});
