// @ts-check
import { defineConfig } from 'astro/config';

// Static site. Bahasa Indonesia lives at `/`, English at `/en/…`.
export default defineConfig({
  site: 'https://lexin.cs.ui.ac.id',
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
