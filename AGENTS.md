<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 1N599 Inc website

Static Next.js 16 site (`output: "export"`) on Cloudflare Pages, project
`1n599-inc`, serving `1n599inc.ai`. Deployed by CLI, **not** connected to git —
pushing to GitHub does not deploy anything.

## Commands

```bash
npm run dev          # local dev, no Functions
npm run build        # static export to out/
npm run lint         # eslint
npx tsc --noEmit     # typecheck (build also runs this)

npm run preview      # build + serve out/ with Functions and a local KV
npm run deploy       # build + deploy the Pages site
npm run deploy:email # deploy the private mail Worker (only when workers/email changes)
npm run deploy:all   # both, in the right order
```

`npm run lint` has **7 pre-existing errors** in
`src/components/three/ParticleField.tsx` (`react-hooks/purity`, `Math.random`
during render). They predate this baseline. Don't count them as regressions —
check the count is still 7 rather than expecting a clean run.

## Verifying a change

Nothing here is covered by tests, so verify against the deployed site:

```bash
# assistant — X-Model header names the model that actually answered
curl -sD- -X POST https://1n599inc.ai/api/assistant \
  -H 'Content-Type: application/json' -H 'Origin: https://1n599inc.ai' \
  -d '{"messages":[{"role":"user","content":"hi"}]}'

# contact form guards (a valid payload sends a real email — use a bad one)
curl -s -X POST https://1n599inc.ai/api/contact \
  -H 'Content-Type: application/json' -H 'Origin: https://1n599inc.ai' \
  -d '{"email":"bad","message":"x"}'
```

Both endpoints require a same-origin `Origin`/`Referer`, so a bare curl gets 403.
The contact form is limited to 5 requests per hour per address and the limiter
runs *before* validation, so a handful of test calls will lock you out for an
hour.

## Architecture notes that are easy to get wrong

- **`output: "export"` means no Node server.** Route Handlers that read a
  `Request` do not work. Server-side logic lives in `functions/` as Cloudflare
  Pages Functions. Shared helpers go in `server/`, *not* `functions/`, because
  every module under `functions/` becomes a public URL.
- **A Route Handler under static export needs `export const dynamic =
  "force-static"`.** `src/app/sitemap.ts` compiles to one and the build fails
  without it.
- **Pages Functions cannot hold a `send_email` binding.** That is the only reason
  `workers/email` exists as a separate Worker. The Pages project reaches it
  through an `EMAIL_SERVICE` service binding. The Worker has no public route
  (`workers_dev: false`, no routes) and its destination is an allowlist of one
  address — keep it that way, or it becomes an open relay.
- **Rate limiting must use KV, not module state.** An in-memory `Map` appears to
  work locally (one long-lived isolate) and silently never triggers on the edge.
  See the comment in `server/edge.ts`.
- **Bindings live in the Cloudflare dashboard, not a wrangler config**, for the
  Pages project. A dashboard variable overrides anything in code — a `GROQ_MODEL`
  pinned there to a retired model once broke the assistant while the code looked
  correct. Check `wrangler pages secret list` and the project's
  `deployment_configs` before concluding a code change is enough.

## Model deprecations

`functions/api/assistant.ts` walks `MODEL_CHAIN` and advances only on
availability failures, so a shutdown degrades instead of breaking. When Groq
retires a model, add its ID to `RETIRED_MODELS` and put the replacement at the
head of `MODEL_CHAIN`. Current production model IDs:
https://console.groq.com/docs/models — deprecations:
https://console.groq.com/docs/deprecations

## Email

Inbound mail for the zone is handled **only** by Cloudflare Email Routing (MX →
`*.mx.cloudflare.net`), which accepts an address only if it has an explicit rule;
the catch-all is disabled and set to drop. Routed today: `founder@`, `hr@`,
`support@`, `info@`, `sales@`, `contact@`. Anything else **bounces** — do not cite
an unrouted address in user-facing copy or the legal pages. `COMPANY.privacyEmail`
and `COMPANY.securityEmail` in `src/lib/constants.ts` point at `contact@` for this
reason.

Outbound uses Cloudflare Email Service, which can only send **to a verified
destination address**. `contact@1n599inc.ai` is a routing source, not a
destination, so `workers/email` targets the verified Gmail that `contact@`
forwards to.

## Legal pages

`LEGAL_LINKS` in `src/lib/constants.ts` is the single source of truth — the
footer, the cross-links on each policy, and `sitemap.ts` all derive from it.
Adding a policy means one entry there plus one page under `src/app/`.

The policies make specific factual claims: no cookies, no analytics, no
third-party requests on page load, conversations not stored, stated rate limits.
**If you add analytics, tracking, a cookie, or conversation logging, the cookie
policy and privacy policy become false** and must be updated in the same change
— plus a real consent mechanism before any non-essential cookie ships.
