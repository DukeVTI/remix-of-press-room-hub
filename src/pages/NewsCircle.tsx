import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";

const HEADER_IMG = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/two-radio-hosts-in-headphones-laughing-while-recording-podcast-in-studio-together.jpg";
const MIC_IMG = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/silver-vintage-microphone-.jpg";

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
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.60)" }} />
                <h1 style={{
                    position: "relative", zIndex: 1,
                    color: "#fff",
                    fontSize: "clamp(20px, 4vw, 38px)",
                    fontWeight: 900,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    margin: 0,
                }}>NEWS CIRCLE (PRPNC)</h1>
            </div>

            {/* Body — dark bg section like WordPress */}
            <section style={{
                position: "relative",
                padding: "64px 24px",
                backgroundImage: `url(${MIC_IMG})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}>
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.82)" }} />
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
                    {/* Left: microphone image inset */}
                    <div style={{ borderRadius: "6px", overflow: "hidden", aspectRatio: "3/4" }}>
                        <img
                            src={MIC_IMG}
                            alt="Silver vintage microphone on wooden table"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            loading="lazy"
                        />
                    </div>

                    {/* Right: text */}
                    <div>
                        <p style={{ color: "#e0e0e0", fontSize: "15px", lineHeight: 1.9, marginBottom: "20px" }}>
                            The acronym (PRPNC) literally stands for the PRESS ROOM PUBLISHER NEWS CIRCLE. It's an official
                            digital media firepower domain, specifically set up to the exclusive reportage and unbiased
                            documentation of latest update and trending news items related to project PRP and her subsidiaries.
                        </p>
                        <p style={{ color: "#e0e0e0", fontSize: "15px", lineHeight: 1.9, marginBottom: "36px" }}>
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
                                padding: "14px 24px",
                                fontWeight: 700,
                                fontSize: "13px",
                                letterSpacing: "1px",
                                textTransform: "uppercase",
                                textDecoration: "none",
                                borderRadius: "3px",
                                lineHeight: 1.5,
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

            <style>{`@media(max-width:768px){.marketing-two-col{grid-template-columns:1fr!important}}`}</style>
        </MarketingLayout>
    );
}
