import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";

const Terms = () => {
  useSeo({
    title: "Terms of Service",
    description: "Read the Press Room Publisher Terms of Service. Understand your rights and responsibilities as a publisher and user on our platform.",
    keywords: ["terms of service", "terms and conditions", "user agreement", "legal"],
  });
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <PRPHeader isAuthenticated={false} />

      <main id="main-content" role="main" className="flex-1">
        <div className="section-container py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="display-lg text-foreground mb-2">Terms of Service</h1>
            <p className="body-sm text-muted-foreground mb-10">Last updated: January 2026</p>

            <div className="prose prose-lg space-y-8">
              <section>
                <h2 className="heading-lg text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="body-md text-muted-foreground">
                  By accessing or using Press Room Publisher, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">2. User Accounts</h2>
                <p className="body-md text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account credentials and 
                  for all activities that occur under your account. You must provide accurate and complete 
                  information when creating an account.
                </p>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">3. Content Guidelines</h2>
                <p className="body-md text-muted-foreground mb-3">
                  You retain ownership of the content you publish. However, you grant Press Room Publisher 
                  a license to display, distribute, and promote your content on our platform. You agree not to post:
                </p>
                <ul className="list-disc list-inside space-y-2 body-md text-muted-foreground">
                  <li>Content that infringes on intellectual property rights</li>
                  <li>False, misleading, or defamatory information</li>
                  <li>Hateful, discriminatory, or harassing content</li>
                  <li>Spam or unauthorized advertising</li>
                  <li>Content that violates any applicable laws</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">4. Platform Use</h2>
                <p className="body-md text-muted-foreground">
                  You may not use the platform to engage in any activity that disrupts or interferes with 
                  the service. This includes attempting to gain unauthorized access, introducing malware, 
                  or engaging in any form of abuse.
                </p>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">5. Termination</h2>
                <p className="body-md text-muted-foreground">
                  We reserve the right to suspend or terminate accounts that violate these terms. You may 
                  also delete your account at any time through your account settings.
                </p>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">6. Limitation of Liability</h2>
                <p className="body-md text-muted-foreground">
                  Press Room Publisher is provided "as is" without warranties of any kind. We are not liable 
                  for any indirect, incidental, or consequential damages arising from your use of the platform.
                </p>
              </section>

              <section>
                <h2 className="heading-lg text-foreground mb-4">7. Changes to Terms</h2>
                <p className="body-md text-muted-foreground">
                  We may update these terms from time to time. Continued use of the platform after changes 
                  constitutes acceptance of the modified terms.
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

export default Terms;
