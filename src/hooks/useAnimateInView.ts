// =============================================================================
// FILE: src/hooks/useAnimateInView.ts
// PURPOSE: Custom hook that combines Framer Motion's useInView with a ref.
//          Provides a reusable pattern for triggering animations when
//          elements scroll into the viewport.
// =============================================================================

"use client"; // Required: hooks using browser APIs must run on the client

import { useRef } from "react";            // React hook to create a mutable ref object
import { useInView } from "framer-motion"; // Framer Motion hook to detect element visibility

/**
 * Custom hook for scroll-triggered animations.
 * Returns a ref to attach to the target element and a boolean
 * indicating if the element is currently visible in the viewport.
 *
 * @param once - If true, animation triggers only once (default: true)
 *               Once triggered, isInView stays true even after scrolling away
 *
 * @returns Object containing:
 *   - ref: React ref to attach to the observed element
 *   - isInView: Boolean that becomes true when element enters viewport
 *
 * @example
 * const { ref, isInView } = useAnimateInView();
 * <div ref={ref}>
 *   <motion.div animate={isInView ? { opacity: 1 } : { opacity: 0 }} />
 * </div>
 */
export function useAnimateInView(once: boolean = true) {
  // Create a ref that will be attached to the DOM element we want to observe
  const ref = useRef(null);

  // useInView returns true when the ref'd element enters the viewport
  // 'once: true' means it won't reset to false when scrolled out of view
  // 'margin' acts like IntersectionObserver's rootMargin — triggers 100px early
  const isInView = useInView(ref, { once, margin: "-100px" });

  // Return both the ref (to attach) and the visibility state (to animate)
  return { ref, isInView };
}
