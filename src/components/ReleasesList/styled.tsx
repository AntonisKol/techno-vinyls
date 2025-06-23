import { Box, Grid, styled, Typography } from "@mui/material";
import spaceImage from "../../assets/spaceImage.jpg";

export const StyledContainer = styled(Box)(() => ({
  display: "flex",
  height: "100vh",
  overflow: "hidden",
}));

export const StyledHeader = styled(Typography)(() => ({
  fontWeight: "bold",
  fontSize: 300,
  textAlign: "center",
  mt: 2,
  pointerEvents: "none",
  variant: "h1",
}));

export const StyledAppDescription = styled(Typography)(() => ({
  border: ".5px solid grey",
  fontSize: 16,
  textAlign: "center",
  pointerEvents: "none",
  variant: "h1",
  padding: 20,
  marginBottom: 50,
  color: "#999999",
}));

export const StyledLeftColumnContainer = styled(Grid)(() => ({
  color: "#000",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: 4,
  overflow: "hidden",
}));

export const StyledRightColumnContainer = styled(Grid)(() => ({
  bgcolor: "black",
  height: "100%",
  overflowY: "auto",
  padding: 10,
  display: "flex",
  flexDirection: "column",
  position: "relative",
  backgroundImage: `url(${spaceImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
}));

export const StyledButtonsContainer = styled(Box)(() => ({
  marginTop: 40,
  display: "flex",
  justifyContent: "center",
  gap: 2,
}));
