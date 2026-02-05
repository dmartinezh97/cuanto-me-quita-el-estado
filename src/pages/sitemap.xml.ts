import type { APIRoute } from 'astro';
import { ALL_COMMUNITIES } from '@fiscal/constants';

/**
 * Genera el sitemap.xml dinámicamente.
 *
 * Incluye:
 * - Página principal
 * - Páginas de políticas
 * - Páginas dinámicas por CCAA (cuando se implementen)
 * - Páginas de comparadores (cuando se implementen)
 * - Páginas de profesiones (cuando se implementen)
 * - Blog posts (cuando se implementen)
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
      url: `${SITE_URL}/politica-cookies`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/politica-privacidad`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terminos-condiciones`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.3,
    }
  );

  // Páginas por CCAA (alta prioridad para SEO)
  ALL_COMMUNITIES.forEach((community) => {
    const slug = community.id.replace(/_/g, '-'); // Convert underscores to hyphens for URLs
    entries.push({
      url: `${SITE_URL}/${slug}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.9,
    });
  });

  // Generar comparadores (pares más relevantes)
  // TODO: Cuando se cree comparisons.json, leer desde ahí
  const topComparisons = [
    'madrid-vs-barcelona',
    'madrid-vs-pais-vasco',
    'madrid-vs-cataluna',
    'barcelona-vs-valencia',
    'andalucia-vs-madrid',
  ];

  topComparisons.forEach((comparison) => {
    entries.push({
      url: `${SITE_URL}/comparador/${comparison}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.8,
    });
  });

  // TODO: Añadir páginas de profesiones cuando se implementen
  // TODO: Añadir blog posts cuando se implementen

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
