import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { cn } from "@/lib/utils";

const PRP_LOGO = "/images/prp-icon.png";
const PRP_LOGO_WH = "/images/prp-logo-white.png";

const NAV_LINKS = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "News Circle", to: "/news-circle" },
    { label: "Career", to: "/career" },
    { label: "Connect", to: "/connect" },
    { label: "Policy", to: "/privacy" },
];

interface MarketingLayoutProps {
    children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { pathname } = useLocation();
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => { setMenuOpen(false); }, [pathname]);

    return (
        <div className="font-sans min-h-screen flex flex-col">
            {/* ── Sticky Navbar ── */}
            <header
                className={cn(
                    "sticky top-0 z-50 bg-white transition-shadow duration-300",
                    scrolled ? "shadow-md" : "shadow-sm"
                )}
            >
                <nav className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[70px]">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 no-underline" aria-label="Press Room Publisher home">
                        <img src={PRP_LOGO} alt="Press Room Publisher logo" className="w-9 h-9 object-contain" />
                        <div className="leading-tight">
                            <div className="font-extrabold text-[13px] text-[#111] tracking-wide uppercase">
                                Press Room Publisher
                            </div>
                            <div className="text-[9px] text-[#00ad00] tracking-[2px] uppercase font-semibold">
                                ...Pen Fire Power
                            </div>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <ul className="hidden md:flex gap-1 items-center list-none m-0 p-0">
                        {NAV_LINKS.map(({ label, to }) => (
                            <li key={to}>
                                <Link
                                    to={to}
                                    className={cn(
                                        "block px-3.5 py-1.5 rounded text-[13px] tracking-wide no-underline transition-all duration-200",
                                        pathname === to
                                            ? "bg-[#00ad00] text-white font-bold"
                                            : "text-[#333] font-medium hover:bg-[#f0f0f0] hover:text-[#00ad00]"
                                    )}
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                        <li className="ml-3">
                            <Link
                                to="/login"
                                className="block px-[18px] py-2 rounded bg-[#00ad00] text-white no-underline text-[13px] font-bold tracking-wide border-2 border-[#00ad00] transition-colors duration-200 hover:bg-[#008f00] hover:border-[#008f00]"
                            >
                                LOG IN
                            </Link>
                        </li>
                    </ul>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                        className="md:hidden bg-transparent border-none cursor-pointer text-[#333] p-1"
                    >
                        {menuOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
                    </button>
                </nav>

                {/* Mobile dropdown */}
                <div
                    className={cn(
                        "md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-[#eee]",
                        menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    )}
                >
                    <div className="px-6 py-3 pb-5 flex flex-col gap-1">
                        {NAV_LINKS.map(({ label, to }) => (
                            <Link
                                key={to}
                                to={to}
                                className={cn(
                                    "block px-4 py-2.5 rounded no-underline text-sm transition-colors duration-200",
                                    pathname === to
                                        ? "bg-[#00ad00] text-white font-bold"
                                        : "text-[#333] font-medium hover:bg-[#f5f5f5]"
                                )}
                            >
                                {label}
                            </Link>
                        ))}
                        <Link
                            to="/login"
                            className="block px-4 py-2.5 rounded bg-[#00ad00] text-white no-underline text-sm font-bold text-center mt-2 transition-colors duration-200 hover:bg-[#008f00]"
                        >
                            LOG IN
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Page content ── */}
            <main className="flex-1">
                {children}
            </main>

            {/* ── Footer ── */}
            <footer className="bg-[#000] text-white" role="contentinfo">
                <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-9 mb-8">
                        {/* Column 1: Brand */}
                        <div>
                            <img
                                src={PRP_LOGO_WH}
                                alt="Press Room Publisher white logo"
                                className="h-20 object-contain mb-2"
                            />
                        </div>

                        {/* Column 2: Pages */}
                        <div>
                            <h4 className="text-[#00ad00] text-[13px] font-bold uppercase tracking-wide mb-3.5">
                                Pages
                            </h4>
                            <ul className="list-none p-0 m-0 flex flex-col gap-2">
                                {[{ label: "Home", to: "/" }, { label: "About", to: "/about" }, { label: "Career", to: "/career" }, { label: "Connect", to: "/connect" }].map(({ label, to }) => (
                                    <li key={to}>
                                        <Link to={to} className="text-[#ccc] no-underline text-[13px] transition-colors duration-200 hover:text-[#00ad00]">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Quick Links */}
                        <div>
                            <h4 className="text-[#00ad00] text-[13px] font-bold uppercase tracking-wide mb-3.5">
                                Quick Links
                            </h4>
                            <ul className="list-none p-0 m-0 flex flex-col gap-2">
                                {[{ label: "Policy", to: "/privacy" }, { label: "News Circle", to: "/news-circle" }].map(({ label, to }) => (
                                    <li key={to}>
                                        <Link to={to} className="text-[#ccc] no-underline text-[13px] transition-colors duration-200 hover:text-[#00ad00]">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Connect */}
                        <div>
                            <h4 className="text-[#00ad00] text-[13px] font-bold uppercase tracking-wide mb-3.5">
                                Connect
                            </h4>
                            <div className="flex flex-col gap-3">
                                <a
                                    href="https://wa.me/message/M4SMC34XJ63JA1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#ccc] no-underline text-[13px] transition-colors duration-200 hover:text-[#00ad00]"
                                    aria-label="Chat with Press Room Publisher on WhatsApp"
                                >
                                    <svg viewBox="0 0 32 32" width="16" height="16" fill="#25D366" className="shrink-0" aria-hidden="true"><path d="M16.003 2.667C8.639 2.667 2.667 8.639 2.667 16c0 2.347.633 4.549 1.737 6.452L2.667 29.333l7.072-1.713A13.29 13.29 0 0016.003 29.333C23.364 29.333 29.333 23.364 29.333 16c0-7.364-5.969-13.333-13.33-13.333zm6.21 15.51c-.341-.17-2.016-.994-2.329-1.107-.312-.113-.539-.17-.766.17-.228.341-.882 1.107-1.081 1.335-.199.227-.397.256-.738.086-.341-.17-1.44-.531-2.742-1.692-1.013-.904-1.697-2.02-1.896-2.361-.199-.341-.021-.525.15-.694.154-.153.341-.399.512-.598.17-.2.227-.341.341-.569.113-.227.057-.426-.028-.598-.086-.17-.766-1.847-1.05-2.53-.277-.664-.558-.574-.766-.584l-.653-.011a1.253 1.253 0 00-.909.426c-.312.341-1.193 1.165-1.193 2.843s1.221 3.298 1.392 3.525c.17.228 2.403 3.668 5.822 5.144.814.351 1.449.561 1.944.718.817.26 1.561.224 2.148.136.655-.098 2.016-.824 2.3-1.62.284-.795.284-1.478.199-1.62-.086-.142-.312-.228-.653-.399z" /></svg>
                                    Chat with us
                                </a>
                                <a
                                    href="mailto:hello.prp@broadcasterscommunity.com"
                                    className="inline-flex items-center gap-2 text-[#ccc] no-underline text-[13px] transition-colors duration-200 hover:text-[#00ad00]"
                                    aria-label="Email Press Room Publisher"
                                >
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" /></svg>
                                    hello.prp@broadcasterscommunity.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="bg-[#00ad00] py-3.5 px-6 text-center">
                    <p className="m-0 text-white text-[13px] font-semibold tracking-wide">
                        Copyright © Press Room Publisher {currentYear}. All Right Reserved.
                    </p>
                </div>
            </footer>

            <WhatsAppButton />
        </div>
    );
}
