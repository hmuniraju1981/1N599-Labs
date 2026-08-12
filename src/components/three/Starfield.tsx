// =============================================================================
// FILE: src/components/three/Starfield.tsx
// PURPOSE: Canvas starfield for the hero — LAYER 2 of the traversal composite.
//          Stars spawn near the centre and accelerate outward toward the viewer
//          across three parallax bands, producing a slow sense of travelling
//          through space. Deliberately a gentle cinematic drift, not a warp.
//
// PERFORMANCE / ACCESSIBILITY CONTRACT:
//   - requestAnimationFrame, throttled to 30fps
//   - devicePixelRatio aware (capped at 2 so retina does not quadruple the fill)
//   - cancelled on unmount
//   - paused when the tab is hidden (visibilitychange)
//   - paused when the hero scrolls out of view (IntersectionObserver)
//   - not rendered at all below 768px, or when hardwareConcurrency <= 4
//   - not rendered at all under prefers-reduced-motion: reduce
// The last three checks live in the parent (Hero) so this component is never
// even mounted in those cases — cheaper than mounting and bailing out.
//
// The canvas is purely decorative: aria-hidden and pointer-events-none, sized
// to its container via absolute inset-0 so it can never affect page height or
// introduce a scrollbar.
// =============================================================================

"use client";

import { useEffect, useRef } from "react";

// Three parallax bands. Far stars are small, dim and slow; near stars are
// larger, brighter and faster, which is what sells the depth.
const BANDS = [
  { count: 60, speed: 0.028, size: [0.4, 0.9], alpha: [0.18, 0.42] },
  { count: 40, speed: 0.055, size: [0.7, 1.4], alpha: [0.35, 0.65] },
  { count: 20, speed: 0.095, size: [1.1, 2.1], alpha: [0.6, 0.95] },
] as const;

const TOTAL_STARS = BANDS.reduce((n, b) => n + b.count, 0); // 120
const FRAME_MS = 1000 / 30; // 30fps throttle
const MAX_DPR = 2;

interface Star {
  x: number; // position relative to centre, in CSS px
  y: number;
  depth: number; // 0..1 — how far "toward" the viewer the star has travelled
  speed: number;
  size: number;
  alpha: number;
  hue: string;
}

// Subtle brand tint so the field sits inside the palette rather than fighting it.
const STAR_COLOURS = ["255,255,255", "186,230,253", "216,205,255"];

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];

    // ---------------------------------------------------------------------
    // Sizing. Reads the parent's box rather than the viewport so the canvas
    // matches the hero exactly and cannot extend the page.
    // ---------------------------------------------------------------------
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Draw in CSS pixels; the transform handles the device ratio.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // ---------------------------------------------------------------------
    // Star lifecycle. Stars are seeded at a random depth on first fill so the
    // field looks established immediately instead of erupting from the centre.
    // ---------------------------------------------------------------------
    const spawn = (band: (typeof BANDS)[number], seeded: boolean): Star => {
      const angle = Math.random() * Math.PI * 2;
      // Start close to the centre; radius grows with depth as it approaches.
      const radius = seeded ? Math.random() : Math.random() * 0.12;

      return {
        x: Math.cos(angle) * radius * (width / 2),
        // Scaled by the same factor used for the vanishing point, so seeded
        // stars fill the frame evenly rather than clustering.
        y: Math.sin(angle) * radius * (height / 2),
        depth: seeded ? Math.random() : 0,
        speed: band.speed * (0.75 + Math.random() * 0.5),
        size: band.size[0] + Math.random() * (band.size[1] - band.size[0]),
        alpha: band.alpha[0] + Math.random() * (band.alpha[1] - band.alpha[0]),
        hue: STAR_COLOURS[Math.floor(Math.random() * STAR_COLOURS.length)],
      };
    };

    const seed = () => {
      stars = [];
      for (const band of BANDS) {
        for (let i = 0; i < band.count; i++) stars.push(spawn(band, true));
      }
    };

    const bandFor = (index: number) => {
      let offset = 0;
      for (const band of BANDS) {
        offset += band.count;
        if (index < offset) return band;
      }
      return BANDS[0];
    };

    // ---------------------------------------------------------------------
    // Frame
    //
    // The vanishing point sits at 38% of the height, not 50%. The canvas now
    // spans the hero AND the assistant section, so the geometric centre of the
    // canvas falls behind the assistant card where it would be hidden. 38%
    // puts it in the hero, roughly behind the wordmark, which is where the
    // sense of travelling forward needs to originate.
    // ---------------------------------------------------------------------
    const CENTRE_Y = 0.38;
    const cx = () => width / 2;
    const cy = () => height * CENTRE_Y;

    const draw = (deltaScale: number) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Accelerate outward: the further along, the faster it moves, which
        // reads as approaching the viewer.
        star.depth += star.speed * deltaScale * (0.35 + star.depth);

        if (star.depth >= 1) {
          stars[i] = spawn(bandFor(i), false);
          continue;
        }

        // Ease the outward travel so motion is gentle near the centre.
        const travel = star.depth * star.depth;
        const px = cx() + star.x * (1 + travel * 6);
        const py = cy() + star.y * (1 + travel * 6);

        // Cull once outside the box, and recycle immediately.
        if (px < -20 || px > width + 20 || py < -20 || py > height + 20) {
          stars[i] = spawn(bandFor(i), false);
          continue;
        }

        // Fade in from the centre and out at the edges so nothing pops.
        const fade = Math.sin(Math.min(1, star.depth) * Math.PI);
        ctx.globalAlpha = star.alpha * fade;
        ctx.fillStyle = `rgb(${star.hue})`;

        const size = star.size * (0.6 + travel * 2.2);
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    // ---------------------------------------------------------------------
    // Loop with 30fps throttle and pause gates
    // ---------------------------------------------------------------------
    let frame = 0;
    let last = 0;
    let inView = true;
    let visible = !document.hidden;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      const elapsed = now - last;
      if (elapsed < FRAME_MS) return;
      last = now;

      // Normalise against the target frame so speed is independent of the
      // actual cadence, and clamp so a long pause cannot jump the field.
      draw(Math.min(elapsed / FRAME_MS, 3));
    };

    const start = () => {
      if (frame || !inView || !visible) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) start();
      else stop();
    };

    resize();
    seed();

    // Pause when the hero leaves the viewport — no point animating offscreen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0 },
    );
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    // Re-seed on resize so density suits the new box.
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        seed();
      }, 150);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    start();

    return () => {
      stop();
      observer.disconnect();
      clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="starfield"
      data-star-count={TOTAL_STARS}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
