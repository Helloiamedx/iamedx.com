import type { Metadata } from "next";
import Image from "next/image";
import { AboutExperienceList } from "@/components/AboutExperienceList";
import { AboutExpertise } from "@/components/AboutExpertise";
import { AboutPageHero } from "@/components/AboutPageHero";
import { asset } from "@/lib/assets";

export const metadata: Metadata = {
  title: "About",
  description:
    "Edward Xu — product manufacturing partner across sourcing, development, production, packaging, and delivery in China.",
};

const profileImage = asset(
  `/images/about/${encodeURIComponent("My Profile.jpg")}`,
);

const aboutLede =
  "“Loyalty to my clients, protecting their interests, and helping them build highly tailored supply chains in China define how I approach every project.”";


const workTools = [
  "Notion",
  "Smartsheet",
  "Keynote",
  "Slack",
  "Google Sheets",
  "Microsoft Office",
  "Adobe Illustrator",
  "Adobe Photoshop",
  "Fusion 360",
  "Autodesk CAD",
];

const testimonials = [
  {
    quote:
      "Edward treated our product like it was his own. He caught issues before they became expensive, kept every factory aligned, and never left us guessing about timeline or quality.",
    name: "Charlotte Tem",
    company: "Best Link (USA) Corp. Ltd.",
    role: "CEO",
    photo: asset(
      `/images/about/${encodeURIComponent("Charlotte Tem.avif")}`,
    ),
  },
  {
    quote:
      "Edward built the process, negotiated hard for our interests, and delivered samples that matched what we signed off. His ability to organize the process and communicate clearly significantly reduced unnecessary back-and-forth and improved the overall efficiency of the project.",
    name: "Angela McReynolds",
    company: "DPI Merchandising Inc.",
    role: "President",
    photo: asset(
      `/images/about/${encodeURIComponent("Angela McReynolds.jpeg")}`,
    ),
  },
  {
    quote:
      "Working with Edward made the entire process much smoother. He always had a clear plan for the next steps and made sure I understood what needed to be done and what the final goal should look like.",
    name: "Eric Winn",
    company: "KindLucky Hong Kong International Limited",
    role: "Procurement Manager",
    photo: asset(`/images/about/${encodeURIComponent("Eric Winn.avif")}`),
  },
];

type AchievementStat = {
  label: string;
  value: string;
  unit: string;
  note: string;
  /** Top-row key metrics — half width each in the unified table */
  featured?: boolean;
};

