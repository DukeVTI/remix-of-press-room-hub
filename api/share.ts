// api/share.ts — Vercel Edge Function
// Explicitly routed from /blog/* in vercel.json.
// Bots get OG-enriched HTML; humans get the SPA index.html.

export const config = { runtime: 'edge' };

const BOT_UA =
    /facebookexternalhit|facebookbot|twitterbot|whatsapp|linkedinbot|slackbot|discordbot|telegrambot|pinterest|redditbot|googlebot|bingbot|applebot|duckduckbot|crawler|spider|prerender/i;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY as string;

const DB_HEADERS: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

const FALLBACK_IMAGE =
    'https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/cropped-PRP-ICON_-transparetn-32x32.png';

interface Meta {
    title: string;
    description: string;
    image: string;
    url: string;
    type: 'article' | 'website';
}

function esc(s: string) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function getPostMeta(postId: string, canonicalUrl: string): Promise<Meta> {
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}&status=eq.published` +
            `&select=headline,subtitle,content,blogs(blog_name,profile_photo_url)&limit=1`,
            { headers: DB_HEADERS }
        );
        const [post] = (await res.json()) as any[];
        if (!post) throw new Error('not found');
        return {
            title: post.headline || 'Press Room Publisher',
            description:
                post.subtitle ||
                (post.content || '').replace(/<[^>]*>/g, '').slice(0, 160) ||
                'Read this article on Press Room Publisher.',
            image: post.blogs?.profile_photo_url || FALLBACK_IMAGE,
            url: canonicalUrl,
            type: 'article',
        };
    } catch {
        return {
            title: 'Press Room Publisher',
            description: 'Read this article on Press Room Publisher.',
            image: FALLBACK_IMAGE,
            url: canonicalUrl,
            type: 'article',
        };
    }
}

async function getBlogMeta(slug: string, canonicalUrl: string): Promise<Meta> {
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/blogs?slug=eq.${slug}&status=eq.active` +
            `&select=blog_name,description,profile_photo_url&limit=1`,
            { headers: DB_HEADERS }
        );
        const [blog] = (await res.json()) as any[];
        if (!blog) throw new Error('not found');
        return {
            title: blog.blog_name || 'Press Room Publisher',
            description: blog.description || 'A publication on Press Room Publisher.',
            image: blog.profile_photo_url || FALLBACK_IMAGE,
            url: canonicalUrl,
            type: 'website',
        };
    } catch {
        return {
            title: 'Press Room Publisher',
            description: 'A publication on Press Room Publisher.',
            image: FALLBACK_IMAGE,
            url: canonicalUrl,
            type: 'website',
        };
    }
}

function buildOgHtml(meta: Meta): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}" />
  <meta property="og:title" content="${esc(meta.title)}" />
  <meta property="og:description" content="${esc(meta.description)}" />
  <meta property="og:image" content="${esc(meta.image)}" />
  <meta property="og:url" content="${esc(meta.url)}" />
  <meta property="og:type" content="${meta.type}" />
  <meta property="og:site_name" content="Press Room Publisher" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(meta.title)}" />
  <meta name="twitter:description" content="${esc(meta.description)}" />
  <meta name="twitter:image" content="${esc(meta.image)}" />
  <meta http-equiv="refresh" content="0; url=${esc(meta.url)}" />
</head>
<body>
  <p>Redirecting to <a href="${esc(meta.url)}">${esc(meta.title)}</a>&hellip;</p>
</body>
</html>`;
}

// Cache the SPA shell across edge function invocations
let cachedIndex: string | null = null;

async function getSpaShell(origin: string): Promise<string> {
    if (cachedIndex) return cachedIndex;
    const res = await fetch(`${origin}/index.html`);
    cachedIndex = await res.text();
    return cachedIndex;
}

export default async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const ua = req.headers.get('user-agent') ?? '';

    // ── Human user: serve the Vite SPA shell so React Router takes over ──
    if (!BOT_UA.test(ua)) {
        const html = await getSpaShell(url.origin);
        return new Response(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=0, must-revalidate',
            },
        });
    }

    // ── Bot / crawler: serve OG-enriched HTML ──
    const postMatch = path.match(/^\/blog\/([^/]+)\/post\/([^/]+)/);
    if (postMatch) {
        const meta = await getPostMeta(postMatch[2], url.href);
        return new Response(buildOgHtml(meta), {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
            },
        });
    }

    const blogMatch = path.match(/^\/blog\/([^/]+)(?:\/|$)/);
    if (blogMatch) {
        const meta = await getBlogMeta(blogMatch[1], url.href);
        return new Response(buildOgHtml(meta), {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
            },
        });
    }

    // Fallback: serve SPA
    const html = await getSpaShell(url.origin);
    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
