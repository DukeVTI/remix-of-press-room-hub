import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useSeo } from "@/hooks/useSeo";

export default function Privacy() {
  useSeo({
    title: "Privacy Policy – Press Room Publisher",
    description: "Read the Privacy Policy for Press Room Publisher, a subsidiary of PAVE Broadcasters Community Limited.",
  });

  return (
    <MarketingLayout>
      {/* Page header */}
      <div style={{
        backgroundColor: "#111",
        padding: "60px 48px",
        display: "flex",
        alignItems: "center",
      }}>
        <h1 style={{
          color: "#fff",
          fontSize: "clamp(24px, 4vw, 40px)",
          fontWeight: 900,
          letterSpacing: "3px",
          textTransform: "uppercase",
          margin: 0,
        }}>PRIVACY POLICY</h1>
      </div>

      <section style={{ backgroundColor: "#fff", padding: "60px 24px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", color: "#333", fontSize: "15px", lineHeight: 1.9 }}>

          <Section title="Introduction">
            <p>
              This website is owned and operated by PAVE BROADCASTERS COMMUNITY LIMITED. This Privacy Policy describes
              how we collect, use, and protect the information you provide when using the Press Room Publisher platform.
              By using this website, you agree to the terms of this policy.
            </p>
          </Section>

          <Section title="Information Collection and Usage">
            <p>
              We collect personal information you voluntarily provide, including but not limited to your name, email
              address, and phone number, when you register an account, contact us, or use our services. This information
              is used to provide and improve our services, communicate with you, and personalise your experience on
              the platform.
            </p>
          </Section>

          <Section title="Log Data">
            <p>
              When you visit our website, our servers automatically record information (Log Data) including your
              IP address, browser type and version, the pages you visit, the time and date of your visit, and the
              time spent on those pages. We use Google Analytics to help understand how our users engage with the site.
              This data is collected anonymously and does not personally identify you.
            </p>
          </Section>

          <Section title="Communications">
            <p>
              With your consent, we may use your email address to send you newsletters, updates, or important
              notifications about the platform. You may opt out of these communications at any time by following
              the unsubscribe link in any email we send, or by contacting us directly.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Press Room Publisher uses cookies to enhance your browsing experience. Cookies are small data files
              stored on your device that help us remember your preferences and improve site performance. You may
              disable cookies through your browser settings; however, some features of the platform may not function
              properly without them.
            </p>
          </Section>

          <Section title="Security">
            <p>
              We are committed to ensuring that your information is secure. We have implemented appropriate technical
              and organisational measures to protect against unauthorised access, alteration, disclosure, or destruction
              of your personal data. However, please note that no method of transmission over the internet or method
              of electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with a
              revised effective date. This policy is effective as of <strong>November 2025</strong>. We encourage
              you to review this page periodically to stay informed about how we protect your information.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at:{" "}
              <a
                href="mailto:policy@broadcasterscommunity.com"
                style={{ color: "#00ad00", textDecoration: "underline" }}
              >
                policy@broadcasterscommunity.com
              </a>
            </p>
          </Section>
        </div>
      </section>
    </MarketingLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <h2 style={{
        fontSize: "17px",
        fontWeight: 800,
        color: "#111",
        textTransform: "uppercase",
        letterSpacing: "1px",
        borderBottom: "2px solid #00ad00",
        paddingBottom: "8px",
        marginBottom: "16px",
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
