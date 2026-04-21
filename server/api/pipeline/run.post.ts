// server/api/pipeline/run.post.ts
//
// Simulates the daily product score pipeline.
//
// In production this would be a scheduled Cloud Function or cron job.
// Here it runs on demand when you POST to /api/pipeline/run.
//
// The algorithm has three steps:
//
//   Step 1 — Find the ceiling.
//     Look at all trips and find the one with the highest booking count
//     per market. That trip defines what score 100 means. Every other trip
//     is scored relative to it. This prevents score inflation — a trip
//     that sells 50 units isn't "average" in isolation; it's only average
//     relative to the best-selling trip.
//
//   Step 2 — Normalise to 0–100.
//     Divide each trip's booking count by the ceiling and multiply by 100.
//     Round to a whole number. Cap at 100 (the seasonal multiplier can
//     push a score above 100 without the cap).
//
//   Step 3 — Apply seasonal multiplier.
//     If the current calendar month falls in a trip's peak season,
//     multiply the normalised score by the seasonal multiplier before
//     capping. This surface trips that are historically popular
//     right now — not just historically popular overall.
//
// The result is a list of recalculated ProductScore objects.
// In production, the next step would be to call:
//   algoliaIndex.partialUpdateObjects(departureUpdates)
// which would stamp every departure with its parent product's new scores.

import departuresRaw from "../../../data/departures.json";
import productScoresRaw from "../../../data/product-scores.json";

import type { Departure } from "../../../shared/types/departure";
import type { ProductScore, PipelineRunResult } from "../../../shared/types/pipeline";

export default defineEventHandler(async (): Promise<PipelineRunResult> => {
  const scores = productScoresRaw as ProductScore[];
  const departures = departuresRaw as Departure[];

  // Step 1: Find the booking ceiling per market.
  // Math.max(...array) is fine for small arrays.
  // For large datasets, use a single reduce pass instead.
  const maxAu = Math.max(...scores.map((s) => s.bookings_au_12m));
  const maxUk = Math.max(...scores.map((s) => s.bookings_uk_12m));
  const maxUs = Math.max(...scores.map((s) => s.bookings_us_12m));

  // Get the current month (1-indexed) to check peak season.
  // Using the server's local time is fine for a sandbox.
  // In production, use UTC or the customer's market timezone explicitly.
  const currentMonth = new Date().getMonth() + 1;

  // Step 2 + 3: Normalise and apply seasonal multiplier per market.
  const recalculated: ProductScore[] = scores.map((s) => {
    // Seasonal multiplier only applies to the AU market in this model.
    // UK and US would have their own peakMonths arrays in a full implementation.
    const isAuPeak = s.peakMonths_au.includes(currentMonth);
    const auMultiplier = isAuPeak ? s.seasonalMultiplier : 1.0;

    return {
      ...s,
      attractionScore_au: Math.min(
        100,
        Math.round((s.bookings_au_12m / maxAu) * 100 * auMultiplier),
      ),
      attractionScore_uk: Math.min(
        100,
        Math.round((s.bookings_uk_12m / maxUk) * 100),
      ),
      attractionScore_us: Math.min(
        100,
        Math.round((s.bookings_us_12m / maxUs) * 100),
      ),
      scoreUpdatedAt: new Date().toISOString().split("T")[0],
    } as ProductScore;
  });

  // Count how many departure records would receive a score update.
  // This number is what you would pass to partialUpdateObjects in batches.
  const tripCodesWithScores = new Set(recalculated.map((s) => s.tripCode));
  const departuresUpdated = departures.filter((d) =>
    tripCodesWithScores.has(d.tripCode),
  ).length;

  // --- Production hook point ---
  // Replace the return statement below with:
  //
  //   const algoliaUpdates = departures.map(dep => {
  //     const score = scoreMap.get(dep.tripCode)
  //     if (!score) return null
  //     return {
  //       objectID: dep.objectID,
  //       attractionScore_au: score.attractionScore_au,
  //       attractionScore_uk: score.attractionScore_uk,
  //       attractionScore_us: score.attractionScore_us,
  //       seasonalMultiplier: score.seasonalMultiplier,
  //       scoreUpdatedAt: score.scoreUpdatedAt,
  //     }
  //   }).filter(Boolean)
  //
  //   await algoliaIndex.partialUpdateObjects(algoliaUpdates)
  //
  // The rest of the function stays the same.

  return {
    ran_at: new Date().toISOString(),
    trips_processed: recalculated.length,
    departures_updated: departuresUpdated,
    scores: recalculated,
  };
});
