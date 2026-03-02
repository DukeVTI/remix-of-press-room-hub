

# UI Polish for Marketing Pages + Fix Build Error

## Build Error Fix
The `send-verification-email` and `send-welcome-email` edge functions use `npm:resend@2.0.0` which fails in Deno. Change both to `https://esm.sh/resend@2.0.0` (matching the already-fixed password reset function).

## UI Improvements — Same Design, Cleaner Experience

All pages currently use heavy inline styles. The plan is to **migrate to Tailwind CSS classes** using the existing design system (DM Sans, Source Serif 4, CSS variables) while keeping the same layout, content, colors, and flow. This will produce cleaner rendering, better responsive behavior, smoother transitions, and consistent typography.

### MarketingLayout (shared navbar + footer)
- Replace all inline styles with Tailwind classes
- Use brand fonts (DM Sans for nav, Source Serif 4 for headings)
- Add smooth mobile menu transition (slide-down instead of instant appear)
- Improve footer spacing and hover states with Tailwind transitions
- Keep exact same structure: sticky nav, logo, links, hamburger, 4-column footer, green copyright bar

### Home Page (`/`)
- Convert inline styles to Tailwind; use `font-serif` for headings, `font-sans` for body
- Add subtle fade-in animations on scroll for the sign-up and login sections
- Improve the two-column grid responsiveness with proper Tailwind breakpoints
- Keep the YouTube hero, dual logos, sign-up/login sections, and tagline banner exactly as-is

### About Page (`/about`)
- Convert to Tailwind classes
- Use the existing `.article-body` class for the long-form text
- Add the green left-border vision block using Tailwind `border-l-4 border-green-600`
- Improve mission section text contrast slightly

### News Circle (`/news-circle`)
- Convert to Tailwind
- Improve the microphone image + text two-column layout with better gap and alignment
- Make the long CTA button text wrap better on mobile

### Career (`/career`)
- Convert to Tailwind
- Add a subtle icon or decorative element to break up the single-paragraph layout
- Better vertical rhythm

### Connect (`/connect`)
- Convert form to Tailwind using the existing `.input-modern` class from the design system
- Improve form field focus states with the green brand color via Tailwind `focus:border-green-600`
- Better responsive stacking of form + contact sidebar

### Policy (`/privacy`)
- Convert to Tailwind
- Use consistent section heading style with green underline
- Better reading width and paragraph spacing using existing typography classes

### Technical Approach
- All 7 files rewritten with Tailwind classes instead of inline `style={{}}` objects
- Zero content changes — all text, images, links, colors preserved
- Responsive behavior improved via Tailwind breakpoints (`md:`, `lg:`)
- Brand fonts applied consistently via CSS variables already in `index.css`

