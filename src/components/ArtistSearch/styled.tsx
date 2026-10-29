import { styled, Box, TextField, Button } from "@mui/material";

export const StyledContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "1rem",
  maxWidth: 620,
  marginBottom: "1.5rem",
  "@media (max-width: 520px)": {
    flexDirection: "column",
  },
}));

export const StyledTextField = styled(TextField)(() => ({
  flex: 1,
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#111318",
    "&.Mui-focused fieldset": {
      borderColor: "#a0c2a7",
    },
    "&.Mui-focused input": {
      color: "#eceef2",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#9aa0ad",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#a0c2a7" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#30343b" },
}));

export const StyledButton = styled(Button)(() => ({
  ml: 1,
  color: "#a0c2a7",
}));
