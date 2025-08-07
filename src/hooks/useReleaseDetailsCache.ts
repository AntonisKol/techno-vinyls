import { useRef } from "react";
import { ReleaseDetails } from "../types/release";
import { releasesApi } from "../api/releasesApi";

export const useReleaseDetailsCache = () => {
  const cacheRef = useRef<Record<number, ReleaseDetails>>({});
  const [fetchDetails] = releasesApi.endpoints.getReleaseDetails.useLazyQuery();

  const prefetchDetails = async (id: number) => {
    if (cacheRef.current[id]) return;
    try {
      const result = await fetchDetails(id).unwrap();
      cacheRef.current[id] = result;
    } catch (err) {
      console.error(`Failed to fetch release ${id}:`, err);
    }
  };

  return { prefetchDetails, cache: cacheRef.current };
};
