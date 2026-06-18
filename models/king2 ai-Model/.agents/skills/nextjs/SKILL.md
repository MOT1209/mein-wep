---
name: nextjs
description: Next.js App Router expert guidance. Use when building, debugging, or architecting Next.js applications — routing, Server Components, Server Actions, Cache Components, layouts, middleware/proxy, data fetching, rendering strategies, and deployment on Vercel.
metadata:
  priority: 5
  docs:
    - "https://nextjs.org/docs"
    - "https://nextjs.org/docs/app"
  sitemap: "https://nextjs.org/sitemap.xml"
  pathPatterns:
    - 'next.config.*'
    - 'next-env.d.ts'
    - 'app/**'
    - 'pages/**'
    - 'src/app/**'
    - 'src/pages/**'
    - 'tailwind.config.*'
    - 'postcss.config.*'
    - 'tsconfig.json'
    - 'tsconfig.*.json'
    - 'apps/*/app/**'
    - 'apps/*/pages/**'
    - 'apps/*/src/app/**'
    - 'apps/*/src/pages/**'
    - 'apps/*/next.config.*'
  bashPatterns:
    - '\bnext\s+(dev|build|start|lint)\b'
    - '\bnext\s+experimental-analyze\b'
    - '\bnpx\s+create-next-app\b'
    - '\bbunx\s+create-next-app\b'
    - '\bnpm\s+run\s+(dev|build|start)\b'
    - '\bpnpm\s+(dev|build)\b'
    - '\bbun\s+run\s+(dev|build)\b'
  promptSignals:
    phrases:
      - "next.js"
      - "nextjs"
      - "app router"
      - "server component"
      - "server action"
    allOf:
      - [middleware, next]
      - [layout, route]
    anyOf:
      - "pages router"
      - "getserversideprops"
      - "use server"
    noneOf: []
    minScore: 6
