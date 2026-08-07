# Header + footer stable snapshot

Frozen before homepage content work (2026-08-07).

Includes desktop mega nav, mobile bubble/curtain menu, footer knockout
(HELLOIAMEDX + video + LightRays), assist CTAs, and related CSS / nav copy.

## Contents

| Path | Role |
|------|------|
| `Header.tsx` | Desktop + mobile chrome |
| `MobileBubbleNav.tsx` | Mobile menu panel |
| `Footer.tsx` | Footer shell / assist / nav / bottom bar |
| `FooterWordmark.tsx` | Black plate + rays cutout |
| `FooterVideoMarquee.tsx` | Letter-box video underlay |
| `ContactChannelIcons.tsx` | WhatsApp / WeChat / Email icons |
| `LightRays.*` | Footer beams |
| `VariableProximity.*` | Footer lead hover type |
| `SmoothScroll.tsx` | Lenis (wheel only; touch native) |
| `ClickSpark.tsx` / `GlareHover.*` | CTA chrome used by header/footer |
| `content/nav.ts` | Nav + footer copy / columns / video src |
| `css/` | Slices from `app/globals.css` |
| `rules/footer-nav-2x2.mdc` | 4→2×2 footer nav rule |
| `brand/HELLOIAMEDX.svg` | Wordmark source |
| `fonts/Manuka-Black.otf` | Local Manuka fallback |

## Restore (components)

From repo root:

```bash
B=components/backup/header-footer-stable
cp "$B"/Header.tsx components/
cp "$B"/MobileBubbleNav.tsx components/
cp "$B"/Footer.tsx components/
cp "$B"/FooterWordmark.tsx components/
cp "$B"/FooterVideoMarquee.tsx components/
cp "$B"/ContactChannelIcons.tsx components/
cp "$B"/LightRays.tsx "$B"/LightRays.css components/
cp "$B"/VariableProximity.tsx "$B"/VariableProximity.css components/
cp "$B"/SmoothScroll.tsx components/
cp "$B"/ClickSpark.tsx components/
cp "$B"/GlareHover.tsx "$B"/GlareHover.css components/
cp "$B"/content/nav.ts content/nav.ts
cp "$B"/rules/footer-nav-2x2.mdc .cursor/rules/
```

Then re-merge CSS from `css/` into `app/globals.css` (footer block, header-bar,
header-nav, Manuka `@font-face`, shell / `--header-bar-h` as needed), and
restore brand/font files under `public/` if missing.

Do **not** treat this folder as live code — live sources stay in `components/`.
