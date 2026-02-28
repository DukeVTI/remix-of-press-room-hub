import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";

const PRP_LOGO = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/cropped-PRP-ICON_-transparetn-32x32.png";
const PRP_LOGO_WH = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/PRP-BRAND-lOGO-TRANSPARENT-white.png";

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

    // Close mobile menu on route change
    useEffect(() => { setMenuOpen(false); }, [pathname]);

    return (
        <div style={{ fontFamily: "'Arial', sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* ── Sticky Navbar ── */}
            <header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                    backgroundColor: "#fff",
                    boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.3s",
                }}
            >
                <nav
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto",
                        padding: "0 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: "70px",
                    }}
                >
                    {/* Logo */}
                    <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                        <img src={PRP_LOGO} alt="PRP Logo" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
                        <div style={{ lineHeight: 1.1 }}>
                            <div style={{ fontWeight: 800, fontSize: "13px", color: "#111", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                                Press Room Publisher
                            </div>
                            <div style={{ fontSize: "9px", color: "#00ad00", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>
                                ...Pen Fire Power
                            </div>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <ul style={{ display: "flex", gap: "4px", listStyle: "none", margin: 0, padding: 0, alignItems: "center" }}
                        className="marketing-nav-desktop">
                        {NAV_LINKS.map(({ label, to }) => (
                            <li key={to}>
                                <Link
                                    to={to}
                                    style={{
                                        padding: "6px 14px",
                                        borderRadius: "4px",
                                        textDecoration: "none",
                                        fontSize: "13px",
                                        fontWeight: pathname === to ? 700 : 500,
                                        color: pathname === to ? "#fff" : "#333",
                                        backgroundColor: pathname === to ? "#00ad00" : "transparent",
                                        transition: "all 0.2s",
                                        display: "block",
                                        letterSpacing: "0.3px",
                                    }}
                                    onMouseEnter={e => {
                                        if (pathname !== to) {
                                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#f0f0f0";
                                            (e.currentTarget as HTMLAnchorElement).style.color = "#00ad00";
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (pathname !== to) {
                                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                                            (e.currentTarget as HTMLAnchorElement).style.color = "#333";
                                        }
                                    }}
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                        <li style={{ marginLeft: "12px" }}>
                            <Link
                                to="/login"
                                style={{
                                    padding: "8px 18px",
                                    borderRadius: "4px",
                                    backgroundColor: "#00ad00",
                                    color: "#fff",
                                    textDecoration: "none",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    letterSpacing: "0.5px",
                                    transition: "background-color 0.2s",
                                    border: "2px solid #00ad00",
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#008f00"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#00ad00"; }}
                            >
                                LOG IN
                            </Link>
                        </li>
                    </ul>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Toggle menu"
                        className="marketing-nav-mobile"
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#333",
                            padding: "4px",
                            display: "none",
                        }}
                    >
                        {menuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </nav>

                {/* Mobile dropdown */}
                {menuOpen && (
                    <div
                        style={{
                            backgroundColor: "#fff",
                            borderTop: "1px solid #eee",
                            padding: "12px 24px 20px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                        }}
                    >
                        {NAV_LINKS.map(({ label, to }) => (
                            <Link
                                key={to}
                                to={to}
                                style={{
                                    padding: "10px 16px",
                                    borderRadius: "4px",
                                    textDecoration: "none",
                                    fontSize: "14px",
                                    fontWeight: pathname === to ? 700 : 500,
                                    color: pathname === to ? "#fff" : "#333",
                                    backgroundColor: pathname === to ? "#00ad00" : "transparent",
                                }}
                            >
                                {label}
                            </Link>
                        ))}
                        <Link
                            to="/login"
                            style={{
                                padding: "10px 16px",
                                borderRadius: "4px",
                                backgroundColor: "#00ad00",
                                color: "#fff",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: 700,
                                textAlign: "center",
                                marginTop: "8px",
                            }}
                        >
                            LOG IN
                        </Link>
                    </div>
                )}
            </header>

            {/* ── Page content ── */}
            <main style={{ flex: 1 }}>
                {children}
            </main>

            {/* ── Footer ── */}
            <footer style={{ backgroundColor: "#000", color: "#fff" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 24px" }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "36px",
                        marginBottom: "32px",
                    }}>
                        {/* Column 1: Brand — full white logo like WP */}
                        <div>
                            <img
                                src={PRP_LOGO_WH}
                                alt="Press Room Publisher"
                                style={{ height: "80px", objectFit: "contain", marginBottom: "8px" }}
                            />
                        </div>

                        {/* Column 2: Pages */}
                        <div>
                            <h4 style={{ color: "#00ad00", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>
                                Pages
                            </h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                                {[{ label: "Home", to: "/" }, { label: "About", to: "/about" }, { label: "Career", to: "/career" }, { label: "Connect", to: "/connect" }].map(({ label, to }) => (
                                    <li key={to}>
                                        <Link to={to} style={{ color: "#ccc", textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#00ad00"; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#ccc"; }}>
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Quick Links — matches WP: Policy + News Circle only */}
                        <div>
                            <h4 style={{ color: "#00ad00", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>
                                Quick Links
                            </h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                                {[{ label: "Policy", to: "/privacy" }, { label: "News Circle", to: "/news-circle" }].map(({ label, to }) => (
                                    <li key={to}>
                                        <Link to={to} style={{ color: "#ccc", textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#00ad00"; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#ccc"; }}>
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Connect — plain links matching WP */}
                        <div>
                            <h4 style={{ color: "#00ad00", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>
                                Connect
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <a
                                    href="https://wa.me/message/M4SMC34XJ63JA1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#ccc", textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#00ad00"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#ccc"; }}
                                >
                                    {/* WhatsApp icon */}
                                    <svg viewBox="0 0 32 32" width="16" height="16" fill="#25D366" style={{ flexShrink: 0 }}><path d="M16.003 2.667C8.639 2.667 2.667 8.639 2.667 16c0 2.347.633 4.549 1.737 6.452L2.667 29.333l7.072-1.713A13.29 13.29 0 0016.003 29.333C23.364 29.333 29.333 23.364 29.333 16c0-7.364-5.969-13.333-13.33-13.333zm6.21 15.51c-.341-.17-2.016-.994-2.329-1.107-.312-.113-.539-.17-.766.17-.228.341-.882 1.107-1.081 1.335-.199.227-.397.256-.738.086-.341-.17-1.44-.531-2.742-1.692-1.013-.904-1.697-2.02-1.896-2.361-.199-.341-.021-.525.15-.694.154-.153.341-.399.512-.598.17-.2.227-.341.341-.569.113-.227.057-.426-.028-.598-.086-.17-.766-1.847-1.05-2.53-.277-.664-.558-.574-.766-.584l-.653-.011a1.253 1.253 0 00-.909.426c-.312.341-1.193 1.165-1.193 2.843s1.221 3.298 1.392 3.525c.17.228 2.403 3.668 5.822 5.144.814.351 1.449.561 1.944.718.817.26 1.561.224 2.148.136.655-.098 2.016-.824 2.3-1.62.284-.795.284-1.478.199-1.62-.086-.142-.312-.228-.653-.399z" /></svg>
                                    Chat with us
                                </a>
                                <a
                                    href="mailto:hello.prp@broadcasterscommunity.com"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#ccc", textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#00ad00"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#ccc"; }}
                                >
                                    {/* Mail icon */}
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" /></svg>
                                    hello.prp@broadcasterscommunity.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{ backgroundColor: "#00ad00", padding: "14px 24px", textAlign: "center" }}>
                    <p style={{ margin: 0, color: "#fff", fontSize: "13px", fontWeight: 600, letterSpacing: "0.5px" }}>
                        Copyright © Press Room Publisher {currentYear}. All Right Reserved.
                    </p>
                </div>
            </footer>

            <WhatsAppButton />

            <style>{`
        @media (max-width: 768px) {
          .marketing-nav-desktop { display: none !important; }
          .marketing-nav-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .marketing-nav-mobile { display: none !important; }
        }
      `}</style>
        </div>
    );
}
