# Backup — header before cargo-style desktop redesign

Frozen immediately before the always-on frost / grain bar, centered nav (Contact instead of Pricing), square mega placeholders, and **Work with me** CTA.

Live sources stay in `components/` and `content/`. This folder is restore-only.

## Contents

| Path | Role |
|------|------|
| `Header.tsx` | Desktop chrome + WhatsApp / WeChat / Email raft + scroll tuck |
| `MobileBubbleNav.tsx` | Mobile menu (includes Pricing in the list at backup time) |
| `nav.ts` | `primaryNav` / `mobileNavLinks` with Pricing |
| `globals.header-nav.css` | Slices from `app/globals.css`: `.site-header`, `.site-header-cta`, `.site-nav`, `.mega-panel`, `.nav-scrim` |

## Restore

From repo root:

```bash
B=components/backup/header-pre-cargo-redesign
cp "$B"/Header.tsx components/Header.tsx
cp "$B"/MobileBubbleNav.tsx components/MobileBubbleNav.tsx
cp "$B"/nav.ts content/nav.ts
```

Then re-merge `globals.header-nav.css` into `app/globals.css` (replace the live `.site-header` / CTA raft / nav / mega / logo / desktop chrome blocks). Do not paste blindly over unrelated page CSS.

`/pricing` and footer Pricing were never removed as part of this redesign step.
