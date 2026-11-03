import { shallowEqual, useSelector } from "react-redux";
import { releasesApi } from "../api/releasesApi";
import { RootState } from "../store/store";

// The release dates already loaded for these releases (each card loads its
// own details), keyed by release id; undefined until a card's details arrive.
export const useReleasedDates = (ids: number[]) =>
  useSelector(
    (state: RootState) =>
      Object.fromEntries(
        ids.map((id) => [
          id,
          releasesApi.endpoints.getReleaseDetails.select(id)(state).data
            ?.released,
        ])
      ) as Record<number, string | undefined>,
    shallowEqual
  );
