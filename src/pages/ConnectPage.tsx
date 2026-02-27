import { useState } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";

const HEADER_IMG = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&auto=format&fit=crop&q=80";

interface FormState {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
}

export default function ConnectPage() {
    useSeo({
        title: "Connect – Press Room Publisher",
        description: "Get in touch with the Press Room Publisher team. Send us a message or chat with us on WhatsApp.",
    });

    const [form, setForm] = useState<FormState>({
        firstName: "", lastName: "", email: "", subject: "", message: "",
    });
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Build mailto link as fallback
        const subject = encodeURIComponent(form.subject || "Message from PRP Website");
        const body = encodeURIComponent(
            `Name: ${form.firstName} ${form.lastName}\nEmail: ${form.email}\n\n${form.message}`
        );
        window.location.href = `mailto:hello.prp@broadcasterscommunity.com?subject=${subject}&body=${body}`;
        setTimeout(() => {
            setSent(true);
            setSending(false);
            setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
        }, 800);
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "12px 16px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "14px",
        color: "#333",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s",
        fontFamily: "inherit",
    };

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
                }}>CONNECT</h1>
            </div>

            <section style={{ backgroundColor: "#fff", padding: "64px 24px" }}>
                <div style={{
                    maxWidth: "1000px",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr",
                    gap: "56px",
                    alignItems: "start",
                }}
                    className="marketing-two-col"
                >
                    {/* ── Contact form ── */}
                    <div>
                        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111", marginBottom: "28px" }}>
                            Send Us a Message
                        </h2>

                        {sent ? (
                            <div style={{
                                backgroundColor: "#f0fff0",
                                border: "1px solid #00ad00",
                                borderRadius: "8px",
                                padding: "24px",
                                color: "#005500",
                                fontSize: "15px",
                                lineHeight: 1.7,
                            }}>
                                ✅ Thank you! Your message has been sent. We'll get back to you shortly.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                                            First Name *
                                        </label>
                                        <input
                                            name="firstName"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            required
                                            placeholder="John"
                                            style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = "#00ad00"; }}
                                            onBlur={e => { e.target.style.borderColor = "#ddd"; }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                                            Last Name *
                                        </label>
                                        <input
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Doe"
                                            style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = "#00ad00"; }}
                                            onBlur={e => { e.target.style.borderColor = "#ddd"; }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@example.com"
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = "#00ad00"; }}
                                        onBlur={e => { e.target.style.borderColor = "#ddd"; }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                                        Subject *
                                    </label>
                                    <input
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="How can we help you?"
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = "#00ad00"; }}
                                        onBlur={e => { e.target.style.borderColor = "#ddd"; }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        placeholder="Write your message here..."
                                        style={{ ...inputStyle, resize: "vertical" }}
                                        onFocus={e => { e.target.style.borderColor = "#00ad00"; }}
                                        onBlur={e => { e.target.style.borderColor = "#ddd"; }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    style={{
                                        backgroundColor: "#00ad00",
                                        color: "#fff",
                                        border: "none",
                                        padding: "14px 40px",
                                        fontWeight: 700,
                                        fontSize: "14px",
                                        letterSpacing: "1.5px",
                                        textTransform: "uppercase",
                                        borderRadius: "4px",
                                        cursor: sending ? "not-allowed" : "pointer",
                                        opacity: sending ? 0.7 : 1,
                                        transition: "background-color 0.2s",
                                        width: "fit-content",
                                        fontFamily: "inherit",
                                    }}
                                    onMouseEnter={e => { if (!sending) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#008f00"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00ad00"; }}
                                >
                                    {sending ? "Sending..." : "SEND"}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* ── Direct contact ── */}
                    <div style={{ paddingTop: "8px" }}>
                        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111", marginBottom: "28px" }}>
                            Direct Contact
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <a
                                href="https://wa.me/message/BROADCASTERSCOMMUNITY"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    backgroundColor: "#25D366",
                                    color: "#fff",
                                    padding: "14px 20px",
                                    borderRadius: "6px",
                                    textDecoration: "none",
                                    fontWeight: 700,
                                    fontSize: "14px",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#1da851"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#25D366"; }}
                            >
                                <svg viewBox="0 0 32 32" width="22" height="22" fill="white">
                                    <path d="M16.003 2.667C8.639 2.667 2.667 8.639 2.667 16c0 2.347.633 4.549 1.737 6.452L2.667 29.333l7.072-1.713A13.29 13.29 0 0016.003 29.333C23.364 29.333 29.333 23.364 29.333 16c0-7.364-5.969-13.333-13.33-13.333zm6.21 15.51c-.341-.17-2.016-.994-2.329-1.107-.312-.113-.539-.17-.766.17-.228.341-.882 1.107-1.081 1.335-.199.227-.397.256-.738.086-.341-.17-1.44-.531-2.742-1.692-1.013-.904-1.697-2.02-1.896-2.361-.199-.341-.021-.525.15-.694.154-.153.341-.399.512-.598.17-.2.227-.341.341-.569.113-.227.057-.426-.028-.598-.086-.17-.766-1.847-1.05-2.53-.277-.664-.558-.574-.766-.584l-.653-.011a1.253 1.253 0 00-.909.426c-.312.341-1.193 1.165-1.193 2.843s1.221 3.298 1.392 3.525c.17.228 2.403 3.668 5.822 5.144.814.351 1.449.561 1.944.718.817.26 1.561.224 2.148.136.655-.098 2.016-.824 2.3-1.62.284-.795.284-1.478.199-1.62-.086-.142-.312-.228-.653-.399z" />
                                </svg>
                                Chat with us on WhatsApp
                            </a>

                            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#444" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ad00" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <a
                                    href="mailto:hello.prp@broadcasterscommunity.com"
                                    style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#00ad00"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#333"; }}
                                >
                                    hello.prp@broadcasterscommunity.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`@media(max-width:768px){.marketing-two-col{grid-template-columns:1fr!important}}`}</style>
        </MarketingLayout>
    );
}
