import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About iamedx — product manufacturing partner across the full chain.",
};

export default function AboutPage() {
  return (
    <main className="section about">
      <p className="eyebrow">About</p>
      <h1>I help products get made.</h1>
      <div className="about__body">
        <p>
          iamedx is a product manufacturing practice covering the chain from
          factory search and development through sampling, production,
          packaging, delivery, and testing.
        </p>
        <p>
          Clients choose only the stages they need. The goal is practical
          progress: clear specs, reliable factories, and goods that leave the
          line the way you approved them.
        </p>
        <p>
          This page is a placeholder for a fuller bio — background, markets, and
          how engagements usually start. Replace this copy when you are ready.
        </p>
      </div>
    </main>
  );
}
