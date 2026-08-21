// =============================================================================
// FILE: src/components/ui/ScrollToTop.tsx
// PURPOSE: Controls where a visitor lands vertically on page load.
//
//          Browsers otherwise replay your previous scroll offset on reload and
//          back-navigation, which meant returning to the site could drop you into
//          the middle of a section with no context. Setting scrollRestoration to
//          "manual" hands that decision back to us, and with no fragment in the
//          URL we start at the top.
//
// WHY IT NO LONGER STRIPS THE HASH:
//          It used to delete any fragment and force a scroll to the top, so that
//          /#contact still landed on the hero. That was tenable while every
//          fragment was a section on the single landing page. It is not tenable
//          now, for two reasons:
//            1. The site has policy pages, and their clauses have deep links
//               (/privacy#your-rights). Stripping the fragment made every one of
//               those links land at the top of the document instead.
//            2. Cross-page navigation now needs root-relative anchors (/#about),
//               because a bare #about does nothing from /privacy. Stripping the
//               fragment made every navbar link from a policy page dump the
//               visitor at the top of the homepage.
//          So an explicit fragment is now honoured: if you asked for a specific
//          part of the page, you get it. Absent a fragment, the old behaviour is
//          unchanged.
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

    const hash = window.location.hash;

    if (!hash) {
      // globals.css applies `scroll-behavior: smooth` to every element, which
      // would otherwise animate this reset. "instant" keeps the landing snap hard.
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    // An explicit target was requested. The browser has usually already scrolled
    // there, but not reliably: with scrollRestoration set to manual, and with
    // sections that mount after hydration, the element may not have existed when
    // the browser first tried. Re-running it here is the correction.
    //
    // decodeURIComponent because a fragment may be percent-encoded, and
    // CSS.escape because an id starting with a digit is a valid HTML id but an
    // invalid CSS selector — querySelector would throw on "#1-scope".
    try {
      const id = decodeURIComponent(hash.slice(1));
      if (!id) return;

      const target = document.getElementById(id);
      // "instant" for the same reason as above: this is a landing position, not
      // a scroll the visitor initiated and should watch animate.
      target?.scrollIntoView({ behavior: "instant", block: "start" });
    } catch {
      // A malformed fragment is not worth breaking the page over; leaving the
      // scroll position wherever the browser put it is a fine outcome.
    }
  }, []);

  return null;
}
