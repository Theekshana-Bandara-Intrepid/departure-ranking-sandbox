export interface Departure {
  objectID: string;
  tripCode: string;
  tripName: string;
  region: string;
  country: string;
  departureDate: string;
  returnDate: string;
  duration: number;
  price: number;
  currency: string;
  availability: number;
  market: string;
  style: string;
  tags: string[];

  attractionScore_au: number | null;
  attractionScore_uk: number | null;
  attractionScore_us: number | null;
  seasonalMultiplier: number | null;
  scoreUpdatedAt: string | null;
}

export type Market = "au" | "uk" | "us";
