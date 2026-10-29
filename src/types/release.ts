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
}

export type ReleaseDetails = ReleaseSummary & {
  labels?: { name: string; catno: string }[];
  images?: { type?: string; uri?: string; uri150?: string }[];
};
