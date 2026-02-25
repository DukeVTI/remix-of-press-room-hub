import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

const Index = () => {
  const navigate = useNavigate();

  useSeo({
    title: "Press Room Publisher - Independent Journalism Platform",
    description: "Press Room Publisher is a modern blogging platform for journalists, writers, and news organizations. Create and manage your publication with ease.",
    keywords: ["journalism", "blogging platform", "independent media", "press room", "publishing", "news"],
  });

  useEffect(() => {
    const redirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    };
    redirect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading Press Room Publisher" />
    </div>
  );
};

export default Index;
