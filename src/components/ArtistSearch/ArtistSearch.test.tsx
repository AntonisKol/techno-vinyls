import { act, fireEvent, render, screen } from "@testing-library/react";
import ArtistSearch from "./ArtistSearch";

describe("ArtistSearch", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts a debounced search after two characters", () => {
    jest.useFakeTimers();
    const onSearch = jest.fn();
    render(<ArtistSearch onSearch={onSearch} />);

    fireEvent.change(screen.getByRole("textbox", { name: /search artist/i }), {
      target: { value: "xy" },
    });

    act(() => jest.advanceTimersByTime(300));
    expect(onSearch).toHaveBeenCalledWith("xy");
  });

  it("does not repeat a search when the active-search state updates", () => {
    jest.useFakeTimers();
    const onSearch = jest.fn();
    const { rerender } = render(<ArtistSearch onSearch={onSearch} />);

    fireEvent.change(screen.getByRole("textbox", { name: /search artist/i }), {
      target: { value: "xy" },
    });
    act(() => jest.advanceTimersByTime(300));
    rerender(<ArtistSearch onSearch={onSearch} hasActiveSearch />);
    act(() => jest.advanceTimersByTime(300));

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("resets an active search when the input is shorter than two characters", () => {
    jest.useFakeTimers();
    const onReset = jest.fn();
    render(<ArtistSearch onReset={onReset} hasActiveSearch />);

    fireEvent.change(screen.getByRole("textbox", { name: /search artist/i }), {
      target: { value: "x" },
    });

    act(() => jest.advanceTimersByTime(300));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
