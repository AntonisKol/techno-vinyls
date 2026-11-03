import { shallowEqual, useSelector } from "react-redux";
import { releasesApi } from "../api/releasesApi";
import { dateFromFormatted } from "../helpers";
import { RootState } from "../store/store";

// The release dates already loaded for these releases (each card loads its
// own details), keyed by release id; undefined until a card's details arrive.
export const useReleasedDates = (ids: number[]) =>
  useSelector(
    (state: RootState) =>
      Object.fromEntries(
        ids.map((id) => {
          const details =
            releasesApi.endpoints.getReleaseDetails.select(id)(state).data;
          return [
            id,
            details?.released || dateFromFormatted(details?.released_formatted),
          ];
        }),
      ) as Record<number, string | undefined>,
    shallowEqual,
  );
