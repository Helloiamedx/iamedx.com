import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionDetailBody } from "@/components/CollectionDetailBody";
import {
  getCollectionBySlug,
  projectCollections,
} from "@/content/collections";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projectCollections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return { title: "Collection" };
  return {
    title: collection.title,
    description: `${collection.headline} — product collection.`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  return (
    <main className="collection-detail">
      <header className="collection-detail__intro" aria-label={collection.title}>
        <div className="collection-detail__intro-inner">
          <p className="svc-demo__hero-eyebrow">Collection</p>
          <h1 className="collection-detail__title">{collection.headline}</h1>
        </div>
      </header>

      <CollectionDetailBody collection={collection} />
    </main>
  );
}
