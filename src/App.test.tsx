import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock(
  "./components/ReleasesList",
  () =>
    ({ embedded }: { embedded?: boolean }) => (
      <main>{embedded ? "Embedded list" : "Techno Vinyls"}</main>
    )
);

test("renders the Techno Vinyls app", () => {
  render(<App />);
  expect(screen.getByRole("main")).toHaveTextContent("Techno Vinyls");
  expect(
    screen.getByRole("navigation", { name: "Main navigation" })
  ).toHaveTextContent("HomeADNS SPACETechno VinylsMarket Trends");
  expect(screen.getByRole("link", { name: "Techno Vinyls" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  expect(
    screen.getByText("© Antonios Kolovos. All rights reserved.")
  ).toBeInTheDocument();
});

test("inside the Techno Vinyls page it renders only the list", () => {
  render(<App embedded />);
  expect(screen.getByRole("main")).toHaveTextContent("Embedded list");
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  expect(screen.queryByText(/All rights reserved/)).not.toBeInTheDocument();
});
