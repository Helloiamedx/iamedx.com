# Backup — nav CTA before frost ink unify

Saved before trying to match Contact pill label color to primary nav ink when frost is under the bar.

## Restore

```bash
cp components/backup/nav-cta-frost-before-unify/Header.tsx components/Header.tsx
# Re-paste globals.header-cta.css into app/globals.css (.site-header-cta … through pills media queries)
```

## What this version looks like

- Ghost (no frost): difference blend, white contact labels
- Pills (frost / mega open / scrolled): brand fills (WhatsApp / WeChat / Email blue), **white** label text
- Primary nav on frost: **#1d1d1f** black links
