// =============================================================================
// FILE: next.config.ts
// PURPOSE: Next.js configuration file. Controls build behavior, output format,
//          image optimization settings, and other framework-level options.
//          This configuration enables static HTML export for deployment to
//          Cloudflare Pages (or any static hosting provider) at zero cost.
// =============================================================================

import type { NextConfig } from "next"; // TypeScript type for the config object

const nextConfig: NextConfig = {
  // "export" mode: generates a fully static site in the 'out/' directory.
  // No Node.js server is needed at runtime — pure HTML/CSS/JS files.
  // This enables free hosting on Cloudflare Pages, Netlify, GitHub Pages, etc.
  output: "export",

  // Image optimization settings
  images: {
    // Disable Next.js built-in image optimization (requires a server).
    // Static export cannot use the Image Optimization API.
    // Images will be served as-is without on-the-fly resizing/WebP conversion.
    unoptimized: true,
  },
};

// Export the configuration object as the default export
export default nextConfig;
