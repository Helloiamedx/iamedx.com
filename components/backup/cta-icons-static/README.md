# CTA icons — static baseline (pre-motion)

Snapshot before icon↔label hover interaction was added (2026-08-06).

Restore if you prefer no motion:
1. `cp components/backup/cta-icons-static/ContactChannelIcons.tsx components/ContactChannelIcons.tsx`
2. In Header / MobileBubbleNav, unwrap labels — replace
   `<span className="nav-contact__label">{…}</span>` with plain `{…}` text
3. In `app/globals.css`, remove the hover / active / reduced-motion blocks under
   `.nav-contact--with-icon` / `.nav-contact__label` / mobile CTA hover rules,
   and restore the simpler icon rules from `nav-contact-icon.css.snippet`
