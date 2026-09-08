/**
 * Same-tag Related rotation for project detail.
 * Queue stays inside one involvement-tag pool — never mixes other types.
 */

export type RotationState = {
  version: 3;
  /** Bucket key = involvement tag label (e.g. "End-to-End") */
  buckets: Record<string, TagBucket>;
};

type TagBucket = {
  seen: string[];
  queue: string[];
  lastPage: string;
  lastGroup: string[];
};

const EMPTY_BUCKET: TagBucket = {
  seen: [],
  queue: [],
  lastPage: "",
  lastGroup: [],
};

function shuffle(ids: string[], random: () => number) {
  const result = [...ids];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}

function cleanIds(value: unknown, valid: Set<string>): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter(
        (id): id is string => typeof id === "string" && valid.has(id),
      ),
    ),
  ];
}

function readBucket(
  state: RotationState,
  tagKey: string,
  peerIds: string[],
  random: () => number,
): TagBucket {
  const valid = new Set(peerIds);
  const saved = state.buckets[tagKey] ?? EMPTY_BUCKET;
  const seen = cleanIds(saved.seen, valid);
  const queue = cleanIds(saved.queue, valid).filter((id) => !seen.includes(id));
  const missing = peerIds.filter(
    (id) => !seen.includes(id) && !queue.includes(id),
  );
  queue.push(...shuffle(missing, random));
  return {
    seen,
    queue,
    lastPage: typeof saved.lastPage === "string" ? saved.lastPage : "",
    lastGroup: cleanIds(saved.lastGroup, valid),
  };
}

function writeBucket(
  state: RotationState,
  tagKey: string,
  bucket: TagBucket,
): RotationState {
  return {
    ...state,
    buckets: { ...state.buckets, [tagKey]: bucket },
  };
}

export function reconcileRotation(raw: unknown): RotationState {
  if (
    raw &&
    typeof raw === "object" &&
    "version" in raw &&
    (raw as { version: unknown }).version === 3 &&
    "buckets" in raw &&
    typeof (raw as { buckets: unknown }).buckets === "object" &&
    (raw as { buckets: unknown }).buckets
  ) {
    return {
      version: 3,
      buckets: { ...(raw as RotationState).buckets },
    };
  }
  return { version: 3, buckets: {} };
}

/**
 * Pick up to `limit` unique peers from the same-tag queue.
 * Reshuffles the pool when the queue is exhausted; prefers avoiding lastGroup.
 */
export function selectRelated(options: {
  tagKey: string;
  currentSlug: string;
  peerSlugs: string[];
  limit?: number;
  raw: unknown;
  random?: () => number;
}): { ids: string[]; state: RotationState } {
  const {
    tagKey,
    currentSlug,
    peerSlugs,
    limit = 2,
    raw,
    random = Math.random,
  } = options;

  const peers = [...new Set(peerSlugs.filter((id) => id !== currentSlug))];
  let state = reconcileRotation(raw);
  let bucket = readBucket(state, tagKey, peers, random);

  const count = Math.min(limit, peers.length);
  if (count === 0) {
    return {
      ids: [],
      state: writeBucket(state, tagKey, {
        ...bucket,
        lastPage: currentSlug,
        lastGroup: [],
      }),
    };
  }

  /* Same page revisit — keep a unique, still-valid group */
  const cached = [
    ...new Set(
      bucket.lastGroup.filter((id) => peers.includes(id) && id !== currentSlug),
    ),
  ];
  if (bucket.lastPage === currentSlug && cached.length === count) {
    return { ids: cached, state };
  }

  const previous =
    bucket.lastPage === currentSlug ? [] : [...new Set(bucket.lastGroup)];
  const ids: string[] = [];
  const picked = new Set<string>();

  const takeNext = () => {
    let candidates = bucket.queue.filter(
      (id) => id !== currentSlug && !picked.has(id),
    );

    if (candidates.length === 0) {
      /* Round complete — reshuffle remaining same-tag peers */
      bucket = {
        ...bucket,
        seen: [],
        queue: shuffle(
          peers.filter((id) => !picked.has(id)),
          random,
        ),
      };
      candidates = bucket.queue.filter((id) => !picked.has(id));
    }

    const fresh = candidates.filter((id) => !previous.includes(id));
    if (fresh.length > 0) candidates = fresh;

    const selected = candidates[0];
    if (!selected || picked.has(selected)) return false;

    picked.add(selected);
    ids.push(selected);
    bucket = {
      ...bucket,
      seen: [...new Set([...bucket.seen, selected])],
      queue: bucket.queue.filter((id) => id !== selected),
    };
    return true;
  };

  while (ids.length < count) {
    if (!takeNext()) break;
  }

  bucket = {
    ...bucket,
    lastPage: currentSlug,
    lastGroup: ids,
  };
  state = writeBucket(state, tagKey, bucket);
  return { ids, state };
}
