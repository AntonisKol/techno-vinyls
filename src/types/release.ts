export type ReleaseSummary = {
  id: number;
  title: string;
  year: number;
  format: string[];
  cover_image: string;
  uri: string;
  style?: string[];
  artists_sort: string;
  lowest_price?: number;
};

export type ReleaseDetails = ReleaseSummary & {
  labels?: { name: string; catno: string }[];
};
