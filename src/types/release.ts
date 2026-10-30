export interface ReleaseSummary {
  id: number;
  title: string;
  cover_image?: string;
  thumb?: string;
  format: string[];
  year: number | string;
  genre: string[];
  style: string[];
  lowest_price?: number | null;
  // In search results; release details have it per label instead.
  catno?: string;
}

export type ReleaseDetails = ReleaseSummary & {
  labels?: { name: string; catno: string }[];
  images?: { type?: string; uri?: string; uri150?: string }[];
  // Discogs' own date text: "07 Aug 2026", or "Jan 2026" / "2026" when the
  // day or month isn't known.
  released_formatted?: string;
};

// marketplace/stats/{id}: lowest_price is null when nothing is for sale.
export interface MarketplaceStats {
  num_for_sale?: number | null;
  lowest_price?: { value: number; currency: string } | null;
  blocked_from_sale?: boolean;
}
