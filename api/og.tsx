import { ImageResponse } from '@vercel/og';


const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY as string;

const PRP_LOGO =
    'https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/cropped-PRP-ICON_-transparetn-32x32.png';

const supabaseHeaders = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

async function fetchPost(id: string) {
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}&status=eq.published&select=headline,subtitle,content,blogs(blog_name,profile_photo_url)&limit=1`,
            { headers: supabaseHeaders }
        );
        const data = await res.json();
        return data[0] ?? null;
    } catch {
        return null;
    }
}

async function fetchBlog(slug: string) {
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/blogs?slug=eq.${slug}&status=eq.active&select=blog_name,description,profile_photo_url,follower_count&limit=1`,
            { headers: supabaseHeaders }
        );
        const data = await res.json();
        return data[0] ?? null;
    } catch {
        return null;
    }
}

function truncate(str: string, max: number) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export default async function handler(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // 'post' | 'blog'
        const id = searchParams.get('id');
        const slug = searchParams.get('slug');

        let title = 'Press Room Publisher';
        let subtitle = 'Your trusted source for news and stories';
        let blogName = 'Press Room Publisher';
        let photoUrl: string | null = null;

        if (type === 'post' && id) {
            const post = await fetchPost(id);
            if (post) {
                title = post.headline ?? title;
                subtitle = post.subtitle ?? post.content?.slice(0, 140) ?? '';
                blogName = post.blogs?.blog_name ?? blogName;
                photoUrl = post.blogs?.profile_photo_url ?? null;
            }
        } else if (type === 'blog' && slug) {
            const blog = await fetchBlog(slug);
            if (blog) {
                title = blog.blog_name ?? title;
                subtitle = blog.description ?? '';
                blogName = blog.blog_name ?? blogName;
                photoUrl = blog.profile_photo_url ?? null;
            }
        }

        const displayTitle = truncate(title, 72);
        const displaySubtitle = truncate(subtitle, 130);
        const displayBlogName = truncate(blogName, 40);

        return new ImageResponse(
            (
                <div
                    style={{
                        width: '1200px',
                        height: '630px',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 60%, #0d1117 100%)',
                        padding: '56px 64px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background glow */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-80px',
                            right: '-80px',
                            width: '400px',
                            height: '400px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                        }}
                    />

                    {/* Header: logo + brand */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '44px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={PRP_LOGO}
                            width={36}
                            height={36}
                            style={{ borderRadius: '8px' }}
                        />
                        <span
                            style={{
                                color: '#94a3b8',
                                fontSize: '15px',
                                marginLeft: '12px',
                                letterSpacing: '3px',
                                textTransform: 'uppercase',
                                fontFamily: 'sans-serif',
                            }}
                        >
                            Press Room Publisher
                        </span>
                    </div>

                    {/* Main content row */}
                    <div style={{ display: 'flex', flex: 1, gap: '48px', alignItems: 'center' }}>
                        {/* Text column */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {type === 'post' && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '18px',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '4px',
                                            height: '20px',
                                            background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                                            borderRadius: '2px',
                                            marginRight: '10px',
                                        }}
                                    />
                                    <span
                                        style={{
                                            color: '#a78bfa',
                                            fontSize: '16px',
                                            fontFamily: 'sans-serif',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {displayBlogName}
                                    </span>
                                </div>
                            )}

                            <div
                                style={{
                                    fontSize: '52px',
                                    fontWeight: '800',
                                    color: '#f1f5f9',
                                    lineHeight: 1.15,
                                    marginBottom: '20px',
                                    fontFamily: 'Georgia, serif',
                                }}
                            >
                                {displayTitle}
                            </div>

                            {displaySubtitle && (
                                <div
                                    style={{
                                        fontSize: '21px',
                                        color: '#94a3b8',
                                        lineHeight: 1.55,
                                        fontFamily: 'sans-serif',
                                    }}
                                >
                                    {displaySubtitle}
                                </div>
                            )}
                        </div>

                        {/* Photo */}
                        {photoUrl && (
                            <div
                                style={{
                                    display: 'flex',
                                    flexShrink: 0,
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={photoUrl}
                                    width={210}
                                    height={210}
                                    style={{
                                        borderRadius: '20px',
                                        objectFit: 'cover',
                                        border: '3px solid rgba(99,102,241,0.4)',
                                        boxShadow: '0 0 40px rgba(99,102,241,0.25)',
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Bottom accent bar */}
                    <div
                        style={{
                            height: '4px',
                            background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                            borderRadius: '2px',
                            marginTop: '40px',
                        }}
                    />
                </div>
            ),
            { width: 1200, height: 630 }
        );
    } catch (err) {
        console.error('OG image error:', err);
        return new Response('Failed to generate image', { status: 500 });
    }
}
