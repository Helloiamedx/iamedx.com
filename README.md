# iamedx.com

Personal site for **iamedx** — product manufacturing partner (Projects, Services, About, Insights, Contact).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Deploy target: Vercel + domain `iamedx.com`
- Contact: `hello@iamedx.com`

## Scripts

```bash
npm install
npm run dev
npm run build
```

## File outline

```
app/
  layout.tsx                 # Header, Footer, metadata, favicon
  page.tsx                   # Home
  globals.css                # SF Pro + design tokens
  sitemap.ts / robots.ts
  projects/page.tsx          # Cover + material filters + grid
  projects/[slug]/page.tsx
  services/page.tsx          # How I work + service picker
  about/page.tsx
  insights/page.tsx
  insights/[slug]/page.tsx
  contact/page.tsx
components/
  Header.tsx / Footer.tsx
  ProjectFilter.tsx / ProjectGrid.tsx
  ServicePicker.tsx
  ContactForm.tsx
content/
  services.ts                # Modular service chain + prices
  projects.ts                # Projects + material categories
  insights/*.mdx             # Insight posts
lib/
  insights.ts                # Read MDX frontmatter from disk
public/
  fonts/                     # SF-Pro-Display-*.woff2
  brand/                     # logos + favicon.svg
  projects/                  # Product images / placeholders
```

## Brand assets

Static media is served from Cloudflare R2 via `https://assets.iamedx.com`.
In code, use `asset("/path")` from [`lib/assets.ts`](lib/assets.ts).

Examples:

- `https://assets.iamedx.com/fonts/SF-Pro-Display-*.woff2`
- `https://assets.iamedx.com/brand/iamedxlogo-black.svg`
- `https://assets.iamedx.com/brand/iamedxlogo-white.svg`
- `https://assets.iamedx.com/brand/favicon.svg`
- `https://assets.iamedx.com/videos/large.mp4`
- `https://assets.iamedx.com/projects/...`

Upload new files to the R2 bucket that backs `assets.iamedx.com` (same path layout).

## Content editing

- **Services / prices:** edit `content/services.ts`
- **Projects:** edit `content/projects.ts`, upload images to R2 under `projects/`
- **Insights:** add `content/insights/your-slug.mdx` with `title`, `date`, `excerpt`, and `tags` frontmatter  
  Tags must match the Insights menu (e.g. `Manufacturing`, `Quality Control`). Example:

```mdx
---
title: Notes from a first production run
date: 2025-11-12
excerpt: What usually breaks between sample and mass production.
tags:
  - Manufacturing
  - Quality Control
---
```


## Deploy (Vercel)

1. Push this repo to GitHub
2. Import the project in Vercel
3. Attach `iamedx.com` + `www`
4. Point DNS at Vercel
5. Keep `hello@iamedx.com` on your existing mail provider
