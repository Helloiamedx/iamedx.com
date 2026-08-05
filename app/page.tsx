import Image from "next/image";
import Link from "next/link";
import { HeroActions } from "@/components/HeroActions";
import { HeroHeadline } from "@/components/HeroHeadline";
import { getFeaturedProjects } from "@/content/projects";
import { getAllInsights } from "@/lib/insights";

export default function HomePage() {
  const featured = getFeaturedProjects(3);
  const insights = getAllInsights().slice(0, 2);

  return (
    <main>
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <video
            className="hero__video"
            src="https://assets.iamedx.com/videos/large.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
        <div className="hero__content">
          <h1 className="hero__title">
            <HeroHeadline />
          </h1>
          <HeroActions />
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <h2>Selected projects</h2>
          <Link href="/projects">All projects</Link>
        </div>
        <ul className="project-grid">
          {featured.map((project) => (
            <li key={project.slug}>
              <Link href={`/projects/${project.slug}`} className="project-card">
                <div className="project-card__media">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    width={800}
                    height={600}
                  />
                </div>
                <div className="project-card__meta">
                  <h3>{project.title}</h3>
                  <p>{project.materials.join(" · ")}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section__header">
          <h2>Insights</h2>
          <Link href="/insights">All insights</Link>
        </div>
        <ul className="insight-list">
          {insights.map((insight) => (
            <li key={insight.slug}>
              <Link href={`/insights/${insight.slug}`}>
                <h3>{insight.title}</h3>
                <p>{insight.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
