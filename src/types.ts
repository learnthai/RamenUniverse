export interface Visit {
  id: string;
  item: string;
  rating: number;
  comment?: string;
  season?: string;
  style?: string;
}

export interface RamenCard {
  id: string;
  shop: string;
  item?: string;
  style?: string;
  season?: string;
  station?: string;
  comment?: string;
  rating?: number;
  createdAt?: string;
  visitedAt?: string;
  visits?: Visit[];
}

export interface AppState {
  wish: RamenCard[];
  visited: RamenCard[];
  styles: string[];
  seasons: string[];
}
