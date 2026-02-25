import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSeo } from "@/hooks/useSeo";

const Help = () => {
  useSeo({
    title: "Help Center",
    description: "Find answers to common questions about Press Room Publisher. Learn how to create blogs, publish posts, manage your account, and more.",
    keywords: ["help", "FAQ", "support", "how to", "guide", "press room publisher"],
  });
  const faqs = [
    {
      question: "How do I create a new blog?",
      answer: "After signing in, go to your Dashboard and click 'Create Blog'. Fill in your blog name, description, category, and upload a profile photo. Your blog will be live instantly."
    },
    {
      question: "Can I have multiple blogs?",
      answer: "Yes! You can create and manage multiple publications from a single account. Each blog can have its own unique focus, branding, and team of administrators."
    },
    {
      question: "How do I add team members to my blog?",
      answer: "Navigate to your blog's management page and click 'Manage Admins'. You can invite up to 5 administrators per blog by entering their email addresses."
    },
    {
      question: "What languages are supported?",
      answer: "Press Room Publisher supports publishing in English, Yoruba, Igbo, Hausa, French, Spanish, and many more languages. You can set your blog's primary language during creation."
    },
    {
      question: "How do I report inappropriate content?",
      answer: "Click the menu icon on any post or comment and select 'Report'. Choose the reason for your report and submit. Our moderation team will review it promptly."
    },
    {
      question: "Can readers follow my blog?",
      answer: "Yes! Readers can follow your blog to receive updates when you publish new content. They can also save individual stories for later reading."
    },
    {
      question: "How do I edit or delete a post?",
      answer: "Go to your blog's management page and find the post you want to modify. Click the edit icon to make changes or the delete option to remove it entirely."
    },
    {
      question: "Is my content backed up?",
      answer: "All your content is securely stored and automatically backed up. You can access your posts, drafts, and media files at any time from your dashboard."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <PRPHeader isAuthenticated={false} />

      <main id="main-content" role="main" className="flex-1">
        <div className="section-container py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="display-lg text-foreground mb-4">Help Center</h1>
            <p className="body-lg text-muted-foreground mb-10">
              Find answers to common questions about using Press Room Publisher.
            </p>

            <section aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="heading-lg text-foreground mb-6">
                Frequently Asked Questions
              </h2>

              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left heading-sm">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="body-md text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <section className="mt-12 p-6 rounded-lg bg-muted/50" aria-labelledby="contact-heading">
              <h2 id="contact-heading" className="heading-md text-foreground mb-3">
                Still need help?
              </h2>
              <p className="body-md text-muted-foreground">
                If you can't find the answer you're looking for, please reach out to our support team 
                at <a href="mailto:support@pressroompublisher.com" className="text-accent hover:underline">support@pressroompublisher.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;
