import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonicalUrl?: string;
}

const DEFAULT_IMAGE =
  "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/cropped-PRP-ICON_-transparetn-32x32.png";
const SITE_NAME = "Press Room Publisher";
const TWITTER_HANDLE = "@PressRoomPub";
const BASE_URL = "https://press-pen-pro.lovable.app";

/**
 * Custom hook to manage SEO meta tags for each page
 * Updates document title, meta descriptions, OG tags, Twitter Cards, etc.
 */
export function useSeo(config: SeoConfig) {
  const location = useLocation();

  useEffect(() => {
    const {
      title,
      description,
      keywords = [],
      image = DEFAULT_IMAGE,
      type = "website",
      author,
      publishedTime,
      modifiedTime,
      noindex = false,
      nofollow = false,
      canonicalUrl,
    } = config;

    // Set document title
    document.title = `${title} — ${SITE_NAME}`;

    // Get canonical URL
    const canonical = canonicalUrl || `${BASE_URL}${location.pathname}`;

    // Update or create meta tags
    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        const [attr, value] = selector.match(/\[(.+?)=['"](.+?)['"]\]/)?.slice(1, 3) || [];
        if (attr && value) {
          element.setAttribute(attr, value);
          document.head.appendChild(element);
        }
      }
      if (element) {
        element.setAttribute("content", content);
      }
    };

    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement("link");
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    // Basic SEO meta tags
    updateMetaTag('meta[name="description"]', description);
    if (keywords.length > 0) {
      updateMetaTag('meta[name="keywords"]', keywords.join(", "));
    }
    if (author) {
      updateMetaTag('meta[name="author"]', author);
    }

    // Robots meta
    const robotsContent = [
      noindex ? "noindex" : "index",
      nofollow ? "nofollow" : "follow",
    ].join(", ");
    updateMetaTag('meta[name="robots"]', robotsContent);

    // Canonical URL
    updateLinkTag("canonical", canonical);

    // Open Graph tags
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[property="og:url"]', canonical);
    updateMetaTag('meta[property="og:image"]', image);
    updateMetaTag('meta[property="og:site_name"]', SITE_NAME);
    updateMetaTag('meta[property="og:locale"]', "en_US");

    // Article-specific OG tags
    if (type === "article") {
      if (publishedTime) {
        updateMetaTag('meta[property="article:published_time"]', publishedTime);
      }
      if (modifiedTime) {
        updateMetaTag('meta[property="article:modified_time"]', modifiedTime);
      }
      if (author) {
        updateMetaTag('meta[property="article:author"]', author);
      }
    }

    // Profile-specific OG tags
    if (type === "profile" && author) {
      updateMetaTag('meta[property="profile:username"]', author);
    }

    // Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', "summary_large_image");
    updateMetaTag('meta[name="twitter:site"]', TWITTER_HANDLE);
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', image);
    if (author) {
      updateMetaTag('meta[name="twitter:creator"]', author);
    }

    // Additional meta tags
    updateMetaTag('meta[name="theme-color"]', "#1E40AF");
    updateMetaTag('meta[name="application-name"]', SITE_NAME);

    // Cleanup function - reset to defaults when component unmounts
    return () => {
      document.title = `${SITE_NAME} — Multi-User Blogging Platform`;
    };
  }, [config, location.pathname]);
}

/**
 * Hook to add JSON-LD structured data for rich snippets
 */
export function useStructuredData(data: Record<string, any> | null) {
  useEffect(() => {
    if (!data) return;

    const scriptId = "structured-data";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (script) {
      script.remove();
    }

    script = document.createElement("script") as HTMLScriptElement;
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [data]);
}
