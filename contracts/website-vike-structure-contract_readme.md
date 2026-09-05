# Spinalith Public Site — Vike Structure Contract

## 2AM VERSION

Build the real page in `src/pages`.

Give that page a public URL by creating a thin Vike wrapper in:

```text
pages/<route>/+Page.tsx
```

The shared public-site shell lives in:

```text
pages/+Layout.tsx
```

Vike owns routing and prerendering for `spinalith-site`.

The public site does **not** use React Router.

Use standard anchors for public-site navigation:

```tsx
<a href={COMMON_LINKS.site.features}>Features</a>
```

Keep route destinations centralized in `COMMON_LINKS`.

---

# Purpose

This contract documents the structural rules for the Spinalith public website after migrating from a client-rendered React Router SPA to Vike-based filesystem routing and static prerendering.

The goal is to make the architecture obvious enough that the project can be opened months later and immediately understood.

This document is specifically for:

```text
spinalith-site
```

It does **not** define routing conventions for the authenticated Spinalith application.

The authenticated application may continue using React Router.

---

# Core Architecture

The public site is intentionally split into two layers:

```text
Vike routing shell
        +
existing React page implementation
```

The Vike layer answers:

```text
What URL exists?
Which React page should render there?
Which shared layout wraps it?
Should it be prerendered?
```

The `src` layer answers:

```text
What does the page actually contain?
Which sections render?
Which reusable components are used?
How is the site styled?
```

This keeps Vike-specific routing code thin while preserving the page/component structure already used throughout the project.

---

# Primary Directory Structure

The expected high-level project structure is:

```text
spinalith-site/
│
├── contracts/
│   └── _readme.md
│
├── pages/
│   ├── +config.ts
│   ├── +Layout.tsx
│   │
│   ├── index/
│   │   └── +Page.tsx
│   │
│   ├── features/
│   │   └── +Page.tsx
│   │
│   ├── pricing/
│   │   └── +Page.tsx
│   │
│   ├── about/
│   │   └── +Page.tsx
│   │
│   ├── contact/
│   │   └── +Page.tsx
│   │
│   ├── privacy/
│   │   └── +Page.tsx
│   │
│   └── terms/
│       └── +Page.tsx
│
├── src/
│   ├── pages/
│   ├── components/
│   ├── layouts/
│   ├── styles/
│   └── routes/
│       └── CommonLinks.ts
│
├── public/
├── package.json
├── package-lock.json
└── vite.config.ts
```

---

# What Goes Where

## `src/pages/`

This is where the actual React page implementations live.

Examples:

```text
src/pages/HomePage.tsx
src/pages/FeaturesPage.tsx
src/pages/PricingPage.tsx
src/pages/AboutPage.tsx
src/pages/ContactPage.tsx
src/pages/PrivacyPage.tsx
src/pages/TermsPage.tsx
```

These files are the real page compositions.

They may:

- import page sections
- compose reusable components
- import page-specific styles
- control the visual structure of the page
- contain page-specific React behavior

They should remain framework-light where practical.

### Example

```tsx
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomeProblemSection } from "@/components/home/HomeProblemSection";

export function HomePage() {
  return (
    <>
      <HomeHeroSection />
      <HomeProblemSection />
    </>
  );
}
```

---

## Root `pages/`

The root `pages/` folder is the Vike routing shell.

It is **not** where the full page implementations should normally be built.

Its job is to expose the real React pages to Vike.

Example:

```text
pages/features/+Page.tsx
```

```tsx
import { FeaturesPage } from "../../src/pages/FeaturesPage";

export default FeaturesPage;
```

That file means:

```text
URL: /features
Render: src/pages/FeaturesPage.tsx
```

The wrapper should stay intentionally thin.

---

# Route Mapping

The Vike filesystem controls public URLs.

Examples:

```text
pages/index/+Page.tsx
```

maps to:

```text
/
```

```text
pages/features/+Page.tsx
```

maps to:

```text
/features
```

```text
pages/pricing/+Page.tsx
```

