import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";

const HEADER_IMG = "/images/news-circle-header.jpg";
const MIC_IMG = "/images/mic.jpg";

export default function NewsCircle() {
    useSeo({
        title: "News Circle (PRPNC) – Press Room Publisher",
        description: "The official PRP News Circle — the exclusive digital media hub for Press Room Publisher news, releases, and verified updates.",
    });

    return (
        <MarketingLayout>
            {/* Page header */}
            <div
                className="relative h-[220px] bg-cover bg-center flex items-center px-12"
                style={{ backgroundImage: `url(${HEADER_IMG})` }}
            >
                <div className="absolute inset-0 bg-black/60" />
                <h1 className="relative z-10 text-white font-black tracking-[2px] uppercase" style={{ fontSize: "clamp(20px, 4vw, 38px)" }}>
                    NEWS CIRCLE (PRPNC)
                </h1>
            </div>

            {/* Body — dark bg section */}
            <section
                className="relative py-16 px-6 bg-cover bg-center"
                style={{ backgroundImage: `url(${MIC_IMG})` }}
            >
                <div className="absolute inset-0 bg-black/[0.82]" />
                <div className="relative z-10 max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left: microphone image inset */}
                    <div className="rounded-md overflow-hidden aspect-[3/4]">
                        <img
                            src={MIC_IMG}
                            alt="Silver vintage microphone on wooden table"
                            className="w-full h-full object-cover block"
                            loading="lazy"
                        />
                    </div>

                    {/* Right: text */}
                    <div>
                        <p className="text-[#e0e0e0] text-[15px] leading-[1.9] mb-5">
                            The acronym (PRPNC) literally stands for the PRESS ROOM PUBLISHER NEWS CIRCLE. It's the official
                            news and verified information channel, specifically set up for exclusive reportage and public
                            documentation of latest Press Room Publisher updates and trending news items related to everything
                            project PRP.
                        </p>
                        <p className="text-[#e0e0e0] text-[15px] leading-[1.9] mb-5">
                            The PRPNC is primarily the official news hub for Press Room Publisher. It is the verified space for
                            authentic PRP news releases and varying official updates in the interest of the community we serve.
                            Herein the news circle, visitors and users can easily access and read exclusively about the latest
                            trending activities linked to Press Room Publisher, that may not be available elsewhere.
                        </p>
                        <p className="text-[#e0e0e0] text-[15px] leading-[1.9] mb-9">
                            We urge you to always visit us here on PRP News Circle for the latest useful news and verification
                            of information found anywhere about Press Room Publisher. Thank you for the choice of your
                            relationship with us at Press Room Publisher. You're valued.
                        </p>
                        <Link
                            to="/dashboard"
                            className="inline-block bg-[#00ad00] text-white py-3.5 px-6 font-bold text-[13px] tracking-wide uppercase no-underline rounded-sm leading-relaxed transition-colors duration-200 hover:bg-[#008f00]"
                        >
                            CLICK HERE TO EXPLORE THE OFFICIAL PRESS ROOM PUBLISHER NEWSFEED
                        </Link>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
