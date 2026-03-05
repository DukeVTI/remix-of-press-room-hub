import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";
import { Briefcase } from "lucide-react";

const HEADER_IMG = "/images/career-header.jpg";

export default function Career() {
    useSeo({
        title: "Career – Press Room Publisher",
        description: "Join the diverse team behind Press Room Publisher. Reach out to our management to become part of the community.",
    });

    return (
        <MarketingLayout>
            {/* Page header */}
            <div
                className="relative h-[220px] bg-cover bg-center flex items-center px-12"
                style={{ backgroundImage: `url(${HEADER_IMG})` }}
            >
                <div className="absolute inset-0 bg-black/60" />
                <h1 className="relative z-10 text-white font-black tracking-[3px] uppercase" style={{ fontSize: "clamp(28px, 5vw, 48px)" }}>
                    CAREER
                </h1>
            </div>

            {/* Body */}
            <section className="bg-white py-20 px-6">
                <div className="max-w-[760px] mx-auto text-center flex flex-col items-center gap-9">
                    <div className="w-16 h-16 rounded-full bg-[#00ad00]/10 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-[#00ad00]" aria-hidden="true" />
                    </div>
                    <p className="text-[#333] text-base leading-[2]">
                        At PRESS ROOM PUBLISHER, every quality individual commitment toward the collective achievement and
                        overall success of the community goal are duly prioritized. To becoming a member of the diverse team
                        of the great minds behind the scenes of our operations and success stories, we invite you to please
                        feel free to reach out to our management. We would be glad to have you here!
                    </p>
                    <Link
                        to="/connect"
                        className="inline-block bg-[#00ad00] text-white py-3.5 px-11 font-bold text-sm tracking-[1.5px] uppercase no-underline rounded-sm transition-colors duration-200 hover:bg-[#008f00]"
                    >
                        CONTACT US
                    </Link>
                </div>
            </section>
        </MarketingLayout>
    );
}
