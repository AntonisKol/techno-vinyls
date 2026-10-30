import { SxProps, Theme } from "@mui/material";

// The card frame, shared by the release card and its loading skeleton so the
// grid doesn't shift when a release replaces its skeleton. The details
// (catalogue number, price, link) sit at the bottom, so they line up across
// cards whatever the title's length.
export const cardFrame: SxProps<Theme> = {
  color: "text.primary",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  minHeight: 280,
  display: "flex",
  flexDirection: "column",
  backgroundImage: "none",
};

export const ARTWORK_SIZE = 72;

// The details block: pushed to the bottom of the card.
export const cardDetails: SxProps<Theme> = {
  mt: "auto",
  pt: 0,
  pb: 1,
  "&:last-child": { pb: 1 },
};

// Titles stop after three lines; the full title shows on hover.
export const TITLE_LINES = 3;
