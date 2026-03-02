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

    return (
        <MarketingLayout>
            {/* Page header */}
            <div
                className="relative h-[220px] bg-cover bg-center flex items-center px-12"
                style={{ backgroundImage: `url(${HEADER_IMG})` }}
            >
                <div className="absolute inset-0 bg-black/[0.55]" />
                <h1 className="relative z-10 text-white font-black tracking-[3px] uppercase" style={{ fontSize: "clamp(28px, 5vw, 48px)" }}>
                    CONNECT
                </h1>
            </div>

            <section className="bg-white py-16 px-6">
                <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-14 items-start">
                    {/* ── Contact form ── */}
                    <div>
                        <h2 className="text-[22px] font-extrabold text-[#111] mb-7">
                            Send Us a Message
                        </h2>

                        {sent ? (
                            <div className="bg-[#f0fff0] border border-[#00ad00] rounded-lg p-6 text-[#005500] text-[15px] leading-relaxed">
                                ✅ Thank you! Your message has been sent. We'll get back to you shortly.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-semibold text-[#555] mb-1.5">
                                            First Name *
                                        </label>
                                        <input
                                            name="firstName"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            required
                                            placeholder="John"
                                            aria-label="First Name"
                                            className="w-full px-4 py-3 border border-[#ddd] rounded text-sm text-[#333] outline-none transition-colors duration-200 focus:border-[#00ad00] font-[inherit]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-semibold text-[#555] mb-1.5">
                                            Last Name *
                                        </label>
                                        <input
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Doe"
                                            aria-label="Last Name"
                                            className="w-full px-4 py-3 border border-[#ddd] rounded text-sm text-[#333] outline-none transition-colors duration-200 focus:border-[#00ad00] font-[inherit]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[13px] font-semibold text-[#555] mb-1.5">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@example.com"
                                        aria-label="Email Address"
                                        className="w-full px-4 py-3 border border-[#ddd] rounded text-sm text-[#333] outline-none transition-colors duration-200 focus:border-[#00ad00] font-[inherit]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-semibold text-[#555] mb-1.5">
                                        Subject *
                                    </label>
                                    <input
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="How can we help you?"
                                        aria-label="Subject"
                                        className="w-full px-4 py-3 border border-[#ddd] rounded text-sm text-[#333] outline-none transition-colors duration-200 focus:border-[#00ad00] font-[inherit]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-semibold text-[#555] mb-1.5">
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        placeholder="Write your message here..."
                                        aria-label="Message"
                                        className="w-full px-4 py-3 border border-[#ddd] rounded text-sm text-[#333] outline-none transition-colors duration-200 focus:border-[#00ad00] font-[inherit] resize-y"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-fit bg-[#00ad00] text-white border-none py-3.5 px-10 font-bold text-sm tracking-[1.5px] uppercase rounded cursor-pointer transition-colors duration-200 hover:bg-[#008f00] disabled:opacity-70 disabled:cursor-not-allowed font-[inherit]"
                                >
                                    {sending ? "Sending..." : "SEND"}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* ── Direct contact ── */}
                    <div className="pt-2">
                        <h2 className="text-[22px] font-extrabold text-[#111] mb-7">
                            Direct Contact
                        </h2>
                        <div className="flex flex-col gap-5">
                            <a
                                href="https://wa.me/message/BROADCASTERSCOMMUNITY"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-[#25D366] text-white py-3.5 px-5 rounded-md no-underline font-bold text-sm transition-colors duration-200 hover:bg-[#1da851]"
                                aria-label="Chat with Press Room Publisher on WhatsApp"
                            >
                                <svg viewBox="0 0 32 32" width="22" height="22" fill="white" aria-hidden="true">
                                    <path d="M16.003 2.667C8.639 2.667 2.667 8.639 2.667 16c0 2.347.633 4.549 1.737 6.452L2.667 29.333l7.072-1.713A13.29 13.29 0 0016.003 29.333C23.364 29.333 29.333 23.364 29.333 16c0-7.364-5.969-13.333-13.33-13.333zm6.21 15.51c-.341-.17-2.016-.994-2.329-1.107-.312-.113-.539-.17-.766.17-.228.341-.882 1.107-1.081 1.335-.199.227-.397.256-.738.086-.341-.17-1.44-.531-2.742-1.692-1.013-.904-1.697-2.02-1.896-2.361-.199-.341-.021-.525.15-.694.154-.153.341-.399.512-.598.17-.2.227-.341.341-.569.113-.227.057-.426-.028-.598-.086-.17-.766-1.847-1.05-2.53-.277-.664-.558-.574-.766-.584l-.653-.011a1.253 1.253 0 00-.909.426c-.312.341-1.193 1.165-1.193 2.843s1.221 3.298 1.392 3.525c.17.228 2.403 3.668 5.822 5.144.814.351 1.449.561 1.944.718.817.26 1.561.224 2.148.136.655-.098 2.016-.824 2.3-1.62.284-.795.284-1.478.199-1.62-.086-.142-.312-.228-.653-.399z" />
                                </svg>
                                Chat with us on WhatsApp
                            </a>

                            <div className="flex items-center gap-3 text-[#444]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ad00" strokeWidth="2" aria-hidden="true">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <a
                                    href="mailto:hello.prp@broadcasterscommunity.com"
                                    className="text-[#333] no-underline text-sm transition-colors duration-200 hover:text-[#00ad00]"
                                    aria-label="Email Press Room Publisher"
                                >
                                    hello.prp@broadcasterscommunity.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
