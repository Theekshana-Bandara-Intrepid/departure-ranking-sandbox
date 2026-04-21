export interface ProductScore {
  tripCode: string
  tripName: string
  region: string

  bookings_au_12m: number
  bookings_uk_12m: number
  bookings_us_12m: number

  attractionScore_au: number
  attractionScore_uk: number
  attractionScore_us: number

  seasonalMultiplier: number
  peakMonths_au: number[]   

  avgClickPosition: number
  wishlistAdds_30d: number
  reviewScore: number

  scoreUpdatedAt: string
}

export interface PipelineRunResult {
  ran_at: string
  trips_processed: number
  departures_updated: number
  scores: ProductScore[]
}