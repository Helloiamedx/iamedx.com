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
          ({
            id,
            officialWebsite,
            companyName,
            ipVideo,
            ipImage,
            ipLogo,
            projects,
          }) => (
          <CollectionDetailEntry
            key={id}
            officialWebsite={officialWebsite}
            companyName={companyName}
            ipVideo={ipVideo}
            ipImage={ipImage}
            ipLogo={ipLogo}
            projects={projects}
          />
        ),
        )}
      </div>
    </div>
  );
}
