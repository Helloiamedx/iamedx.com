# Projects hero roll backup

Floating cover collage used on `/projects` before the Further-style index redesign.

Restore:

```bash
cp backups/ProjectsHeroRoll.tsx components/ProjectsHeroRoll.tsx
cp backups/ProjectsHeroRoll.css components/ProjectsHeroRoll.css
```

Then wire `<ProjectsHeroRoll />` back into `app/projects/page.tsx` if needed.

Data source (unchanged): `projectsHeroRoll` / `projectsHeroLines` in `content/projects.ts`.
