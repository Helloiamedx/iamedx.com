import type { Metadata } from "next";
import { AboutCaseDemo } from "@/components/AboutCaseDemo";

export const metadata: Metadata = {
  title: "About",
  description: "About Edward / iamedx — product manufacturing partner across the full chain.",
};

const sections = [
  {
    id: "who-i-am",
    title: "Who I Am",
    body: "I’m Edward — the person behind iamedx. I help brands and founders turn product ideas into manufactured goods, with a focus on practical execution across China supply chains.",
  },
  {
    id: "how-i-work",
    title: "How I Work",
    body: "We scope the stages you actually need, agree on clear deliverables, then move factory by factory with tight feedback loops — samples, QC checkpoints, and written decisions so nothing gets lost between rounds.",
  },
  {
    id: "why-choose-me",
    title: "Why Choose Me",
    body: "You get one accountable partner across sourcing, development, production, packaging, and delivery — not a handoff chain of vendors. The aim is fewer surprises and products that match what you approved.",
  },
  {
    id: "my-experience",
    title: "My Experience",
    body: "Placeholder for your background, categories, markets, and representative work. Replace this with timelines, materials you’ve shipped, and the kinds of clients you support.",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <AboutCaseDemo />

      <section className="section about-page__intro">
        <p className="eyebrow">About</p>
        <h1>Get to Know Edward</h1>
        <p className="lede">
          Product manufacturing partner from factory search through finished
          goods — choose the stages that fit your project.
        </p>
      </section>

      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="section about-section"
        >
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </main>
  );
}
