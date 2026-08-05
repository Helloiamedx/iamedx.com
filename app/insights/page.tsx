import type { Metadata } from "next";
import Link from "next/link";
import { getAllInsights } from "@/lib/insights";

export const metadata: Metadata = {
  title: "Insights",
  description: "Notes and reflections from product manufacturing work.",
};

export default function InsightsPage() {
  const insights = getAllInsights();

  return (
    <main className="section">
      <p className="eyebrow">Insights</p>
      <h1>Notes from the work.</h1>
      <ul className="insight-list">
        {insights.map((insight) => (
          <li key={insight.slug}>
            <Link href={`/insights/${insight.slug}`}>
              <time dateTime={insight.date}>{insight.date}</time>
              <h2>{insight.title}</h2>
              <p>{insight.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
