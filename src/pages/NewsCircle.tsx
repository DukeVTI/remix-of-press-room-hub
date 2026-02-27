import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";

const HEADER_IMG = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1400&auto=format&fit=crop&q=80";
const MIC_IMG = "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&auto=format&fit=crop&q=80";

export default function NewsCircle() {
    useSeo({
        title: "News Circle (PRPNC) – Press Room Publisher",
        description: "The official PRP News Circle — the exclusive digital media hub for Press Room Publisher news, releases, and verified updates.",
    });

    return (
        <MarketingLayout>
            {/* Page header */}
            <div style={{
                position: "relative",
                height: "220px",
                backgroundImage: `url(${HEADER_IMG})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                paddingLeft: "48px",
            }}>
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)" }} />
                <h1 style={{
                    position: "relative",
                    zIndex: 1,
                    color: "#fff",
                    fontSize: "clamp(22px, 4vw, 40px)",
                    fontWeight: 900,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    margin: 0,
                }}>NEWS CIRCLE (PRPNC)</h1>
            </div>

            {/* Body */}
            <section style={{ backgroundColor: "#fff", padding: "60px 24px" }}>
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
                    {/* Microphone image */}
                    <div style={{ borderRadius: "8px", overflow: "hidden" }}>
                        <img
                            src={MIC_IMG}
                            alt="Vintage microphone"
                            style={{ width: "100%", height: "380px", objectFit: "cover", display: "block" }}
                            loading="lazy"
                        />
                    </div>

                    {/* Text */}
                    <div>
                        <p style={{ color: "#333", fontSize: "15px", lineHeight: 1.9, marginBottom: "20px" }}>
                            The acronym (PRPNC) literally stands for the PRESS ROOM PUBLISHER NEWS CIRCLE. It's an official
                            digital media firepower domain, specifically set up to the exclusive reportage and unbiased
                            documentation of latest update and trending news items related to project PRP and her subsidiaries.
                        </p>
                        <p style={{ color: "#333", fontSize: "15px", lineHeight: 1.9, marginBottom: "36px" }}>
                            PRPNC is basically designed for the purpose of the official news hub for PRP's news releases and
                            varying verified official updates in the interest of the community. In the news circle, visitors and
                            users can easily access and read more details about the latest trending activities of Press Room
                            Publisher, that may never be available on any other digital media platform.
                        </p>
                        <Link
                            to="/dashboard"
                            style={{
                                display: "inline-block",
                                backgroundColor: "#00ad00",
                                color: "#fff",
                                padding: "14px 28px",
                                fontWeight: 700,
                                fontSize: "13px",
                                letterSpacing: "1px",
                                textTransform: "uppercase",
                                textDecoration: "none",
                                borderRadius: "4px",
                                lineHeight: 1.4,
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#008f00"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#00ad00"; }}
                        >
                            CLICK HERE TO EXPLORE THE OFFICIAL PRESS ROOM PUBLISHER NEWSFEED
                        </Link>
                    </div>
                </div>
            </section>

            <style>{`.marketing-two-col { } @media(max-width:768px){.marketing-two-col{grid-template-columns:1fr!important}}`}</style>
        </MarketingLayout>
    );
}
