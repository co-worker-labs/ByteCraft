export interface PdfFileEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  thumbnailUrl: string | null;
  arrayBuffer: ArrayBuffer;
  enabled: boolean;
}

export interface MergeProgress {
  current: number;
  total: number;
}
