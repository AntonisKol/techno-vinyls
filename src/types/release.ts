export interface ReleaseSummary {
  id: number;
  title: string;
  cover_image: string;
  format: string[];
  year: number;
  genre: string[];
  style: string[];
  lowest_price?: number;
}

export type ReleaseDetails = ReleaseSummary & {
  labels?: { name: string; catno: string }[];
};
