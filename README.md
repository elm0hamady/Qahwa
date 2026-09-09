# Qahwa — Frontend

A standalone React frontend for the Qahwa host-controlled trivia duel API. This project
is fully decoupled from the Django backend in `core.zip` — it never imports backend code
and talks to it exclusively over HTTP/JSON.

```
Django backend  ->  REST API (JWT)  ->  this React app
```

## Language & direction

The entire UI is Arabic, right-to-left (`<html lang="ar" dir="rtl">`). Fonts are
Cairo (headings) and Tajawal (body/UI) instead of the original Latin fonts.
Layout uses Tailwind's logical properties (`ms-`/`me-`/`start-`/`end-` instead
of `ml-`/`mr-`/`left-`/`right-`) so it mirrors correctly; directional icons
(chevrons, the logout arrow) flip via the `rtl:` variant. One caveat: this only
covers our own UI strings — any `error`/`detail` message returned directly by
the Django backend (e.g. DRF validation errors) still displays in whatever
language Django itself is configured for, since that's outside the frontend's
control.

## Tech stack

- **React 19 + TypeScript + Vite**
- **React Router** - routing, protected/public route guards
- **TanStack Query** - server state, caching, mutations
- **Zustand** (+ `persist`) - auth token storage, the only real client-global state
- **Axios** - API client with a request interceptor (attaches the JWT) and a response
  interceptor (queues and retries requests through a single in-flight refresh call on 401)
- **React Hook Form + Zod** - form state and validation
- **Tailwind CSS v4** - design tokens declared once in `src/index.css` via `@theme`,
  consumed as generated utility classes (`bg-gold`, `text-violet-soft`, `shadow-glow-gold`, ...)
- **Framer Motion** - hero/board entrance and hover motion, respects `prefers-reduced-motion`
- **Vitest + Testing Library** - unit/component tests

## Main pages

| Route | Purpose |
|---|---|
| `/` | Anime/cinematic marketing landing page |
| `/login` | The only auth entry point - see *Assumptions* below |
| `/dashboard` | Resume the active session, or start a new one |
| `/games/new` | Pick exactly 4 topics, name the two players, create a session |
| `/games/:sessionId` | The live board - open tokens, judge winners, adjust scores |
| `/games/:sessionId/results` | Final scoreboard once a session finishes |
| `*` | 404 |

## API integration

Every request maps to a real backend endpoint - nothing here is mocked:

- `POST /token/`, `POST /token/refresh/`
- `GET /topics/` (search + category filter, paginated - the client walks all pages)
- `POST /sessions/`, `GET/DELETE /sessions/current/`
- `GET /sessions/{id}/questions/`, `GET /sessions/{id}/scoreboard/`
- `POST /session-questions/{id}/open/`, `POST /session-questions/{id}/judge/`
- `POST /players/{id}/adjust-score/`

Types in `src/types/api.ts` mirror the DRF serializers field-for-field.

## Authentication

JWT access + refresh tokens are stored via a Zustand store persisted to `localStorage`.
The Axios response interceptor catches `401`s, refreshes once (queueing any concurrent
requests behind that single refresh call), and retries. On refresh failure the store is
cleared and the user is routed back to `/login`.

## Folder structure

```
src/
├── app/              # App shell, router, providers
├── components/
│   ├── ui/           # Button, Input, Card, Modal, Badge, Spinner, TokenChip
│   ├── layout/       # Navbar, Footer, PageContainer
│   ├── common/       # EmptyState, ErrorState, InlineBanner
│   └── landing/      # Landing-page-only visuals
├── features/
│   ├── auth/         # api, store, hooks
│   ├── topics/       # api, hooks
│   ├── sessions/     # api, hooks
│   └── game/         # api, hooks (open/judge/adjust/scoreboard)
├── pages/            # One component per route
├── routes/           # ProtectedRoute / PublicOnlyRoute guards
├── lib/              # apiClient (axios + interceptors), errors (normalization), cn
├── types/            # API contract types
└── test/             # Vitest setup
```

## Running locally

```bash
npm install
cp .env.example .env      # adjust VITE_API_BASE_URL if needed
npm run dev
```

```bash
npm run build      # tsc -b && vite build
npm run lint        # oxlint
npm run test         # vitest run
npm run preview      # serve the production build locally
```

## Environment variables

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

No secrets belong in frontend env vars - this is the only one, and it's just a URL.

## SEO & production readiness

- Per-page `<title>`, meta description, canonical link, and Open Graph/Twitter cards
  via `react-helmet-async` (see `src/components/common/Seo.tsx`). `index.html` carries
  the same defaults as a fallback for pre-hydration crawlers.
- `public/robots.txt`, `public/sitemap.xml` (only the two genuinely public routes — `/`
  and `/login` — are listed; authenticated per-host routes are disallowed), and
  `public/llms.txt`.
- JSON-LD: `Organization` / `WebSite` / `SoftwareApplication` on the landing page,
  `BreadcrumbList` wherever `<Breadcrumbs>` is used.
- `public/og-image.png` (1200×630) generated from the app's own design tokens for social
  sharing previews.
- Breadcrumb navigation + internal links across every authenticated page
  (Dashboard → New game → Board → Results).
- `VITE_SITE_URL` controls the domain used to build canonical/OG URLs — set it once this
  app has a real production domain (defaults to a placeholder, `https://qahwa.app`).
- Production builds ship without source maps (`build.sourcemap: false`) and are split
  into per-route chunks plus vendor chunks (react/query/motion/forms) for caching.

## Assumptions & gaps flagged against the actual backend


I inspected `core.zip` before writing any frontend code. A few things are worth calling
out plainly rather than papering over:

1. **No registration endpoint.** `apps/accounts` defines `Host(AbstractUser)` but has no
   serializer, view, or URL for account creation - only `POST /token/` and
   `POST /token/refresh/` exist. So there's **no Register, Forgot Password, or Reset
   Password page** here; building one would mean faking an integration that doesn't
   exist. Host accounts presumably come from Django admin / `createsuperuser`.
2. **No CORS configuration in the backend settings I inspected** (`django-cors-headers`
   isn't in `INSTALLED_APPS`/`MIDDLEWARE`). As shipped, a browser running this app on
   `localhost:5173` will have its requests to `localhost:8000` blocked by CORS. I did not
   modify the backend per the brief - you'll need to add `django-cors-headers` (or an
   equivalent) and allow the frontend's origin before this app can actually talk to it.
3. **No "current user" / profile endpoint.** The username shown in the navbar is simply
   the value typed into the login form, not a value fetched from the API - there's
   nothing to fetch it from.
4. **Session detail comes from `/sessions/current/`.** There's no `GET /sessions/{id}/`,
   so the game board fetches players/topics from `current/` and treats a session whose
   id doesn't match the current one (or a `null` current session) as "not yours" and
   redirects to the dashboard.
5. **Topic pool size isn't validated client-side beyond "exactly 4."** The backend's own
   validation (e.g. rejecting an under-stocked topic) surfaces through the shared error
   banner rather than being duplicated in the frontend.
