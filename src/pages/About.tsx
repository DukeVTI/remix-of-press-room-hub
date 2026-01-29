import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <PRPHeader isAuthenticated={false} />

      <main id="main-content" role="main" className="flex-1">
        <div className="section-container py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="display-lg text-foreground mb-6">About Press Room Publisher</h1>
            
            <div className="prose prose-lg text-muted-foreground space-y-6">
              <p className="body-lg">
                Press Room Publisher is a modern publishing platform designed to empower writers, 
                journalists, and content creators to share their stories with the world.
              </p>

              <h2 className="heading-lg text-foreground mt-10 mb-4">Our Mission</h2>
              <p className="body-md">
                We believe everyone has a story worth telling. Our mission is to provide the tools 
                and platform that make publishing accessible, professional, and impactful for creators 
                of all backgrounds.
              </p>

              <h2 className="heading-lg text-foreground mt-10 mb-4">What We Offer</h2>
              <ul className="list-disc list-inside space-y-2 body-md">
                <li>Multiple publications from a single account</li>
                <li>Team collaboration with up to 5 administrators per blog</li>
                <li>Multi-language support for global audiences</li>
                <li>Accessible design with full screen reader support</li>
                <li>Instant publishing with no setup required</li>
              </ul>

              <h2 className="heading-lg text-foreground mt-10 mb-4">Our Community</h2>
              <p className="body-md">
                We're building a community of passionate writers and engaged readers. Whether you're 
                sharing breaking news, personal essays, or expert insights, Press Room Publisher 
                connects you with an audience that cares.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
