# 1N599 Labs

**"For you always"**

AI startup building intelligent products for Real Estate, HR, and Healthcare industries.

🌐 [1n599labs.com](https://1n599labs.com)

## Tech Stack

- **Next.js 16** — React framework with App Router
- **TailwindCSS v4** — Utility-first CSS
- **Framer Motion** — Animations and transitions
- **React Three Fiber + Three.js** — 3D particle/neural network visualization
- **Lucide React** — Icon library
- **TypeScript** — Type safety

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
```

Static output is generated in the `out/` directory.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Go to [Cloudflare Pages](https://dash.cloudflare.com/) → Pages → Create a project
3. Connect your GitHub repository
4. Configure build settings:
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
5. Deploy
6. In your Cloudflare dashboard, go to your domain (1n599labs.com) → DNS
7. Add a CNAME record pointing to your Pages project (e.g., `1n599-labs.pages.dev`)

All on the **free tier** — no costs.

## Project Structure

```
src/
├── app/                          # Next.js App Router (pages & layouts)
│   ├── globals.css               #   Global styles, animations, theme tokens
│   ├── layout.tsx                #   Root layout (fonts, metadata, <html>/<body>)
│   └── page.tsx                  #   Main landing page (composes all sections)
│
├── components/                   # React components (organized by concern)
│   ├── ui/                       #   Reusable UI primitives
│   │   ├── index.ts              #     Barrel exports
│   │   ├── Logo.tsx              #     Animated SVG brand logo
│   │   └── Navbar.tsx            #     Fixed nav with glass-morphism + mobile menu
│   ├── sections/                 #   Page-level section components
│   │   ├── index.ts              #     Barrel exports
│   │   ├── Hero.tsx              #     Full-screen hero with 3D background + CTAs
│   │   ├── About.tsx             #     Company intro + 3 feature cards
│   │   ├── Products.tsx          #     Industry domain cards (RE/HR/Healthcare)
│   │   ├── Mission.tsx           #     "For you always" statement + stats
│   │   ├── Founder.tsx           #     Founder profile + social links
│   │   └── Contact.tsx           #     Contact info, form, and footer
│   └── three/                    #   Three.js / WebGL 3D components
│       ├── index.ts              #     Barrel exports
│       └── ParticleField.tsx     #     Particles + neural network scene
│
├── hooks/                        # Custom React hooks
│   ├── index.ts                  #   Barrel exports
│   └── useAnimateInView.ts       #   Scroll-triggered animation hook
│
├── lib/                          # Utilities & configuration
│   ├── constants.ts              #   App-wide constants (nav links, company info, colors)
│   └── utils.ts                  #   Helper functions (cn class merger)
│
└── types/                        # TypeScript type definitions
    └── index.ts                  #   Shared interfaces (NavLink, Product, Feature, etc.)
```

### Architecture Principles

- **Separation of Concerns**: UI primitives, page sections, 3D scenes, hooks, and data are all in dedicated folders
- **Barrel Exports**: Each folder has an `index.ts` for clean, short imports
- **Constants Extraction**: All content/data lives in `lib/constants.ts`, keeping components logic-focused
- **Custom Hooks**: Reusable stateful logic abstracted into `hooks/`
- **Type Safety**: All shared data shapes defined in `types/`
- **Every line commented**: Comprehensive inline documentation for learning and maintenance

## License

Proprietary — 1N599 Labs © 2024
