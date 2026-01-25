import React from "react";

/**
 * SkipToContent: Visibly hidden until focused, then appears for keyboard users.
 * Usage: Place as first child in App or Layout.
 */
const SkipToContent = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-primary text-white px-4 py-2 rounded shadow outline-none"
    tabIndex={0}
    aria-label="Skip to main content"
  >
    Skip to main content
  </a>
);

export default SkipToContent;
