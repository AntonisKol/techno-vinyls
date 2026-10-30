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
};

// marketplace/stats/{id}: lowest_price is null when nothing is for sale.
export interface MarketplaceStats {
  num_for_sale?: number | null;
  lowest_price?: { value: number; currency: string } | null;
  blocked_from_sale?: boolean;
}
