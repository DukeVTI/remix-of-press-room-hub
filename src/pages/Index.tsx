import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";

const HERO_BG = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/prp-hero-bg.jpg";
const SIGNUP_IMG = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80";
const LOGIN_IMG = "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80";

const GreenBtn = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    style={{
      display: "inline-block",
      backgroundColor: "#00ad00",
      color: "#fff",
      padding: "14px 32px",
      fontWeight: 700,
      fontSize: "14px",
      letterSpacing: "1px",
      textTransform: "uppercase",
      textDecoration: "none",
      borderRadius: "4px",
      transition: "background-color 0.2s",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#008f00"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#00ad00"; }}
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

  return (
    <MarketingLayout>
      {/* ── HERO SECTION ── */}
      <section
        style={{
          position: "relative",
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 24px",
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: "rgba(0,0,0,0.72)",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "860px", margin: "0 auto" }}>
          <h1 style={{
            color: "#fff",
            fontSize: "clamp(22px, 4vw, 40px)",
            fontWeight: 900,
            lineHeight: 1.2,
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: "24px",
          }}>
            WELCOME TO THE (PEN FIREPOWER) DOMAIN OPTIMIZING VARYING RECORD EVENTS THAT MATTER.
          </h1>
          <p style={{
            color: "#e0e0e0",
            fontSize: "clamp(13px, 2vw, 17px)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1px",
            lineHeight: 1.6,
          }}>
            WE ARE PRESS ROOM PUBLISHER: PROJECTING CREATIVE WRITINGS AND TRANSFORMING READERS INTO MASTERPIECE WRITERS THAT READS.
          </p>
        </div>
      </section>

      {/* ── SIGN UP SECTION ── */}
      <section style={{ backgroundColor: "#fff", padding: "64px 24px" }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
          alignItems: "center",
        }}
          className="marketing-two-col"
        >
          <div style={{ borderRadius: "8px", overflow: "hidden", aspectRatio: "4/3" }}>
            <img
              src={SIGNUP_IMG}
              alt="Writer working on laptop"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          </div>
          <div>
            <h2 style={{
              fontSize: "clamp(16px, 2.5vw, 24px)",
              fontWeight: 800,
              color: "#111",
              lineHeight: 1.4,
              marginBottom: "20px",
            }}>
              Hey charming Bibliophile, did you just discovered PRESS ROOM PUBLISHER blogsite?
              We are absolutely elated to have you chime-in!
            </h2>
            <p style={{ color: "#444", fontSize: "15px", lineHeight: 1.8, marginBottom: "28px" }}>
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
      <section style={{ backgroundColor: "#f7f7f7", padding: "64px 24px" }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
          alignItems: "center",
        }}
          className="marketing-two-col"
        >
          <div>
            <p style={{ color: "#444", fontSize: "15px", lineHeight: 1.8, marginBottom: "16px" }}>
              Dearest returning writing and Reading enthusiastic member of PRESS ROOM PUBLISHER blogsite.
              Thank you! We cherish the best your creativity has added in values thus far.
            </p>
            <p style={{ color: "#444", fontSize: "15px", lineHeight: 1.8, marginBottom: "28px" }}>
              Please use the button below to access and manage your existing PRP account. The community
              cannot wait to relish your latest update in publication. Do Dive-In Now!
            </p>
            <GreenBtn to="/login">CLICK HERE TO LOG IN</GreenBtn>
          </div>
          <div style={{ borderRadius: "8px", overflow: "hidden", aspectRatio: "4/3" }}>
            <img
              src={LOGIN_IMG}
              alt="Person at computer"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .marketing-two-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </MarketingLayout>
  );
}
