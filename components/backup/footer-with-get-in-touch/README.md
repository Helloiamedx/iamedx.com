# Footer with Get in touch (mid column form)

Snapshot before considering removal of the footer contact form
(header already has WhatsApp / WeChat / Email).

Restore Get in touch mid column:
1. `cp components/backup/footer-with-get-in-touch/Footer.tsx components/Footer.tsx`
2. `cp components/backup/footer-with-get-in-touch/FooterContactForm.tsx components/FooterContactForm.tsx`
3. Revert footer grid CSS in `app/globals.css` to the 3-col `tl tm tr` layout from git history if needed.

Current live footer is 2-col: media | links (form removed).
