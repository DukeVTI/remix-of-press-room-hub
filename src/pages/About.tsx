import { useEffect } from "react";

const About = () => {
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
