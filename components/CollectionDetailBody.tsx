import { CollectionDetailEntry } from "@/components/CollectionDetailEntry";
import {
  getCollectionIpGroups,
  type ProjectCollection,
} from "@/content/collections";

type CollectionDetailBodyProps = {
  collection: ProjectCollection;
};

export function CollectionDetailBody({ collection }: CollectionDetailBodyProps) {
  const groups = getCollectionIpGroups(collection);

  if (groups.length === 0) return null;

  return (
    <div className="collection-detail__body">
      <div className="collection-detail__entries">
        {groups.map(
          ({ gameTitle, officialWebsite, companyName, ipVideo, projects }) => (
          <CollectionDetailEntry
            key={gameTitle}
            gameTitle={gameTitle}
            officialWebsite={officialWebsite}
            companyName={companyName}
            ipVideo={ipVideo}
            projects={projects}
          />
        ),
        )}
        <hr className="collection-detail__rule" aria-hidden="true" />
      </div>
    </div>
  );
}
