import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import { useReleasedDates } from "./useReleasedDates";

type State = {
  details: Record<number, { released?: string; released_formatted?: string }>;
};

// RTK Query's ESM build doesn't load under CRA's Jest, so the details cache
// is a plain store here, read the same way the endpoint's selector reads it.
jest.mock("../api/releasesApi", () => ({
  releasesApi: {
    endpoints: {
      getReleaseDetails: {
        select: (id: number) => (state: State) => ({ data: state.details[id] }),
      },
    },
  },
}));

describe("useReleasedDates", () => {
  it("gives the dates of loaded details, and undefined for the rest", () => {
    const store = createStore(
      (
        state: State = { details: {} },
        action: { type: string; id?: number },
      ) =>
        action.type === "loaded" && action.id
          ? {
              details: {
                ...state.details,
                [action.id]: { released: "2026-08-07" },
              },
            }
          : state,
    );
    const { result } = renderHook(() => useReleasedDates([1, 2]), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    expect(result.current).toEqual({ 1: undefined, 2: undefined });

    act(() => {
      store.dispatch({ type: "loaded", id: 1 });
    });

    expect(result.current).toEqual({ 1: "2026-08-07", 2: undefined });
  });

  it("reads Discogs' date text when details have no sortable date", () => {
    const store = createStore(() => ({
      details: { 1: { released_formatted: "07 Aug 2026" } },
    }));
    const { result } = renderHook(() => useReleasedDates([1]), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current).toEqual({ 1: "2026-08-07" });
  });
});