maps to:

```text
/pricing
```

```text
pages/about/+Page.tsx
```

maps to:

```text
/about
```

---

# Shared Vike Layout

The primary public-site layout lives at:

```text
pages/+Layout.tsx
```

This replaces the old React Router layout shell.

Its job is to wrap all child pages with shared site chrome such as:

- `SiteHeader`
- main content wrapper
- `SiteFooter`
- global styles

Conceptually:

```tsx
export default function Layout({ children }) {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main className="site-main">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
```

The important difference from the previous React Router implementation is:

```tsx
{children}
```

instead of:

```tsx
<Outlet />
```

---

# Multiple Layouts

Vike supports nested layouts.

If the site later needs a different structure for educational content, a nested layout may be introduced.

Example:

```text
pages/
│
├── +Layout.tsx
│
└── learn/
    ├── +Layout.tsx
    ├── plotting-basics/
    │   └── +Page.tsx
    └── character-arcs/
        └── +Page.tsx
```

A reusable layout implementation may still live under:

```text
src/layouts/
```

and be imported by a Vike `+Layout.tsx` file if that keeps the codebase cleaner.

---

# Vike Configuration

The root Vike configuration lives at:

```text
pages/+config.ts
```

Its purpose is to configure Vike behavior for the route tree.

The current public-site strategy is:

```text
React
+
Vike
+
static prerendering
```

The site should remain fully prerenderable unless there is a deliberate architectural reason to change that later.

---

# Navigation Contract

## Public Site

The public website does not use React Router.

Use standard anchor navigation:

```tsx
<a href={COMMON_LINKS.site.features}>
  Features
</a>
```

For active-route state, use Vike page context rather than React Router hooks.

Example concept:

```tsx
const pageContext = usePageContext();

const isActive =
  pageContext.urlPathname === COMMON_LINKS.site.features;
```

Do **not** use React Router primitives inside the public Vike site unless React Router is intentionally reintroduced for a documented reason.

---

# `COMMON_LINKS` Contract

Canonical site and app destinations should remain centralized in:

```text
src/routes/CommonLinks.ts
```

Use those values instead of scattering literal route strings throughout components.

Example:

```tsx
<a href={COMMON_LINKS.site.pricing}>
  Pricing
</a>
```

This separation remains useful even though the public site and authenticated app use different routing technologies.

The destination stays centralized.

Only the rendering syntax differs.

---

# Public Site vs Authenticated App

These are intentionally different projects with different routing needs.

## `spinalith-site`

Uses:

```text
Vike
filesystem routing
static prerendering
standard anchors
```

## `spinalith-ui`

May continue using:

```text
React Router
client-side application routing
<Link />
<NavLink />
```

Do not copy navigation implementation blindly between the two repositories.

Always confirm which project is being edited.

---

# New Public Page Workflow

When adding a new custom public page:

1. Build the actual page in `src/pages/NewPage.tsx`.
2. Add reusable UI under `src/components/`.
3. Create `pages/new-route/+Page.tsx`.
4. Point the wrapper at `src/pages/NewPage.tsx`.
5. Add the canonical route to `COMMON_LINKS` when needed.
6. Run `npm run dev` and test the page.
7. Run `npm run build` and confirm the route prerenders.

Example wrapper:

```tsx
import { NewPage } from "../../src/pages/NewPage";

export default NewPage;
```

---

# Learn / Content Architecture

The future Learn section is expected to contain:

- evergreen articles
- tutorials
- educational content
- SEO pages
- video companion pages
- long-tail search content
- blog-style content

Do **not** create hundreds of manually maintained React page implementations for this content.

The intended scalable architecture is:

```text
one shared Learn route/template
        +
many content records/files
        =
many prerendered public pages
```

Conceptually:

```text
/learn/story-structure
/learn/how-to-outline-a-novel
/learn/character-arcs
/learn/save-the-cat-beats
```

may all be rendered by one dynamic Vike page template.

The content itself should live separately from presentation.

