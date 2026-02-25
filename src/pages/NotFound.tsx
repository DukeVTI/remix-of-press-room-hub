import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

const NotFound = () => {
  const location = useLocation();

  useSeo({
    title: "Page Not Found - 404",
    description: "The page you're looking for doesn't exist or has been moved.",
    noindex: true,
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <PRPHeader isAuthenticated={false} />

      <main 
        id="main-content" 
        role="main" 
        className="flex-1 flex items-center justify-center px-4 py-16"
      >
        <div className="text-center max-w-md">
          <div 
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center"
            aria-hidden="true"
          >
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          
          <h1 className="display-lg text-foreground mb-4" aria-label="404 Not Found">
            Page not found
          </h1>
          
          <p className="body-lg text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link to="/">
            <Button className="btn-accent rounded-full" aria-label="Return to homepage">
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back to home
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
