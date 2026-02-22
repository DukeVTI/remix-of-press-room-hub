import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AboutModalProps {
    open: boolean;
    onContinue: () => void;
    onClose: () => void;
}

export function AboutModal({ open, onContinue, onClose }: AboutModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm shadow-inner"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal panel */}
            <div
                ref={dialogRef}
                className="
          relative z-10 flex flex-col
          w-full h-full
          sm:h-auto sm:max-h-[85vh] sm:max-w-xl sm:rounded-2xl
          bg-background shadow-2xl border border-border
          overflow-hidden animate-in zoom-in-95 duration-300
        "
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-muted/30">
                    <div className="flex items-center gap-2">
                        <img
                            src="https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/cropped-PRP-ICON_-transparetn-32x32.png"
                            alt="PRP"
                            className="w-6 h-6 rounded"
                        />
                        <h2 id="about-modal-title" className="text-base font-semibold text-foreground">
                            About Press Room Publisher
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
                    <section>
                        <h3 className="text-xl font-bold text-foreground mb-3">About Press Room Publisher</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Press Room Publisher is a modern publishing platform designed to empower writers, journalists, and content creators to share their stories with the world.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Our Mission</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We believe everyone has a story worth telling. Our mission is to provide the tools and platform that make publishing accessible, professional, and impactful for creators of all backgrounds.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">What We Offer</h3>
                        <ul className="space-y-3">
                            {[
                                "Multiple publications from a single account",
                                "Team collaboration with up to 5 administrators per blog",
                                "Multi-language support for global audiences",
                                "Accessible design with full screen reader support",
                                "Instant publishing with no setup required"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-muted-foreground leading-snug">
                                    <span className="text-accent shrink-0 mt-1">✓</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="pb-4">
                        <h3 className="text-lg font-semibold text-foreground mb-3">Our Community</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We're building a community of passionate writers and engaged readers. Whether you're sharing breaking news, personal essays, or expert insights, Press Room Publisher connects you with an audience that cares.
                        </p>
                    </section>
                </div>

                {/* Footer actions */}
                <div className="shrink-0 flex flex-col sm:flex-row-reverse gap-3 px-6 py-4 border-t border-border bg-muted/10">
                    <Button
                        onClick={onContinue}
                        className="w-full sm:w-auto btn-accent font-semibold px-8"
                    >
                        Continue to Sign Up
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full sm:w-auto text-muted-foreground"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
