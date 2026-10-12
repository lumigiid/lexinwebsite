# Lexin website

The website of Lexin, the Center for Legal Informatics at Universitas Indonesia. It is a static Astro site built from the Claude Design handoff package. It is bilingual: Indonesian at `/`, English at `/en/`.

## Run it

You need Node 22.12 or newer (Astro 7 requires it).

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
```

`dist/` is plain HTML, CSS and JS, so any static host can serve it (an nginx/Apache docroot, GitHub Pages, Netlify and so on). The canonical domain is set in `astro.config.mjs` (`site`).

## Pages

| Indonesian | English | View |
|---|---|---|
| `/` | `/en/` | `src/views/HomePage.astro` |
| `/riset/` | `/en/riset/` | `RisetPage.astro` |
| `/produk/` | `/en/produk/` | `ProdukPage.astro` |
| `/anggota/` | `/en/anggota/` | `AnggotaPage.astro` |
| `/anggota/{slug}/` | `/en/anggota/{slug}/` | `ProfilPage.astro` (one per member) |
| `/publikasi/` | `/en/publikasi/` | `PublikasiPage.astro` |
| `/acara/` | `/en/acara/` | `AcaraPage.astro` |
| `/partisipasi/` | `/en/partisipasi/` | `PartisipasiPage.astro` |
| `/wawasan/` | `/en/wawasan/` | `WawasanPage.astro` |
| `/wawasan/{slug}/` | `/en/wawasan/{slug}/` | `ArtikelPage.astro` (one per post) |
| `/kontak/` | `/en/kontak/` | `KontakPage.astro` |

Each file in `src/pages/` is a thin route that renders a view with `lang="id"` or `lang="en"`.

## Where things live

```
src/
  data/          content: edit these to change the site
    i18n.json             all UI copy per page, in id and en
    members.json          people, bios, education, publications
    posts.json            Wawasan posts (body, sources, photos, gallery)
    publication-layers.json  maps publications to research layers for the Publikasi filter
  assets/        photos (optimised to WebP at build time)
  views/         one component per page
  components/    Header, Footer, PageHeader, Button, Icon, Badge, IconButton
  layouts/       BaseLayout (meta, hreflang, fonts, header and footer)
  lib/           i18n helpers, content helpers, image helper
  styles/        design tokens (from the design system) and global CSS
public/assets/   logos, partner logos, product videos (served as-is)
```

### Common edits

- **Add a person**: add an entry to `src/data/members.json` and put the photo in `src/assets/people/`. The profile page is generated automatically.
- **Add a Wawasan post**: add an entry to `src/data/posts.json` (with `id` and `en` text) and the photo in `src/assets/wawasan/`. It appears on `/wawasan/`, gets its own page, and shows on the home page's "Terbaru" list if it's recent.
- **Add a publication**: add it to the member's `pubs` in `members.json`. The Publikasi page de-duplicates by title across co-authors. To tag it with a research layer, add a line to `publication-layers.json`.
- **Change copy**: `src/data/i18n.json`, under the page's key.
- **Icons**: any [Lucide](https://lucide.dev/icons/) name works with `<Icon name="…" />`. Icons are inlined at build time.

## Choices made where the handoff was silent

- English pages use the same Indonesian slugs (`/en/anggota/`, not `/en/people/`).
- Photos are converted to WebP at build time with `astro:assets`.
- The two member files in the package were merged, so each profile shows the fuller publication list.
- The Anggota filter is on, as the README asked (the prototype had it off). Turn it off with `SHOW_FILTER` at the top of `AnggotaPage.astro`.
- Publikasi lists journal, conference and book items, as the prototype does. Draft white papers are only on Riset, requested by email.
- No forms anywhere: Partisipasi and Kontak open an email with the subject prefilled.
- Event dates on Acara are hidden until confirmed (`date` in `i18n.json → acara.events`).
- Fonts load from Google Fonts. No analytics or tracking are included.