Potential future content sources include Markdown, MDX, JSON, TypeScript content records, Supabase, or a custom internal CMS.

---

# Future CMS / Admin Publishing

A future Spinalith content admin tool may provide a WordPress-like workflow.

Possible fields include title, slug, excerpt, body, SEO title, meta description, featured image, YouTube URL, category, tags, publish status, publish date, author, and related content.

The desired publishing flow is:

```text
create/edit content
        ↓
publish
        ↓
content source updates
        ↓
Git/deployment pipeline runs
        ↓
Vike prerenders public HTML
        ↓
new page becomes available
```

---

# Build Contract

Development:

```powershell
npm run dev
```

Production build:

```powershell
npm run build
```

The production script should use:

```text
vike build
```

not:

```text
vite build
```

Vike should prerender every intended static public route.

Current build output is generated under:

```text
dist/client
```

and includes real HTML documents.

---

# Deployment Contract

The public site should remain host-agnostic.

The architecture should not depend on Vercel-specific runtime features unless there is a documented need.

Current deployment model:

```text
GitHub repository
        ↓
hosting provider pulls commit
        ↓
npm install
        ↓
npm run build
        ↓
Vike prerenders static files
        ↓
dist/client is deployed
```

Changing hosts should primarily be a deployment/configuration change, not a site rewrite.

---

# Responsive Behavior

Vike prerendering does not change normal CSS responsiveness.

Continue using CSS media queries, Tailwind responsive classes, flexible layout rules, responsive grids, and responsive typography.

Avoid relying on direct browser APIs during prerender unless guarded.

Examples requiring care:

```ts
window
document
localStorage
sessionStorage
navigator
```

---

# Retired Architecture

After the Vike migration was validated, the previous React Router SPA shell became obsolete.

The retired structure included:

```text
src/main.tsx
src/App.tsx
src/routes/PublicRouter.tsx
src/layouts/MarketingLayout.tsx
index.html
```

The following dependencies were also removed once no longer needed:

```text
react-router-dom
vite-plugin-vercel
```

Do not recreate these files or dependencies unless there is a deliberate architectural reason and this contract is updated accordingly.

---

# Why the Old Files Were Retired

The previous flow was approximately:

```text
index.html
    ↓
src/main.tsx
    ↓
src/App.tsx
    ↓
PublicRouter.tsx
    ↓
MarketingLayout.tsx
    ↓
page
```

The new flow is approximately:

```text
Vike
    ↓
pages/<route>/+Page.tsx
    ↓
src/pages/<Page>.tsx
    ↓
pages/+Layout.tsx
    ↓
prerendered HTML
```

Vike now owns route discovery, page entry, shared route layouts, prerendering, and HTML generation.

---

# Do Not Do

- Do not build full page implementations directly inside `pages/<route>/+Page.tsx` unless there is a documented reason.
- Do not reintroduce React Router into `spinalith-site` casually.
- Do not scatter public route strings throughout components when `COMMON_LINKS` should own them.
- Do not assume the authenticated app and public site use the same navigation syntax.
- Do not use browser-only APIs during prerender without guarding them.
- Do not add Vercel-specific server/runtime architecture merely because the site is currently hosted on Vercel.
- Do not delete or reorganize Vike structural files without understanding how filesystem routing will change.

---

# Recommended Mental Model

When working on the public website, think of the codebase this way:

```text
src/
=
the actual website

pages/
=
the Vike routing shell around the website
```

Or even more simply:

```text
src/pages
=
what the page is

pages
=
where the page lives on the web
```

That distinction should remain stable as the site grows.

---

# Current Architectural Goal

The public Spinalith site should remain:

- easy to understand
- easy to extend
- statically prerendered
- SEO-friendly
- AI-crawler-friendly
- host-agnostic
- component-based
- compatible with future long-tail content growth
- compatible with a future CMS/admin publishing workflow
- separate from the routing architecture of the authenticated application

When making structural changes, preserve those goals unless there is a clear reason not to.
