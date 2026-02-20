import { Link } from "react-router-dom";

// PRP Logo URL
const PRP_LOGO = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/cropped-PRP-ICON_-transparetn-32x32.png";
const MAIN_SITE_URL = "https://pressroompublisher.broadcasterscommunity.com";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="py-6 border-t border-border bg-muted/30"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-4">
            <a 
              href={MAIN_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
              aria-label="Press Room Publisher main website (opens in new tab)"
            >
              <img 
                src={PRP_LOGO} 
                alt="Press Room Publisher logo" 
                className="w-6 h-6"
              />
              <span className="font-serif text-sm font-medium text-foreground">
                Press Room Publisher
              </span>
            </a>
            <span className="text-sm text-muted-foreground">
              © {currentYear}
            </span>
          </div>
          
          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex items-center gap-4">
              <li>
                <a 
                  href={`${MAIN_SITE_URL}/about`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="About Press Room Publisher (opens main site)"
                >
                  About
                </a>
              </li>
              <li>
                <Link 
                  to="/help"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <a 
                  href={`${MAIN_SITE_URL}/privacy-policy`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Privacy Policy (opens main site)"
                >
                  Privacy
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
