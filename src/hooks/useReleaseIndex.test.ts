import { renderHook, waitFor } from "@testing-library/react";
import { useReleaseIndex } from "./useReleaseIndex";

const answer = (ok: boolean, body: unknown) =>
  jest
    .fn()
    .mockResolvedValue({ ok, status: ok ? 200 : 404, json: async () => body });

describe("useReleaseIndex", () => {
  afterEach(() => {
    delete (global as { fetch?: unknown }).fetch;
  });

  it("is missing when there is no index to load", () => {
    const { result } = renderHook(() => useReleaseIndex(undefined));

    expect(result.current).toEqual({ status: "missing" });
  });

  it("gives the index's releases once loaded", async () => {
    global.fetch = answer(true, { releases: [{ id: 1, title: "A" }] });

    const { result } = renderHook(() => useReleaseIndex("/releases.json"));

    expect(result.current).toEqual({ status: "loading" });
    await waitFor(() =>
      expect(result.current).toEqual({
        status: "ready",
        releases: [{ id: 1, title: "A" }],
      })
    );
  });

  it("is missing when the index fails to load or is empty", async () => {
    global.fetch = answer(false, {});
    const failed = renderHook(() => useReleaseIndex("/releases.json"));
    await waitFor(() =>
      expect(failed.result.current).toEqual({ status: "missing" })
    );

    global.fetch = answer(true, { releases: [] });
    const empty = renderHook(() => useReleaseIndex("/releases.json"));
    await waitFor(() =>
      expect(empty.result.current).toEqual({ status: "missing" })
    );
  });
});
