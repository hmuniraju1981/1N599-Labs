// =============================================================================
// FILE: src/components/ui/ScrollToTop.tsx
// PURPOSE: Guarantees every visitor lands at the very top of the landing page.
//
//          Two browser behaviours otherwise break this:
//          1. Scroll restoration — browsers replay your previous scroll offset
//             on reload/back-navigation. Setting scrollRestoration to "manual"
//             hands that decision back to us.
//          2. Hash auto-scroll — a URL like /#contact makes the browser jump
//             straight to that section on load. We strip the hash and reset.
//
//          Renders nothing. Mounted once from the root layout.
// =============================================================================

"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    // Stop the browser replaying the visitor's previous scroll position.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // If the URL carries a hash, the browser will have scrolled to it. Remove
    // the hash without adding a history entry so Back still works normally.
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }

    // globals.css applies `scroll-behavior: smooth` to every element, which
    // would otherwise animate this reset. "instant" keeps the landing snap hard.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return null;
}
