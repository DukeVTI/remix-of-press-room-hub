import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <PRPHeader isAuthenticated={false} />

      <main id="main-content" role="main" className="flex-1">
        <div className="section-container py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="display-lg text-foreground mb-2">Privacy Policy</h1>
            <p className="body-sm text-muted-foreground mb-10">Last updated: January 2026</p>

            <div className="prose prose-lg space-y-8">
              <section>
                <h2 className="heading-lg text-foreground mb-4">Information We Collect</h2>
                <p className="body-md text-muted-foreground mb-3">
                  We collect information you provide directly, including:
                </p>
                <ul className="list-disc list-inside space-y-2 body-md text-muted-foreground">
                  <li>Account information (name, email, date of birth)</li>
                  <li>Profile information (bio, hobbies, profile photo)</li>
                  <li>Content you publish (posts, comments, media)</li>
                  <li>Communications with our support team</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">How We Use Your Information</h2>
                <p className="body-md text-muted-foreground mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 body-md text-muted-foreground">
                  <li>Provide and improve our services</li>
                  <li>Personalize your experience on the platform</li>
                  <li>Send notifications about your account and content</li>
                  <li>Ensure platform safety and security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">Information Sharing</h2>
                <p className="body-md text-muted-foreground">
                  We do not sell your personal information. We may share information with service providers 
                  who assist in operating our platform, or when required by law. Your published content is 
                  publicly visible according to your settings.
                </p>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">Data Security</h2>
                <p className="body-md text-muted-foreground">
                  We implement industry-standard security measures to protect your information. This includes 
                  encryption, secure authentication, and regular security audits. However, no system is 
                  completely secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">Your Rights</h2>
                <p className="body-md text-muted-foreground mb-3">
                  Depending on your location, you may have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 body-md text-muted-foreground">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt out of certain data processing</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">Cookies</h2>
                <p className="body-md text-muted-foreground">
                  We use cookies and similar technologies to maintain your session, remember your preferences, 
                  and analyze platform usage. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">Contact Us</h2>
                <p className="body-md text-muted-foreground">
                  If you have questions about this Privacy Policy or our data practices, please contact us 
                  at <a href="mailto:privacy@pressroompublisher.com" className="text-accent hover:underline">privacy@pressroompublisher.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
