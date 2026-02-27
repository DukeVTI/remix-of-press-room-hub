import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";

const HEADER_IMG = "https://images.unsplash.com/photo-1478737270197-b9bf817e1c62?w=1400&auto=format&fit=crop&q=80";

export default function About() {
  useSeo({
    title: "About – Press Room Publisher",
    description: "Learn about Press Room Publisher — a multi-user digital print media platform designed to empower writers of all kinds.",
  });

  return (
    <MarketingLayout>
      {/* Page header */}
      <div style={{
        position: "relative",
        height: "220px",
        backgroundImage: `url(${HEADER_IMG})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        display: "flex",
        alignItems: "center",
        paddingLeft: "48px",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.55)" }} />
        <h1 style={{
          position: "relative",
          zIndex: 1,
          color: "#fff",
          fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: 900,
          letterSpacing: "3px",
          textTransform: "uppercase",
          margin: 0,
        }}>ABOUT</h1>
      </div>

      {/* Body content */}
      <section style={{ backgroundColor: "#fff", padding: "60px 24px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "22px", color: "#333", fontSize: "15px", lineHeight: 1.9 }}>
            <p>
              Undoubtedly from generation-to-generation, combination of the writer's head, hands, and heart or intelligence
              in true representation and diligent documentation of varying record events and historic situations are required
              in critical contributions, toward upward building and progressive development of the world.
            </p>
            <p>
              Hence Project PRESS ROOM PUBLISHER, a subsidiary of (PAVE BROADCASTERS COMMUNITY), creatively designed
              without limitations to the publication of news valued items in dissemination and promotions.
            </p>
            <p>
              Exclusively available and accessible to everyone in the noble field of writing, either as pastime or
              professionally for a living. PRESS ROOM PUBLISHER blogsite supports all categories of writers, without
              limitations to the print news journalists, copy editors, text documentary producers, ghost writers,
              translators, song writers, poets, storytellers, fiction writers, opinion builders, public issue analysts,
              feature writers, and more related.
            </p>
            <p>
              The digital print media domain (PRESS ROOM PUBLISHER) is creatively set up to Firepower Pens of both
              newcomers and professionals in the print media industry. It is a multi-users news blog platform, promoting
              news objectivity, balanced news reportage, freedom of speech and independence of both the newborn and
              established print journalism enthusiasts.
            </p>
          </div>

          {/* Vision */}
          <div style={{
            marginTop: "48px",
            borderLeft: "4px solid #00ad00",
            paddingLeft: "24px",
            marginBottom: "32px",
          }}>
            <h2 style={{ color: "#111", fontSize: "20px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
              Our Vision
            </h2>
            <p style={{ color: "#444", fontSize: "15px", lineHeight: 1.9, margin: 0 }}>
              Promote writing and reading culture with the integration of digital print media technology, toward the
              preservation and protection of record events that matter.
            </p>
          </div>

          {/* Mission */}
          <div style={{ borderLeft: "4px solid #00ad00", paddingLeft: "24px" }}>
            <h2 style={{ color: "#111", fontSize: "20px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
              Our Mission
            </h2>
            <p style={{ color: "#444", fontSize: "15px", lineHeight: 1.9, margin: 0 }}>
              Projecting the unique talents of gifted writers and optimizing creative writing skills that sustainably
              engage the audience, and equally capable of encouraging readers to becoming masterpiece writers that reads.
              Here at PRESS ROOM PUBLISHER blogsite, we'd always remain committed towards the sustenance of our goals.
              You are warmly welcome to be here, and together, we would be better collectively for the best project PBC
              stands to achieve with you (the community) we are proud to serve.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
