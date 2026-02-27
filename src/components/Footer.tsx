import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 border-t border-border bg-muted/30" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2" aria-label="Press Room Publisher home">
              <img
                src="https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/cropped-PRP-ICON_-transparetn-32x32.png"
                alt="Press Room Publisher logo"
                className="w-6 h-6"
              />
              <span className="font-serif text-sm font-medium text-foreground">Press Room Publisher</span>
            </Link>
            <span className="text-sm text-muted-foreground">© {currentYear}</span>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex items-center gap-4 flex-wrap justify-center">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              </li>
              <li>
                <Link to="/news-circle" className="text-sm text-muted-foreground hover:text-foreground transition-colors">News Circle</Link>
              </li>
              <li>
                <Link to="/connect" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Connect</Link>
              </li>
              <li>
                <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help</Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
