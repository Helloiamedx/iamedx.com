import {
  getInvolvementLabel,
  type Project,
} from "@/content/projects";

type ProjectCaseHeroProps = {
  project: Project;
};

/** Demo reel until each case has its own Vimeo */
const DEFAULT_VIMEO = {
  id: "1172594711",
  hash: "3452b6dd22",
} as const;

function vimeoBackgroundSrc(id: string, hash?: string) {
  const params = new URLSearchParams({
    background: "1",
    autoplay: "1",
    loop: "1",
    muted: "1",
    autopause: "0",
    title: "0",
    byline: "0",
    portrait: "0",
  });
  if (hash) params.set("h", hash);
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}

/**
 * Case detail first screen: full-viewport Vimeo under clear nav,
 * meta inset at the bottom with difference invert (same language as hero roll).
 */
export function ProjectCaseHero({ project }: ProjectCaseHeroProps) {
  const tagline = project.tagline ?? project.summary;
  const categories = getInvolvementLabel(project.involvement);
  const vimeoId = project.heroVimeoId ?? DEFAULT_VIMEO.id;
  const vimeoHash = project.heroVimeoHash ?? DEFAULT_VIMEO.hash;
  const embedSrc = vimeoBackgroundSrc(vimeoId, vimeoHash);

  return (
    <section className="project-case-hero" aria-label={project.title}>
      <div className="project-case-hero__media" aria-hidden="true">
        <iframe
          className="project-case-hero__video"
          src={embedSrc}
          title=""
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className="project-case-hero__meta">
        <h1 className="project-case-hero__title">{project.title}</h1>
        <p className="project-case-hero__tagline">{tagline}</p>
        <p className="project-case-hero__categories">{categories}</p>
      </div>
    </section>
  );
}
