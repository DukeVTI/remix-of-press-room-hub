import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";

const HEADER_IMG = "/images/about-header.jpg";
const MISSION_BG = "/images/about-mission-bg.jpg";

export default function About() {
  useSeo({
    title: "About – Press Room Publisher",
    description: "Learn about Press Room Publisher — a multi-user digital print media platform designed to empower writers of all kinds.",
  });

  return (
    <MarketingLayout>
      {/* Page header */}
      <div
        className="relative h-[220px] bg-cover bg-center bg-no-repeat flex items-center px-12"
        style={{ backgroundImage: `url(${HEADER_IMG})`, backgroundPosition: "center top" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="relative z-10 text-white font-black tracking-[3px] uppercase" style={{ fontSize: "clamp(28px, 5vw, 48px)" }}>
          ABOUT
        </h1>
      </div>

      {/* Body content */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-[860px] mx-auto">
          <div className="flex flex-col gap-5 text-[#333] text-[15px] leading-[1.9]">
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
          <div className="mt-12 border-l-4 border-[#00ad00] pl-6 mb-8">
            <h2 className="text-[#111] text-xl font-extrabold uppercase tracking-wide mb-3">
              Our Vision
            </h2>
            <p className="text-[#444] text-[15px] leading-[1.9] m-0">
              Promote writing and reading culture with the integration of digital print media technology, toward the
              preservation and protection of record events that matter.
            </p>
          </div>
        </div>
      </section>

      {/* Mission — dark background section */}
      <section
        className="relative py-16 pb-20 px-6 bg-cover bg-center"
        style={{ backgroundImage: `url(${MISSION_BG})` }}
      >
        <div className="absolute inset-0 bg-black/[0.78]" />
        <div className="relative z-10 max-w-[860px] mx-auto">
          <h2 className="text-[#00ad00] text-xl font-extrabold uppercase tracking-wide mb-4">
            Our Mission
          </h2>
          <p className="text-[#e8e8e8] text-[15px] leading-[1.9] mb-5">
            Projecting the unique talents of gifted writers and optimizing creative writing skills that sustainably
            engage the audience, and equally capable of encouraging readers to becoming masterpiece writers that reads.
          </p>
          <p className="text-[#e8e8e8] text-[15px] leading-[1.9] m-0">
            Here at PRESS ROOM PUBLISHER blogsite, we'd always remain committed towards the sustenance of our goals.
            You are warmly welcome to be here, and together, we would be better collectively for the best project PBC
            stands to achieve with you (the community) we are proud to serve.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
