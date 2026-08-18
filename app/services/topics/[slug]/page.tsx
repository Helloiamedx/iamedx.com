import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClickSpark } from "@/components/ClickSpark";
import { contactCta, findServiceTopic, servicesMega } from "@/content/nav";

type TopicPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return servicesMega.flatMap((column) =>
    column.links.map((link) => ({ slug: link.slug })),
  );
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = findServiceTopic(slug);
  if (!topic) return { title: "Services" };
  return {
    title: topic.link.label,
    description: topic.column.description,
  };
}

export default async function ServiceTopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = findServiceTopic(slug);
  if (!topic) notFound();

  return (
    <main className="section">
      <Link href="/services" className="back-link">
        ← Services
      </Link>
      <p className="eyebrow">{topic.column.title}</p>
      <h1>{topic.link.label}</h1>
      <p className="lede">{topic.column.description}</p>
      <p>
        Detailed copy for this service path will go here. For now this page
        confirms the mega-menu route is wired.
      </p>
      <p>
        <ClickSpark>
          <a href={contactCta.href} className="button">
            Email
          </a>
        </ClickSpark>
      </p>
    </main>
  );
}
