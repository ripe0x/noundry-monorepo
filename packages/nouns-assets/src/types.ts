export interface NounSeed {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}

export interface EncodedImage {
  filename: string;
  data: string;
  artist: string;
}

export interface NounData {
  parts: EncodedImage[];
  background: string;
}
