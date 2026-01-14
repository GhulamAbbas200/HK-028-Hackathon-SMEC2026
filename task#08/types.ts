
export interface WordData {
  text: string;
  size: number;
}

export interface SongMetadata {
  title: string;
  artist: string;
  lyrics: string;
  mood?: string;
  theme?: string;
  year?: string;
}

export interface AnalysisResult {
  metadata: SongMetadata;
  wordFrequencies: WordData[];
}
