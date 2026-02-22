// api/share.ts — Vercel Edge Function
// Serves index.html to ALL clients (bots + humans) with OG tags injected.
// Bots read the OG tags; humans get the Vite SPA which React Router handles.
// No bot detection → no redirect loops on WhatsApp/Telegram in-app browsers.

export const config = { runtime: 'edge' };

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
    canonicalUrl: string;
    type: 'article' | 'website';
}

function esc(s: string) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function getPostMeta(postId: string, slug: string, origin: string): Promise<Meta> {
    const canonicalUrl = `${origin}/blog/${slug}/post/${postId}`;
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
            canonicalUrl,
            type: 'article',
        };
    } catch {
        return {
            title: 'Press Room Publisher',
            description: 'Read this article on Press Room Publisher.',
            image: FALLBACK_IMAGE,
            canonicalUrl,
            type: 'article',
        };
    }
}

async function getBlogMeta(slug: string, origin: string): Promise<Meta> {
    const canonicalUrl = `${origin}/blog/${slug}`;
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
            canonicalUrl,
            type: 'website',
        };
    } catch {
        return {
            title: 'Press Room Publisher',
            description: 'A publication on Press Room Publisher.',
            image: FALLBACK_IMAGE,
            canonicalUrl,
            type: 'website',
        };
    }
}

// Cache the SPA shell per edge instance to avoid refetching on every request
let cachedIndex: string | null = null;

async function getSpaShell(origin: string): Promise<string> {
    if (cachedIndex) return cachedIndex;
    const res = await fetch(`${origin}/index.html`);
    cachedIndex = await res.text();
    return cachedIndex;
}

/** Replace the generic OG/Twitter meta tags in index.html with page-specific ones */
function injectOgTags(html: string, meta: Meta): string {
    return html
        .replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)} — Press Room Publisher</title>`)
        .replace(/<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${esc(meta.title)}" />`)
        .replace(/<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${esc(meta.description)}" />`)
        .replace(/<meta property="og:image"[^>]*\/>/, `<meta property="og:image" content="${esc(meta.image)}" />`)
        .replace(/<meta property="og:type"[^>]*\/>/, `<meta property="og:type" content="${meta.type}" />`)
        .replace(/<meta name="twitter:card"[^>]*\/>/, `<meta name="twitter:card" content="summary_large_image" />`)
        .replace(/<meta name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${esc(meta.title)}" />`)
        .replace(/<meta name="twitter:description"[^>]*\/>/, `<meta name="twitter:description" content="${esc(meta.description)}" />`)
        .replace(/<meta name="twitter:image"[^>]*\/>/, `<meta name="twitter:image" content="${esc(meta.image)}" />`);
}

export default async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const type = url.searchParams.get('type'); // 'post' | 'blog' — injected by vercel.json rewrite
    const slug = url.searchParams.get('slug') ?? '';
    const id = url.searchParams.get('id') ?? '';

    // Fetch the SPA shell and the page-specific meta in parallel
    const [shell, meta] = await Promise.all([
        getSpaShell(url.origin),
        type === 'post' && id
            ? getPostMeta(id, slug, url.origin)
            : type === 'blog' && slug
                ? getBlogMeta(slug, url.origin)
                : Promise.resolve(null as Meta | null),
    ]);

    const html = meta ? injectOgTags(shell, meta) : shell;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            // Short CDN cache so edits appear quickly; bots re-crawl after 5 min
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
    });
}