validate:
  -
    pattern: export.*getServerSideProps
    message: 'getServerSideProps is removed in App Router — use server components or route handlers'
    severity: error
    upgradeToSkill: nextjs
    upgradeWhy: 'Guides migration from Pages Router getServerSideProps to App Router server components with async data fetching.'
  -
    pattern: getServerSideProps
    message: 'getServerSideProps is a Pages Router pattern — migrate to App Router server components'
    severity: warn
  -
    pattern: export.*getStaticProps
    message: 'getStaticProps is removed in App Router — use generateStaticParams + server components instead'
    severity: error
    upgradeToSkill: nextjs
    upgradeWhy: 'Guides migration from Pages Router getStaticProps to App Router generateStaticParams with server components.'
  -
    pattern: getStaticProps
    message: 'getStaticProps is a Pages Router pattern — migrate to App Router generateStaticParams + server components'
    severity: warn
  -
    pattern: from\s+['"]next\/router['"]
    message: 'next/router is Pages Router only — use next/navigation for App Router'
    severity: error
    upgradeToSkill: nextjs
    upgradeWhy: 'Guides migration from next/router to next/navigation with useRouter, usePathname, useSearchParams hooks.'
  -
    pattern: (useState|useEffect)
    message: 'React hooks require "use client" directive — add it at the top of client components'
    severity: warn
    skipIfFileContains: "^[\"']use client[\"']"
  -
    pattern: from\s+['"]next\/head['"]
    message: 'next/head is Pages Router — use export const metadata or generateMetadata() in App Router. Run Skill(nextjs) for metadata API guidance.'
    severity: error
    upgradeToSkill: nextjs
    upgradeWhy: 'Guides migration from next/head to the App Router metadata API (export const metadata / generateMetadata()).'
    skipIfFileContains: export\s+(const\s+)?metadata|generateMetadata
  -
    pattern: export\s+(default\s+)?function\s+middleware
    message: 'middleware() is renamed to proxy() in Next.js 16 — rename the function and the file to proxy.ts. Run Skill(routing-middleware) for proxy.ts migration guidance.'
    severity: recommended
    upgradeToSkill: routing-middleware
    upgradeWhy: 'Guides migration from middleware.ts to proxy.ts with correct file placement, runtime config, and request interception patterns.'
  -
    pattern: revalidateTag\(\s*['\"][^'\"]+['\"]\s*\)
    message: 'Single-arg revalidateTag(tag) is deprecated in Next.js 16 — pass a cacheLife profile: revalidateTag(tag, "max")'
    severity: recommended
    upgradeToSkill: nextjs
    upgradeWhy: 'Guides migration from single-arg revalidateTag to the Next.js 16 two-arg API with cacheLife profiles.'
  -
    pattern: useRef\(\s*\)
    message: 'useRef() requires an initial value in React 19 — use useRef(null) or useRef(0)'
    severity: error
  -
    pattern: next\s+export
    message: 'next export was removed — use output: "export" in next.config.js for static export'
    severity: error
    upgradeToSkill: nextjs
    upgradeWhy: 'Guides migration from next export CLI command to output: "export" in next.config for static site generation.'
  -
    pattern: (?<!await )\bcookies\(\s*\)
    message: 'cookies() is async in Next.js 16 — add await: const cookieStore = await cookies()'
    severity: error
    skipIfFileContains: "^[\"']use client[\"']"
  -
    pattern: (?<!await )\bheaders\(\s*\)
    message: 'headers() is async in Next.js 16 — add await: const headersList = await headers()'
    severity: error
    skipIfFileContains: "^[\"']use client[\"']"
  -
    pattern: from\s+['"](lru-cache|node-cache|memory-cache)['"]|new\s+(LRUCache|NodeCache)\(
    message: 'In-process cache detected. Serverless deployments lose process memory between invocations.'
    severity: recommended
    upgradeToSkill: runtime-cache
    upgradeWhy: 'Replace process-memory caches with Vercel Runtime Cache for shared, region-aware caching.'
  -
    pattern: from\s+['"](express|fastify|koa|hapi)['"]|require\s*\(\s*['"](express|fastify|koa|hapi)['"]
    message: 'Express/Fastify/Koa/Hapi server framework detected in a Next.js project. Use Next.js route handlers or proxy.ts for request handling instead.'
    severity: recommended
    upgradeToSkill: routing-middleware
    upgradeWhy: 'Replace custom server frameworks with Next.js proxy.ts for request interception and route handlers for API endpoints.'
    skipIfFileContains: 'proxy\.ts|from\s+['"](next/server)['"]|@vercel/functions'
  -
    pattern: 'fonts\.googleapis\.com|from\s+['"](fontsource|@fontsource)['"]|<link[^>]*fonts\.googleapis'
    message: 'External font loader detected. Use next/font for zero-CLS, self-hosted font loading with automatic optimization.'
    severity: recommended
    upgradeToSkill: nextjs
    upgradeWhy: 'Guides migration from external font loaders to next/font with Geist Sans/Mono for zero-CLS font optimization.'
    skipIfFileContains: 'next/font'
---

# Next.js Best Practices

Apply these rules when writing or reviewing Next.js code.

## RSC Boundaries

Detect invalid React Server Component patterns.

- Async client component detection (invalid)
- Non-serializable props detection
- Server Action exceptions

## Async Patterns

Next.js 15+ async API changes.

- Async `params` and `searchParams`
- Async `cookies()` and `headers()`

## Runtime Selection

- Default to Node.js runtime
- When Edge runtime is appropriate

## Directives

- `'use client'`, `'use server'` (React)
- `'use cache'` (Next.js)

## Error Handling

- `error.tsx`, `global-error.tsx`, `not-found.tsx`
- `redirect`, `permanentRedirect`, `notFound`
- `forbidden`, `unauthorized` (auth errors)

## Data Patterns

- Server Components vs Server Actions vs Route Handlers
- Avoiding data waterfalls (`Promise.all`, Suspense, preload)
- Client component data fetching

## Route Handlers

- `route.ts` basics
- GET handler conflicts with `page.tsx`
- Environment behavior (no React DOM)
- When to use vs Server Actions

## Metadata & OG Images

- Static and dynamic metadata
- `generateMetadata` function
- OG image generation with `next/og`
- File-based metadata conventions

## Image Optimization

- Always use `next/image` over `<img>`
- Remote images configuration
- Responsive `sizes` attribute
- Blur placeholders
- Priority loading for LCP

## Font Optimization

- `next/font` setup
- Google Fonts, local fonts
- Tailwind CSS integration
- Preloading subsets

## Bundling

- Server-incompatible packages
- CSS imports (not link tags)
- Polyfills (already included)
- ESM/CommonJS issues
- Bundle analysis

## Scripts

- `next/script` vs native script tags
- Inline scripts need `id`
- Loading strategies

## Hydration Errors

- Common causes (browser APIs, dates, invalid HTML)
- Debugging with error overlay
- Fixes for each cause

## Suspense Boundaries

- CSR bailout with `useSearchParams` and `usePathname`
- Which hooks require Suspense boundaries

## Self-Hosting

- `output: 'standalone'` for Docker
- Cache handlers for multi-instance ISR
- What works vs needs extra setup
