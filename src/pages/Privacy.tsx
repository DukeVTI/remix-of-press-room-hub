import { useEffect } from "react";

const Privacy = () => {
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
