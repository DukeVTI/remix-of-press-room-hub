import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";
import { cn } from "@/lib/utils";

// ── Live WordPress asset URLs ──
const HERO_VIDEO_ID = "M3DW5KAQ3eQ";
const PRP_LOGO_WH = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/PRP-BRAND-lOGO-TRANSPARENT-white.png";
const PAVE_LOGO = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/PBC-LOGO-1024x518.png";
const SIGNUP_IMG = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/african-lady-reading-from-pc.jpeg";
const SIGNUP_BG = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/african-podcasters.jpeg";
const LOGIN_IMG = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/PRP-AFrican-lady-typing.jpeg";

const GreenBtn = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="inline-block bg-[#00ad00] text-white py-3.5 px-9 font-bold text-sm tracking-[1.5px] uppercase no-underline rounded-sm border-2 border-[#00ad00] transition-colors duration-200 hover:bg-[#008f00] hover:border-[#008f00]"
  >
    {children}
  </Link>
);

export default function Index() {
  useSeo({
    title: "Press Room Publisher – Pen Firepower Domain",
    description: "Welcome to Press Room Publisher: projecting creative writings and transforming readers into masterpiece writers.",
    keywords: ["press room publisher", "pen firepower", "creative writing", "blogging", "journalism", "broadcasters community"],
  });

  // Load YouTube IFrame API for seamless looping
  useEffect(() => {
    let player: any = null;

    const initPlayer = () => {
      player = new (window as any).YT.Player("yt-hero-bg", {
        videoId: HERO_VIDEO_ID,
        playerVars: {
          autoplay: 1, mute: 1, controls: 0, showinfo: 0, rel: 0,
          modestbranding: 1, playsinline: 1, iv_load_policy: 3, fs: 0, disablekb: 1, loop: 0,
        },
        events: {
          onStateChange: (e: any) => {
            if (e.data === 0) { player.seekTo(0, true); player.playVideo(); }
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("yt-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if ((window as any).onYouTubeIframeAPIReady === initPlayer) delete (window as any).onYouTubeIframeAPIReady;
      if (player && player.destroy) player.destroy();
    };
  }, []);

  return (
    <MarketingLayout>
      {/* ── HERO SECTION ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-16 overflow-hidden bg-black" style={{ height: "calc(100vh - 70px)", minHeight: "520px" }}>
        {/* YouTube background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            id="yt-hero-bg"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: "max(100%, calc(100vh * 16 / 9))", height: "max(100%, calc(100vw * 9 / 16))" }}
          />
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/[0.68] pointer-events-none" />

        {/* Text */}
        <div className="relative z-10 max-w-[900px] mx-auto animate-fade-up">
          <h1 className="text-white font-black leading-[1.25] uppercase tracking-[2px] mb-5" style={{ fontSize: "clamp(20px, 3.5vw, 38px)" }}>
            WELCOME TO THE (PEN FIREPOWER) DOMAIN OPTIMIZING VARYING RECORD EVENTS THAT MATTER.
          </h1>
          <p className="text-[#e8e8e8] font-semibold uppercase tracking-wide leading-relaxed mb-10" style={{ fontSize: "clamp(12px, 1.8vw, 16px)" }}>
            WE ARE PRESS ROOM PUBLISHER: PROJECTING CREATIVE WRITINGS AND TRANSFORMING READERS INTO MASTERPIECE WRITERS THAT READS.
          </p>

          {/* Dual logo row */}
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <img src={PRP_LOGO_WH} alt="Press Room Publisher Logo" className="h-[90px] object-contain" />
            <img src={PAVE_LOGO} alt="PAVE Broadcasters Community Logo" className="h-[70px] object-contain" />
          </div>
        </div>
      </section>

      {/* ── SIGN UP SECTION ── */}
      <section
        className="relative py-16 px-6 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${SIGNUP_BG})` }}
      >
        <div className="absolute inset-0 bg-black/[0.72]" />
        <div className="relative z-10 max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="rounded-md overflow-hidden aspect-[4/3] animate-fade-up">
            <img src={SIGNUP_IMG} alt="African woman reading from PC" className="w-full h-full object-cover block" loading="lazy" />
          </div>
          {/* Text */}
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="font-extrabold text-white leading-snug mb-5" style={{ fontSize: "clamp(16px, 2.2vw, 22px)" }}>
              Hey charming Bibliophile, did you just discovered PRESS ROOM PUBLISHER blogsite?
              We are absolutely elated to have you chime-in!
            </h2>
            <p className="text-[#e0e0e0] text-[15px] leading-[1.8] mb-7">
              Welcome to the Writers and Readers promoter community! Please use the button below to create
              your personal PRESS ROOM PUBLISHER account, start writing, publish unlimited creative content,
              build up your own unique community of readers, and share your blogposts onward with the universe.
              The time is now to allow the world feel the PEN FIREPOWER of your creative writings!
            </p>
            <GreenBtn to="/register">CLICK HERE TO SIGN UP</GreenBtn>
          </div>
        </div>
      </section>

      {/* ── LOG IN SECTION ── */}
      <section className="bg-[#f4f4f4] py-16 px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="animate-fade-up">
            <p className="text-[#333] text-[15px] leading-[1.9] mb-4">
              Dearest returning writing and Reading enthusiastic member of PRESS ROOM PUBLISHER blogsite.
              Thank you! We cherish the best your creativity has added in values thus far.
            </p>
            <p className="text-[#333] text-[15px] leading-[1.9] mb-7">
              Please use the button below to access and manage your existing PRP account. The community
              cannot wait to relish your latest update in publication. Do Dive-In Now!
            </p>
            <GreenBtn to="/login">CLICK HERE TO LOG IN</GreenBtn>
          </div>
          {/* Image */}
          <div className="rounded-md overflow-hidden aspect-[4/3] animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <img src={LOGIN_IMG} alt="African woman typing on laptop at night" className="w-full h-full object-cover block" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ── BOTTOM TAGLINE BANNER ── */}
      <section className="bg-white py-10 px-6 text-center border-t-[3px] border-[#00ad00]">
        <h2 className="text-[#00ad00] font-black tracking-[2px] uppercase m-0" style={{ fontSize: "clamp(16px, 2.5vw, 26px)" }}>
          PRESS ROOM PUBLISHER; THE PEN FIREPOWER ARTISTRIES.
        </h2>
      </section>
    </MarketingLayout>
  );
}
