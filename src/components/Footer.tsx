import { Link } from "react-router-dom";

// PRP Logo URL
const PRP_LOGO = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/cropped-PRP-ICON_-transparetn-32x32.png";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { label: 'About', href: '/about' },
    { label: 'Help', href: '/help' },
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
  ];

  return (
    <footer 
      className="py-6 border-t border-border bg-muted/30"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={PRP_LOGO} 
                alt="Press Room Publisher logo" 
                className="w-6 h-6"
              />
              <span className="font-serif text-sm font-medium text-foreground">
                Press Room Publisher
              </span>
            </Link>
            <span className="text-sm text-muted-foreground">
              © {currentYear}
            </span>
          </div>
          
          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex items-center gap-4">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
