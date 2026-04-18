// generate-sitemap.js
// Runs before 'vite build' to fetch live data and write public/sitemap.xml

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BACKEND_URL = "https://nexa-backend-xyul.onrender.com";
const BASE_URL = "https://nexainfotech.com";
const OUTPUT_PATH = path.join(__dirname, "public", "sitemap.xml");

const STATIC_PAGES = [
  { path: "",         priority: "1.0", changefreq: "daily"   },
  { path: "/about",   priority: "0.8", changefreq: "monthly" },
  { path: "/blog",    priority: "0.8", changefreq: "weekly"  },
  { path: "/gallery", priority: "0.7", changefreq: "monthly" },
  { path: "/portfolio", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
];

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } catch (err) {
    console.warn(`⚠️  Could not fetch ${url}: ${err.message}`);
    return null;
  }
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    lastmod    ? `    <lastmod>${lastmod}</lastmod>` : "",
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : "",
    priority   ? `    <priority>${priority}</priority>` : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function generate() {
  console.log("🗺️  Generating sitemap.xml ...");

  let urls = [];

  // 1. Static pages
  for (const page of STATIC_PAGES) {
    urls.push(urlEntry({
      loc: `${BASE_URL}${page.path}`,
      changefreq: page.changefreq,
      priority: page.priority,
    }));
  }

  // 2. Services (dynamic)
  const servicesData = await fetchJSON(`${BACKEND_URL}/api/services`);
  const services = servicesData?.data || servicesData?.services || (Array.isArray(servicesData) ? servicesData : []);
  for (const s of services) {
    if (!s.slug) continue;
    const slug = s.slug.startsWith("/") ? s.slug : `/${s.slug}`;
    urls.push(urlEntry({
      loc: `${BASE_URL}${slug}`,
      lastmod: s.updatedAt ? s.updatedAt.split("T")[0] : undefined,
      changefreq: "weekly",
      priority: "0.9",
    }));
  }
  console.log(`  ✅ Services: ${services.length}`);

  // 3. Blogs (dynamic)
  const blogsData = await fetchJSON(`${BACKEND_URL}/api/blogs`);
  const blogs = blogsData?.data || blogsData?.blogs || (Array.isArray(blogsData) ? blogsData : []);
  for (const b of blogs) {
    const id = b.slug || b._id;
    if (!id) continue;
    urls.push(urlEntry({
      loc: `${BASE_URL}/blog/${id}`,
      lastmod: b.updatedAt ? b.updatedAt.split("T")[0] : undefined,
      changefreq: "weekly",
      priority: "0.7",
    }));
  }
  console.log(`  ✅ Blogs: ${blogs.length}`);

  console.log(`  ℹ️  Custom Pages: skipped (add /api/pages route later if needed)`);

  // Build XML
  const today = new Date().toISOString().split("T")[0];
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>`,
    `<!-- Generated: ${today} | URLs: ${urls.length} -->`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");

  fs.writeFileSync(OUTPUT_PATH, xml, "utf-8");
  console.log(`\n✅ sitemap.xml written → ${OUTPUT_PATH}`);
  console.log(`   Total URLs: ${urls.length}`);
}

generate().catch((err) => {
  console.error("❌ Sitemap generation failed:", err);
  process.exit(1);
});