/** Unified table: two featured (top), then six in 2×3 */
const achievementStats: AchievementStat[] = [
  {
    label: "Total Projects Handled",
    value: "35",
    unit: "+",
    note: "Represents the cumulative number of projects I have managed across different product categories throughout my career.",
    featured: true,
  },
  {
    label: "Factories Worked With",
    value: "50",
    unit: "+",
    note: "Total number of factories I have collaborated with across multiple regions and product types.",
    featured: true,
  },
  {
    label: "Largest Project Scale",
    value: "16M",
    unit: "units",
    note: "Refers to the largest-scale project I have been involved in, contributing to its execution from development to shipment.",
  },
  {
    label: "Container Shipments",
    value: "75",
    unit: "+",
    note: "This figure reflects the cumulative number of containers handled across all projects throughout my career.",
  },
  {
    label: "On-site Execution",
    value: "200",
    unit: "+",
    note: "Indicates the number of times I was deployed on-site to supervise production, verify processes, and resolve critical issues directly.",
  },
  {
    label: "Product Pass Rate",
    value: "100",
    unit: "%",
    note: "Based on final inspections under AQL standards, reflecting overall product quality and consistency across shipments.",
  },
  {
    label: "On-time Delivery Rate",
    value: "90",
    unit: "%",
    note: "Measures the percentage of projects delivered on schedule, including cases requiring schedule recovery and shipment adjustments.",
  },
  {
    label: "Engineering Attended",
    value: "70",
    unit: "+",
    note: "Includes production meetings, engineering problem-solving discussions, and on-site coordination sessions throughout project execution.",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <AboutPageHero />

      <div className="about-content-sheet">
        {/* About */}
        <section
          id="about"
          className="about-boua__about about-boua__container"
          aria-labelledby="about-about-heading"
        >
          <div className="about-boua__about-grid">
            <div className="about-boua__rail about-boua__rail--lede">
              <h2
                id="about-about-heading"
                className="about-boua__label about-boua__sticky"
              >
                About
              </h2>
            </div>
            <div>
              <div className="about-boua__intro">
                <div className="about-boua__portrait">
                  <Image
                    src={profileImage}
                    alt="Edward Xu"
                    fill
                    sizes="(max-width: 800px) 26vw, 18rem"
                    priority
                    className="about-boua__portrait-img"
                  />
                </div>
                <div className="about-boua__intro-copy">
                  <p className="about-boua__lede">{aboutLede}</p>
                  <p className="about-boua__body">
                    My clients focus on building their brands and connecting with
                    their customers, while I provide the product development,
                    manufacturing expertise, and hands-on support needed to bring
                    their ideas to life in China. Together, we combine our
                    strengths to create products that are both commercially
                    successful.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
      <section
        id="testimonials"
        className="about-boua__testimonials about-boua__container"
        aria-labelledby="about-testimonials-heading"
      >
        <div className="about-boua__testimonials-grid">
          <div className="about-boua__rail">
            <h2
              id="about-testimonials-heading"
              className="about-boua__label about-boua__sticky"
            >
              Testimonials
            </h2>
          </div>
          <ul className="about-boua__quotes">
            {testimonials.map((item) => (
              <li key={item.name} className="about-boua__quote">
                <p className="about-boua__quote-text">“{item.quote}”</p>
                <div className="about-boua__quote-attr">
                  <div className="about-boua__quote-photo">
                    <Image
                      src={item.photo}
                      alt=""
                      width={96}
                      height={96}
                      sizes="3.5rem"
                    />
                  </div>
                  <p className="about-boua__quote-name">{item.name}</p>
                  <p className="about-boua__quote-meta">
                    {item.company}
                    <span aria-hidden="true"> · </span>
                    {item.role}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Achievement */}
      <section
        id="achievement"
        className="about-boua__research about-boua__container"
        aria-labelledby="about-achievement-heading"
      >
        <div className="about-boua__rs-grid">
          <div className="about-boua__rail">
            <h2
              id="about-achievement-heading"
              className="about-boua__label about-boua__sticky"
            >
              Achievement
            </h2>
          </div>
          <ul className="about-boua__stats">
            {achievementStats.map((stat) => (
              <li
                key={stat.label}
                className={
                  stat.featured
                    ? "about-boua__stat about-boua__stat--featured"
                    : "about-boua__stat"
                }
              >
                <p className="about-boua__stat-label">{stat.label}</p>
                <p className="about-boua__stat-value">
                  <span className="about-boua__stat-num">{stat.value}</span>
                  {stat.unit ? (
                    <span className="about-boua__stat-unit">{stat.unit}</span>
                  ) : null}
                </p>
                <p className="about-boua__stat-note">{stat.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Experience — career strip (full bullets in content/experience.ts) */}
      <section
        id="experience"
        className="about-boua__work about-boua__container"
        aria-labelledby="about-experience-heading"
      >
        <div className="about-boua__work-grid">
          <div className="about-boua__rail">
            <h2
              id="about-experience-heading"
              className="about-boua__label about-boua__sticky"
            >
              Experience
            </h2>
          </div>
          <AboutExperienceList />
        </div>
      </section>

      <AboutExpertise />

      {/* How I work — tools / stack */}
      <section
        id="how-i-work"
        className="about-boua__how about-boua__container"
        aria-labelledby="about-how-heading"
      >
        <div className="about-boua__how-grid">
          <div className="about-boua__rail">
            <h2
              id="about-how-heading"
              className="about-boua__label about-boua__sticky"
            >
              How I work
            </h2>
          </div>
          <div className="about-boua__how-body">
            <ul className="about-boua__tools">
              {workTools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
