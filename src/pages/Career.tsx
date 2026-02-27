import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";

const HEADER_IMG = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/female-host-using-control-panel-at-radio-station.jpg";

export default function Career() {
    useSeo({
        title: "Career – Press Room Publisher",
        description: "Join the diverse team behind Press Room Publisher. Reach out to our management to become part of the community.",
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
                    fontSize: "clamp(28px, 5vw, 48px)",
                    fontWeight: 900,
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    margin: 0,
                }}>CAREER</h1>
            </div>

            {/* Body */}
            <section style={{ backgroundColor: "#fff", padding: "80px 24px" }}>
                <div style={{
                    maxWidth: "760px",
                    margin: "0 auto",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "36px",
                }}>
                    <p style={{ color: "#333", fontSize: "16px", lineHeight: 2.0 }}>
                        At PRESS ROOM PUBLISHER, every quality individual commitment toward the collective achievement and
                        overall success of the community goal are duly prioritized. To becoming a member of the diverse team
                        of the great minds behind the scenes of our operations and success stories, we invite you to please
                        feel free to reach out to our management. We would be glad to have you here!
                    </p>
                    <Link
                        to="/connect"
                        style={{
                            display: "inline-block",
                            backgroundColor: "#00ad00",
                            color: "#fff",
                            padding: "14px 44px",
                            fontWeight: 700,
                            fontSize: "14px",
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            borderRadius: "3px",
                            transition: "background-color 0.2s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#008f00"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#00ad00"; }}
                    >
                        CONTACT US
                    </Link>
                </div>
            </section>
        </MarketingLayout>
    );
}
