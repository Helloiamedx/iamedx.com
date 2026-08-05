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

Place files under `public/`:

- Fonts: `public/fonts/SF-Pro-Display-{Light,Regular,Medium,Bold,Heavy,Black}.woff2`
- Logos: `public/brand/iamedxlogo-black.svg`, `iamedxlogo-white.svg`
- Favicon: `public/brand/favicon.svg`

Source URLs (vendor into repo; do not hotlink long-term):

- https://iamedx.com/fonts/SF-Pro-Display-*.woff2
- https://iamedx.com/brand/iamedxlogo-black.svg
- https://iamedx.com/brand/iamedxlogo-white.svg
- https://iamedx.com/brand/favicon.svg

## Content editing

- **Services / prices:** edit `content/services.ts`
- **Projects:** edit `content/projects.ts`, add images under `public/projects/`
- **Insights:** add `content/insights/your-slug.mdx` with `title`, `date`, `excerpt`, and `tags` frontmatter  
  Tags must match the Insights menu (e.g. `Manufacturing Processes`, `China Manufacturing`). Example:

```mdx
---
title: Notes from a first production run
date: 2025-11-12
excerpt: What usually breaks between sample and mass production.
tags:
  - Manufacturing Processes
  - Quality Control
---
```


## Deploy (Vercel)

1. Push this repo to GitHub
2. Import the project in Vercel
3. Attach `iamedx.com` + `www`
4. Point DNS at Vercel
5. Keep `hello@iamedx.com` on your existing mail provider
