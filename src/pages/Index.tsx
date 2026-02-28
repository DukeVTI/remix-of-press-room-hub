import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";

// ── Live WordPress asset URLs ──
const HERO_VIDEO_ID = "M3DW5KAQ3eQ"; // YouTube background video (autoplay loop)
const PRP_LOGO_WH = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/PRP-BRAND-lOGO-TRANSPARENT-white.png";
const PAVE_LOGO = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/PBC-LOGO-1024x518.png";
const SIGNUP_IMG = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/african-lady-reading-from-pc.jpeg";
const SIGNUP_BG = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/african-podcasters.jpeg";
const LOGIN_IMG = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/PRP-AFrican-lady-typing.jpeg";

const GreenBtn = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    style={{
      display: "inline-block",
      backgroundColor: "#00ad00",
      color: "#fff",
      padding: "14px 36px",
      fontWeight: 700,
      fontSize: "14px",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      textDecoration: "none",
      borderRadius: "3px",
      transition: "background-color 0.2s",
      border: "2px solid #00ad00",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#008f00"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#008f00"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#00ad00"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#00ad00"; }}
  >
    {children}
  </Link>
);

export default function Index() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useSeo({
    title: "Press Room Publisher – Pen Firepower Domain",
    description: "Welcome to Press Room Publisher: projecting creative writings and transforming readers into masterpiece writers.",
    keywords: ["press room publisher", "pen firepower", "creative writing", "blogging", "journalism", "broadcasters community"],
  });

  // Seamless loop: listen for YouTube postMessage and seek to 0 on video end
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "string") return;
      try {
        const data = JSON.parse(event.data);
        // YT state 0 = ended
        if (data.event === "onStateChange" && data.info === 0 && iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "seekTo", args: [0, true] }),
            "*"
          );
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "playVideo", args: [] }),
            "*"
          );
        }
      } catch { /* non-YT messages ignored */ }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <MarketingLayout>

      {/* ── HERO SECTION ── */}
      <section
        style={{
          position: "relative",
          height: "calc(100vh - 70px)", // full viewport minus the 70px sticky navbar
          minHeight: "520px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "60px 24px",
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        {/* YouTube background video — covers full container */}
        <div style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}>
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${HERO_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${HERO_VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&fs=0&disablekb=1`}
            title="PRP hero video background"
            allow="autoplay; encrypted-media; fullscreen"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              /* Oversized to guarantee full cover regardless of aspect ratio */
              width: "max(100%, calc(100vh * 16 / 9))",
              height: "max(100%, calc(100vw * 9 / 16))",
              transform: "translate(-50%, -50%)",
              border: "none",
              pointerEvents: "none",
            }}
          />
        </div>
        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.68)", pointerEvents: "none" }} />

        {/* Text */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{
            color: "#fff",
            fontSize: "clamp(20px, 3.5vw, 38px)",
            fontWeight: 900,
            lineHeight: 1.25,
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: "20px",
          }}>
            WELCOME TO THE (PEN FIREPOWER) DOMAIN OPTIMIZING VARYING RECORD EVENTS THAT MATTER.
          </h1>
          <p style={{
            color: "#e8e8e8",
            fontSize: "clamp(12px, 1.8vw, 16px)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1px",
            lineHeight: 1.7,
            marginBottom: "40px",
          }}>
            WE ARE PRESS ROOM PUBLISHER: PROJECTING CREATIVE WRITINGS AND TRANSFORMING READERS INTO MASTERPIECE WRITERS THAT READS.
          </p>

          {/* Dual logo row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "48px",
            flexWrap: "wrap",
          }}>
            <img
              src={PRP_LOGO_WH}
              alt="Press Room Publisher Logo"
              style={{ height: "90px", objectFit: "contain" }}
            />
            <img
              src={PAVE_LOGO}
              alt="PAVE Broadcasters Community Logo"
              style={{ height: "70px", objectFit: "contain" }}
            />
          </div>
        </div>
      </section>

      {/* ── SIGN UP SECTION ── */}
      <section
        style={{
          position: "relative",
          padding: "64px 24px",
          backgroundImage: `url(${SIGNUP_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.72)" }} />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            alignItems: "center",
          }}
          className="marketing-two-col"
        >
          {/* Image */}
          <div style={{ borderRadius: "6px", overflow: "hidden", aspectRatio: "4/3" }}>
            <img
              src={SIGNUP_IMG}
              alt="African woman reading from PC"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading="lazy"
            />
          </div>
          {/* Text */}
          <div>
            <h2 style={{
              fontSize: "clamp(16px, 2.2vw, 22px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.4,
              marginBottom: "20px",
            }}>
              Hey charming Bibliophile, did you just discovered PRESS ROOM PUBLISHER blogsite?
              We are absolutely elated to have you chime-in!
            </h2>
            <p style={{ color: "#e0e0e0", fontSize: "15px", lineHeight: 1.8, marginBottom: "28px" }}>
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
      <section style={{ backgroundColor: "#f4f4f4", padding: "64px 24px" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            alignItems: "center",
          }}
          className="marketing-two-col"
        >
          {/* Text */}
          <div>
            <p style={{ color: "#333", fontSize: "15px", lineHeight: 1.9, marginBottom: "16px" }}>
              Dearest returning writing and Reading enthusiastic member of PRESS ROOM PUBLISHER blogsite.
              Thank you! We cherish the best your creativity has added in values thus far.
            </p>
            <p style={{ color: "#333", fontSize: "15px", lineHeight: 1.9, marginBottom: "28px" }}>
              Please use the button below to access and manage your existing PRP account. The community
              cannot wait to relish your latest update in publication. Do Dive-In Now!
            </p>
            <GreenBtn to="/login">CLICK HERE TO LOG IN</GreenBtn>
          </div>
          {/* Image */}
          <div style={{ borderRadius: "6px", overflow: "hidden", aspectRatio: "4/3" }}>
            <img
              src={LOGIN_IMG}
              alt="African woman typing on laptop at night"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── BOTTOM TAGLINE BANNER ── */}
      <section style={{
        backgroundColor: "#fff",
        padding: "40px 24px",
        textAlign: "center",
        borderTop: "3px solid #00ad00",
      }}>
        <h2 style={{
          color: "#00ad00",
          fontSize: "clamp(16px, 2.5vw, 26px)",
          fontWeight: 900,
          letterSpacing: "2px",
          textTransform: "uppercase",
          margin: 0,
        }}>
          PRESS ROOM PUBLISHER; THE PEN FIREPOWER ARTISTRIES.
        </h2>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .marketing-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </MarketingLayout>
  );
}
