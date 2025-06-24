import { useEffect, useState } from "react";
import { Box, Button, TextField } from "@mui/material";

interface ArtistSearchProps {
  onSearch?: (artistName: string) => void;
  onReset?: () => void;
  hasActiveSearch?: boolean;
}

const ArtistSearch = ({
  onSearch,
  onReset,
  hasActiveSearch,
}: ArtistSearchProps) => {
  const [artistSearch, setArtistSearch] = useState("");

  useEffect(() => {
    if (!hasActiveSearch) {
      setArtistSearch("");
    }
  }, [hasActiveSearch]);

  const handleArtistSearch = () => {
    if (!artistSearch) return;
    if (onSearch) onSearch(artistSearch);
  };

  return (
    <Box sx={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
      <TextField
        label="Search Artist"
        variant="outlined"
        size="small"
        value={artistSearch}
        sx={{
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
        }}
        onChange={(e) => setArtistSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleArtistSearch();
        }}
      />
      <Button
        variant="text"
        onClick={handleArtistSearch}
        sx={{ color: "lightgrey" }}
      >
        Search
      </Button>

      {hasActiveSearch && (
        <Button
          variant="text"
          onClick={onReset}
          sx={{ ml: 1, color: "lightpink" }}
        >
          Clear Search
        </Button>
      )}
    </Box>
  );
};

export default ArtistSearch;
