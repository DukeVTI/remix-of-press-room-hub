import { useEffect } from "react";
import { useSeo } from "@/hooks/useSeo";

const About = () => {
  useSeo({
    title: "About Press Room Publisher",
    description: "Learn about Press Room Publisher, a platform for independent journalists and news organizations.",
    keywords: ["about", "press room publisher", "journalism platform"],
  });

  useEffect(() => {
    window.location.replace("https://pressroompublisher.broadcasterscommunity.com/about");
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to pressroompublisher.broadcasterscommunity.com…</p>
    </div>
  );
};

export default About;
