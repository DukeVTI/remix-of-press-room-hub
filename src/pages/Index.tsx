import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { 
  Users, 
  PenLine, 
  ArrowRight, 
  Shield,
  Globe,
  Zap,
  Bookmark
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <PRPHeader isAuthenticated={false} />

      {/* Hero Section - Medium-Inspired Clean */}
      <main id="main-content" role="main">
        <section 
          className="pt-16 pb-20 md:pt-24 md:pb-28 border-b border-border"
          aria-labelledby="hero-heading"
        >
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 
                id="hero-heading" 
                className="display-xl text-foreground mb-6 text-balance animate-fade-up"
              >
                Stay curious.
              </h1>
              
              <p className="body-xl text-muted-foreground mb-10 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
                Discover stories, thinking, and expertise from writers on any topic that matters to you.
              </p>
              
              <div className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="btn-accent text-base px-8 h-12 rounded-full"
                    aria-label="Start reading stories on Press Room Publisher"
                  >
                    Start reading
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section 
          className="section-default border-b border-border"
          aria-labelledby="trending-heading"
        >
          <div className="section-container">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-accent" aria-hidden="true" />
              </div>
              <h2 id="trending-heading" className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Trending on Press Room
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Trending cards placeholder */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <article key={i} className="group">
                  <div className="flex gap-4">
                    <span className="text-3xl font-bold text-muted-foreground/30">
                      0{i}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-muted" />
                        <span className="text-sm text-muted-foreground">Publisher Name</span>
                      </div>
                      <h3 className="heading-sm text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">
                        This is a sample trending headline that captures attention
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Jan 25</span>
                        <span>·</span>
                        <span>5 min read</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Clean Grid */}
        <section 
          className="section-default bg-muted/30"
          aria-labelledby="features-heading"
        >
          <div className="section-container">
            <div className="text-center mb-12">
              <h2 id="features-heading" className="heading-xl text-foreground mb-4">
                A platform built for modern publishers
              </h2>
              <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to share your ideas and build an audience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <article className="p-6" aria-labelledby="feature-1">
                <div 
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <h3 id="feature-1" className="heading-sm text-foreground mb-2">
                  Multiple Publications
                </h3>
                <p className="body-md text-muted-foreground">
                  Run separate blogs for different topics—all from one account.
                </p>
              </article>

              {/* Feature 2 */}
              <article className="p-6" aria-labelledby="feature-2">
                <div 
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <PenLine className="h-5 w-5 text-accent" />
                </div>
                <h3 id="feature-2" className="heading-sm text-foreground mb-2">
                  Team Collaboration
                </h3>
                <p className="body-md text-muted-foreground">
                  Invite up to 5 administrators per blog to help publish content.
                </p>
              </article>

              {/* Feature 3 */}
              <article className="p-6" aria-labelledby="feature-3">
                <div 
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <h3 id="feature-3" className="heading-sm text-foreground mb-2">
                  Accessible by Design
                </h3>
                <p className="body-md text-muted-foreground">
                  Built for everyone with full screen reader and keyboard support.
                </p>
              </article>

              {/* Feature 4 */}
              <article className="p-6" aria-labelledby="feature-4">
                <div 
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <Globe className="h-5 w-5 text-accent" />
                </div>
                <h3 id="feature-4" className="heading-sm text-foreground mb-2">
                  Multi-Language
                </h3>
                <p className="body-md text-muted-foreground">
                  Publish in English, Yoruba, Igbo, Hausa, French, Spanish, and more.
                </p>
              </article>

              {/* Feature 5 */}
              <article className="p-6" aria-labelledby="feature-5">
                <div 
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <Bookmark className="h-5 w-5 text-accent" />
                </div>
                <h3 id="feature-5" className="heading-sm text-foreground mb-2">
                  Save & Follow
                </h3>
                <p className="body-md text-muted-foreground">
                  Readers can follow publications and save stories for later.
                </p>
              </article>

              {/* Feature 6 */}
              <article className="p-6" aria-labelledby="feature-6">
                <div 
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <h3 id="feature-6" className="heading-sm text-foreground mb-2">
                  Instant Publishing
                </h3>
                <p className="body-md text-muted-foreground">
                  Write, preview, and publish in minutes. No setup required.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Section - Clean */}
        <section 
          className="section-default bg-foreground"
          aria-labelledby="cta-heading"
        >
          <div className="section-container text-center">
            <h2 id="cta-heading" className="heading-xl text-background mb-4">
              Start your publication today
            </h2>
            <p className="body-lg text-background/70 mb-8 max-w-lg mx-auto">
              Join thousands of writers sharing ideas that matter. Your first blog is free, forever.
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90 text-base px-8 h-12 rounded-full"
                aria-label="Create your free Press Room Publisher account"
              >
                Get started
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
