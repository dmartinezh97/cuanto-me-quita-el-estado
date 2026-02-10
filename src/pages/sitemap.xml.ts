import type { APIRoute } from 'astro';
import { ALL_COMMUNITIES } from '@fiscal/constants';
import comparisonsData from '../data/comparisons.json';
import professionsData from '../data/professions.json';

/**
 * Genera el sitemap.xml dinámicamente.
 *
 * Incluye:
 * - Página principal
 * - Páginas de políticas
 * - Páginas dinámicas por CCAA
 * - Páginas de comparadores
 * - Páginas de profesiones
 * - Blog posts
 */

const SITE_URL = 'https://cuantomequitaelestado.com';

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const GET: APIRoute = () => {
  const entries: SitemapEntry[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Página principal (máxima prioridad)
  entries.push({
    url: `${SITE_URL}/`,
    lastmod: today,
    changefreq: 'weekly',
    priority: 1.0,
  });

  // Páginas de políticas
  entries.push(
    {
      url: `${SITE_URL}/politica-cookies/`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/politica-privacidad/`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terminos-condiciones/`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.3,
    }
  );

  // Páginas por CCAA (alta prioridad para SEO)
  ALL_COMMUNITIES.forEach((community) => {
    const slug = community.id.replace(/_/g, '-');
    entries.push({
      url: `${SITE_URL}/${slug}/`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.9,
    });
  });

  // Páginas de comparadores (desde JSON)
  comparisonsData.comparisons.forEach((comparison: { slug: string }) => {
    entries.push({
      url: `${SITE_URL}/comparador/${comparison.slug}/`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.8,
    });
  });

  // Páginas de profesiones (desde JSON)
  professionsData.professions.forEach((profession: { slug: string }) => {
    entries.push({
      url: `${SITE_URL}/profesion/${profession.slug}/`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.8,
    });
  });

  // Blog posts
  const blogPosts = [
    'guia-irpf-2026',
    'que-es-tipo-marginal',
    'ccaa-menos-impuestos',
  ];

  blogPosts.forEach((post) => {
    entries.push({
      url: `${SITE_URL}/blog/${post}/`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7,
    });
  });

  // Generar XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
