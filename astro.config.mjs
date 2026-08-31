import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// --- lastmod ---------------------------------------------------------------
// Built once at config load. Reading the filesystem per URL inside serialize()
// would stat the same files 108 times.
const SITE = 'https://www.executiveaiinstitute.com';

function isoDay(d) {
  return new Date(d).toISOString().slice(0, 10);
}

const lastmods = new Map();

// Insights: the post's own pubDate, which is what the page displays.
for (const f of fs.readdirSync('src/content/blog')) {
  if (!f.endsWith('.md')) continue;
  const head = fs.readFileSync(`src/content/blog/${f}`, 'utf8').split('---')[1] ?? '';
  const m = head.match(/^pubDate:\s*"?([0-9]{4}-[0-9]{2}-[0-9]{2})/m);
  if (m) lastmods.set(`${SITE}/insights/${f.replace(/\.md$/, '')}/`, m[1]);
}

// Static pages: the mtime of the .astro file behind the route.
for (const f of fs.readdirSync('src/pages')) {
  if (!f.endsWith('.astro')) continue;
  const name = f.replace(/\.astro$/, '');
  const url = name === 'index' ? `${SITE}/` : `${SITE}/${name}/`;
  lastmods.set(url, isoDay(fs.statSync(`src/pages/${f}`).mtime));
}
for (const f of ['index.astro']) {
  const p = `src/pages/insights/${f}`;
  if (fs.existsSync(p)) lastmods.set(`${SITE}/insights/`, isoDay(fs.statSync(p).mtime));
}

// trailingSlash: 'ignore' means the sitemap may emit either spelling.
function lastmodFor(url) {
  return lastmods.get(url) ?? lastmods.get(url.endsWith('/') ? url.slice(0, -1) : `${url}/`);
}



// Production domain: www.executiveaiinstitute.com (public/CNAME). DNS is held
// by Jonscott; the Squarespace records point here once cut over from Wix.
export default defineConfig({
  site: 'https://www.executiveaiinstitute.com',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // lastmod per URL. Without it every one of the 108 entries looks
      // equally stale on every crawl, which is the same as telling a crawler
      // nothing. An insight uses its own pubDate; a static page uses the
      // mtime of the .astro file that produces it. Never `new Date()` for
      // everything -- that claims the whole site changed on every build.
      serialize(item) {
        const stamp = lastmodFor(item.url);
        if (stamp) item.lastmod = stamp;
        return item;
      },
    }),
  ],
});
