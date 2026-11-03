import { useEffect, useState } from "react";
import { ReleaseSummary } from "../types/release";

export type ReleaseIndex =
  | { status: "loading" }
  | { status: "ready"; releases: ReleaseSummary[] }
  // No index here (local runs) or it failed to load: use Discogs search.
  | { status: "missing" };

// The main list in full date order, built nightly by scripts/build-index.mjs
// and published with the site; REACT_APP_INDEX_URL says where (build:site).
export const useReleaseIndex = (
  url = process.env.REACT_APP_INDEX_URL
): ReleaseIndex => {
  const [index, setIndex] = useState<ReleaseIndex>(
    url ? { status: "loading" } : { status: "missing" }
  );

  useEffect(() => {
    if (!url) return;
    let active = true;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status}`);
        return response.json();
      })
      .then(({ releases }) => {
        if (!active) return;
        setIndex(
          Array.isArray(releases) && releases.length > 0
            ? { status: "ready", releases }
            : { status: "missing" }
        );
      })
      .catch(() => {
        if (active) setIndex({ status: "missing" });
      });
    return () => {
      active = false;
    };
  }, [url]);

  return index;
};
