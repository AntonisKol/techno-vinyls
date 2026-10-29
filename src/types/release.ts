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
