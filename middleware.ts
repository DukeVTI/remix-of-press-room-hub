// Vercel Edge Middleware — no Next.js imports needed (pure Web API)
// Intercepts bot/crawler requests to /blog/* and injects dynamic OG meta tags.

const BOT_UA =
    /facebookexternalhit|facebookbot|twitterbot|whatsapp|linkedinbot|slackbot|discordbot|telegrambot|pinterest|redditbot|googlebot|bingbot|applebot|duckduckbot|crawler|spider|prerender/i;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY as string;

const SUPABASE_HEADERS: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

interface MetaData {
    title: string;
    description: string;
    ogImageUrl: string;
    url: string;
    type: 'article' | 'website';
    blogName?: string;
}

async function getPostMeta(postId: string, baseUrl: string): Promise<MetaData> {
    const fallback: MetaData = {
        title: 'Press Room Publisher',
        description: 'Read this article on Press Room Publisher.',
        ogImageUrl: `${baseUrl}/api/og?type=post&id=${postId}`,
        url: `${baseUrl}/`,
        type: 'article',
    };
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}&status=eq.published&select=headline,subtitle,content,blogs(blog_name,slug)&limit=1`,
            { headers: SUPABASE_HEADERS }
        );
        const data: any[] = await res.json();
        const post = data[0];
        if (!post) return fallback;
        return {
            title: post.headline ?? fallback.title,
            description: post.subtitle ?? post.content?.slice(0, 160) ?? fallback.description,
            ogImageUrl: `${baseUrl}/api/og?type=post&id=${postId}`,
            url: `${baseUrl}/blog/${post.blogs?.slug ?? ''}/post/${postId}`,
            type: 'article',
            blogName: post.blogs?.blog_name,
        };
    } catch {
        return fallback;
    }
}

async function getBlogMeta(slug: string, baseUrl: string): Promise<MetaData> {
    const fallback: MetaData = {
        title: 'Press Room Publisher',
        description: 'A publication on Press Room Publisher.',
        ogImageUrl: `${baseUrl}/api/og?type=blog&slug=${slug}`,
        url: `${baseUrl}/blog/${slug}`,
        type: 'website',
    };
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/blogs?slug=eq.${slug}&status=eq.active&select=blog_name,description&limit=1`,
            { headers: SUPABASE_HEADERS }
        );
        const data: any[] = await res.json();
        const blog = data[0];
        if (!blog) return fallback;
        return {
            title: blog.blog_name ?? fallback.title,
            description: blog.description ?? fallback.description,
            ogImageUrl: `${baseUrl}/api/og?type=blog&slug=${slug}`,
            url: `${baseUrl}/blog/${slug}`,
            type: 'website',
        };
    } catch {
        return fallback;
    }
}

function esc(s: string) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function buildBotHtml(meta: MetaData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}" />

  <!-- Open Graph -->
  <meta property="og:title" content="${esc(meta.title)}" />
  <meta property="og:description" content="${esc(meta.description)}" />
  <meta property="og:image" content="${esc(meta.ogImageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${esc(meta.url)}" />
  <meta property="og:type" content="${meta.type}" />
  <meta property="og:site_name" content="Press Room Publisher" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(meta.title)}" />
  <meta name="twitter:description" content="${esc(meta.description)}" />
  <meta name="twitter:image" content="${esc(meta.ogImageUrl)}" />

  ${meta.blogName ? `<meta property="article:publisher" content="${esc(meta.blogName)}" />` : ''}

  <!-- Redirect real users to the SPA immediately -->
  <meta http-equiv="refresh" content="0; url=${esc(meta.url)}" />
</head>
<body>
  <p>Redirecting to <a href="${esc(meta.url)}">${esc(meta.title)}</a>&hellip;</p>
</body>
</html>`;
}

export default async function middleware(request: Request): Promise<Response | undefined> {
    const ua = request.headers.get('user-agent') ?? '';

    // Pass through for non-bots — Vercel serves index.html via the rewrite rule
    if (!BOT_UA.test(ua)) return undefined;

    const url = new URL(request.url);
    const path = url.pathname;
    const baseUrl = `${url.protocol}//${url.host}`;

    // /blog/:slug/post/:postId
    const postMatch = path.match(/^\/blog\/([^/]+)\/post\/([^/]+)/);
    if (postMatch) {
        const postId = postMatch[2];
        const meta = await getPostMeta(postId, baseUrl);
        return new Response(buildBotHtml(meta), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    }

    // /blog/:slug
    const blogMatch = path.match(/^\/blog\/([^/]+)(?:\/|$)/);
    if (blogMatch) {
        const slug = blogMatch[1];
        const meta = await getBlogMeta(slug, baseUrl);
        return new Response(buildBotHtml(meta), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    }

    return undefined;
}

export const config = {
    matcher: ['/blog/:path*'],
};
