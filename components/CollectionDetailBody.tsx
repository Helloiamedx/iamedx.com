import { CollectionDetailEntry } from "@/components/CollectionDetailEntry";
import {
  getCollectionProjects,
  type ProjectCollection,
} from "@/content/collections";

type CollectionDetailBodyProps = {
  collection: ProjectCollection;
};

export function CollectionDetailBody({ collection }: CollectionDetailBodyProps) {
  const entries = getCollectionProjects(collection);

  if (entries.length === 0) return null;

  return (
    <div className="collection-detail__body">
      <hr className="collection-detail__rule" aria-hidden="true" />
      <div className="collection-detail__entries">
        {entries.map(({ project, gameTitle, gameInfo, testimonial }) => (
          <CollectionDetailEntry
            key={project.slug}
            project={project}
            gameTitle={gameTitle}
            gameInfo={gameInfo}
            testimonial={testimonial}
          />
        ))}
      </div>
    </div>
  );
}
