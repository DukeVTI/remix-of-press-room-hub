import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuIcon, X, Search, Edit3 } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// PRP Logo URL
const PRP_LOGO = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/cropped-PRP-ICON_-transparetn-32x32.png";

interface PRPHeaderProps {
  isAuthenticated?: boolean;
}

export function PRPHeader({ isAuthenticated = false }: PRPHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  // Navigation links for visitors (not signed in)
  const visitorLinks = [
    { label: 'Our story', href: '/about' },
  ];

  // Navigation links for authenticated users
  const authLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Write', href: '/dashboard', icon: Edit3 },
  ];

  const links = isAuthenticated ? authLinks : visitorLinks;

  return (
    <header
      className="sticky top-0 z-50 w-full bg-background border-b border-border"
      role="banner"
    >
      <nav 
        className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2"
          aria-label="Press Room Publisher - Home"
        >
          <img 
            src={PRP_LOGO} 
            alt="Press Room Publisher logo" 
            className="w-8 h-8"
          />
          <span className="font-serif text-xl font-medium text-foreground hidden sm:block">
            Press Room Publisher
          </span>
        </Link>

        {/* Right side - Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {/* Search button */}
          <Link to="/search">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Search stories"
            >
              <Search className="h-4 w-4 mr-2" aria-hidden="true" />
              Search
            </Button>
          </Link>

          {/* Nav Links */}
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href + link.label}
                to={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-normal rounded-full transition-colors",
                  "hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-4"
                >
                  Get started
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/dashboard" className="ml-2">
              <Button 
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit3 className="h-4 w-4 mr-2" aria-hidden="true" />
                Write
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen(!open)}
            className="md:hidden h-9 w-9"
            aria-label="Open navigation menu"
            aria-expanded={open}
          >
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
          </Button>
          <SheetContent
            className="bg-background w-full sm:max-w-sm p-0 border-l border-border"
            side="right"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link 
                to="/" 
                className="flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <img 
                  src={PRP_LOGO} 
                  alt="Press Room Publisher logo" 
                  className="w-7 h-7"
                />
                <span className="font-serif text-lg font-medium text-foreground">
                  Press Room Publisher
                </span>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="h-8 w-8"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col p-4 gap-1">
              <Link
                to="/search"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setOpen(false)}
              >
                <Search className="h-5 w-5" aria-hidden="true" />
                Search
              </Link>
              
              {links.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href + link.label}
                    to={link.href}
                    className={cn(
                      "px-4 py-3 rounded-lg text-base transition-colors",
                      "hover:bg-muted",
                      isActive ? "text-foreground bg-muted" : "text-muted-foreground"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Footer */}
            {!isAuthenticated && (
              <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 space-y-3 bg-background">
                <Link to="/register" className="block" onClick={() => setOpen(false)}>
                  <Button 
                    className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
                  >
                    Get started
                  </Button>
                </Link>
                <Link to="/login" className="block" onClick={() => setOpen(false)}>
                  <Button 
                    variant="outline" 
                    className="w-full h-11 rounded-full"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 bg-background">
                <Link to="/dashboard" className="block" onClick={() => setOpen(false)}>
                  <Button 
                    className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
                  >
                    <Edit3 className="h-4 w-4 mr-2" aria-hidden="true" />
                    Write a story
                  </Button>
                </Link>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
