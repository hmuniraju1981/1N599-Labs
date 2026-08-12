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

// -----------------------------------------------------------------------------
// MOTION MODEL
//
// A star's radial position r runs 0 (vanishing point) to 1 (frame edge), and
// accelerates as it approaches the viewer:  dr/dt = speed * (ACCEL_BASE + r).
// Integrating that from r=0 to r=1 gives the crossing time:
//
//     t = ln((ACCEL_BASE + 1) / ACCEL_BASE) / speed
//
// With ACCEL_BASE = 0.25 the log term is 1.609, so `speed` is calibrated
// directly from a desired crossing time: speed = 1.609 / seconds.
// The near band is tuned to ~7s, which is the brief's 6-8s window.
// -----------------------------------------------------------------------------
const ACCEL_BASE = 0.25;
const CROSS_LN = Math.log((ACCEL_BASE + 1) / ACCEL_BASE); // 1.609
const NEAR_CROSS_SECONDS = 7;
const NEAR_SPEED = CROSS_LN / NEAR_CROSS_SECONDS; // ~0.23 r/second

// Parallax spread is the depth cue: the FAR band runs at 0.15x and stays dim,
// the NEAR band at 1.0x and bright. That speed contrast is what reads as depth,
// far more than size or brightness do on their own.
const BANDS = [
  { count: 100, speedMul: 0.15, size: [0.4, 0.9], alpha: [0.14, 0.34], trail: 0 },
  { count: 50, speedMul: 0.45, size: [0.7, 1.5], alpha: [0.34, 0.62], trail: 0 },
  { count: 30, speedMul: 1.0, size: [1.1, 2.2], alpha: [0.62, 0.98], trail: 3 },
] as const;

const TOTAL_STARS = BANDS.reduce((n, b) => n + b.count, 0); // 180
const FRAME_MS = 1000 / 30; // 30fps throttle
const MAX_DPR = 2;
const TRAIL_ALPHA = 0.4; // Trails read as direction; kept well under the dot.

interface Star {
  dirX: number; // unit vector from the vanishing point
  dirY: number;
  r: number; // radial position, 0 at the vanishing point, 1 at the frame edge
  speed: number; // r units per second
  size: number;
  alpha: number;
  trail: number; // px of elongation along the vector; 0 for the far bands
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

      return {
        dirX: Math.cos(angle),
        dirY: Math.sin(angle),
        // Seeded stars are spread across the whole radius so the field looks
        // established on the first frame; respawns start at the vanishing point.
        // sqrt() spreads them by area rather than clustering them centrally.
        r: seeded ? Math.sqrt(Math.random()) : Math.random() * 0.04,
        speed: NEAR_SPEED * band.speedMul * (0.8 + Math.random() * 0.4),
        size: band.size[0] + Math.random() * (band.size[1] - band.size[0]),
        alpha: band.alpha[0] + Math.random() * (band.alpha[1] - band.alpha[0]),
        trail: band.trail,
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

    const draw = (dtSeconds: number) => {
      ctx.clearRect(0, 0, width, height);

      // Radius that takes a star from the vanishing point to the far corner.
      const reach = Math.hypot(Math.max(cx(), width - cx()), Math.max(cy(), height - cy()));

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Accelerate outward: the closer to the viewer, the faster it travels.
        star.r += star.speed * dtSeconds * (ACCEL_BASE + star.r);

        if (star.r >= 1) {
          stars[i] = spawn(bandFor(i), false);
          continue;
        }

        const dist = star.r * reach;
        const px = cx() + star.dirX * dist;
        const py = cy() + star.dirY * dist;

        // Recycle once clear of the frame rather than drawing offscreen.
        if (px < -30 || px > width + 30 || py < -30 || py > height + 30) {
          stars[i] = spawn(bandFor(i), false);
          continue;
        }

        // Fade in from the vanishing point and out at the edge so nothing pops.
        const fade = Math.sin(star.r * Math.PI);
        const size = star.size * (0.55 + star.r * 1.1);
        const colour = `rgb(${star.hue})`;

        // Trail first, so the dot sits on top of its own streak. Length scales
        // with r, so a star only streaks once it is genuinely moving quickly.
        if (star.trail > 0 && star.r > 0.12) {
          ctx.globalAlpha = star.alpha * fade * TRAIL_ALPHA;
          ctx.strokeStyle = colour;
          ctx.lineWidth = size * 0.9;
          ctx.lineCap = "round";
          const len = star.trail * star.r;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - star.dirX * len, py - star.dirY * len);
          ctx.stroke();
        }

        ctx.globalAlpha = star.alpha * fade;
        ctx.fillStyle = colour;
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

      // Real elapsed seconds, so velocity is independent of frame cadence and
      // the calibrated crossing time holds. Clamped so that returning from a
      // paused tab cannot teleport the whole field.
      draw(Math.min(elapsed, FRAME_MS * 3) / 1000);
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
