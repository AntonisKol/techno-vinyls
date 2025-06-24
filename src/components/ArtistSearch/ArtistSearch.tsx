import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!hasActiveSearch) {
      setArtistSearch("");
    }
  }, [hasActiveSearch]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (artistSearch.trim().length > 0) {
        onSearch?.(artistSearch.trim());
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [artistSearch, onSearch]);

  return (
    <StyledContainer>
      <StyledTextField
        label="Search Artist"
        variant="outlined"
        size="small"
        value={artistSearch}
        onChange={(e) => setArtistSearch(e.target.value)}
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
