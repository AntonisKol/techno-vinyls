import { useEffect, useRef, useState } from "react";
import { StyledButton, StyledContainer, StyledTextField } from "./styled";

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
  const lastSearchedTerm = useRef<string | null>(null);

  useEffect(() => {
    if (!hasActiveSearch) {
      setArtistSearch("");
    }
  }, [hasActiveSearch]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const searchTerm = artistSearch.trim();
      if (searchTerm.length >= 2) {
        if (lastSearchedTerm.current !== searchTerm) {
          lastSearchedTerm.current = searchTerm;
          onSearch?.(searchTerm);
        }
      } else {
        lastSearchedTerm.current = null;
        if (hasActiveSearch) onReset?.();
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [artistSearch, hasActiveSearch, onReset, onSearch]);

  return (
    <StyledContainer>
      <StyledTextField
        label="Search Artist"
        variant="outlined"
        size="small"
        fullWidth
        value={artistSearch}
        onChange={(e) => setArtistSearch(e.target.value)}
        inputProps={{ "aria-label": "Search artist" }}
      />
      {hasActiveSearch && (
        <StyledButton variant="text" onClick={onReset}>
          Clear Search
        </StyledButton>
      )}
    </StyledContainer>
  );
};

export default ArtistSearch;
