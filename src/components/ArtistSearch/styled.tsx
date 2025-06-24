import { styled, Box, TextField, Button } from "@mui/material";

export const StyledContainer = styled(Box)(() => ({
  display: "flex",
  gap: "1rem",
  marginBottom: "1.5rem",
}));

export const StyledTextField = styled(TextField)(() => ({
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: "lightgrey",
    },
    "&.Mui-focused input": {
      color: "lightgrey",
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "lightgrey",
  },
}));

export const StyledButton = styled(Button)(() => ({
  ml: 1,
  color: "lightpink",
}));
