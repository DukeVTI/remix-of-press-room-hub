import { useEffect } from "react";
import { useSeo } from "@/hooks/useSeo";

const Privacy = () => {
  useSeo({
    title: "Privacy Policy - Press Room Publisher",
    description: "Read the Privacy Policy for Press Room Publisher. Learn how we protect your data and privacy.",
    keywords: ["privacy policy", "data protection", "privacy"],
  });

  useEffect(() => {
    window.location.replace("https://pressroompublisher.broadcasterscommunity.com/privacy-policy");
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to pressroompublisher.broadcasterscommunity.com…</p>
    </div>
  );
};

export default Privacy;
