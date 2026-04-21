// server/api/departures/index.get.ts
//
// Returns departure records from the dummy index.
//
// The ?scored=true query parameter is the key toggle for this project.
// It simulates the difference between:
//   scored=false  →  raw index state (what DRR has to work with: nothing)
//   scored=true   →  after partialUpdateObjects has run (scores inherited from pipeline)
//
// In production this route would be replaced by a direct Algolia query.
// The scored/unscored toggle simulates what Algolia's index would look like
// with and without the attractionScore_* custom ranking attributes populated.

import type { Departure } from "../../../shared/types/departure";
import type { ProductScore } from "../../../shared/types/pipeline";

import departuresRaw from "../../../data/departures.json";
import productScoresRaw from "../../../data/product-scores.json";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const scored = query.scored === "true";

  // Deep-clone so we never mutate the imported module cache.
  // JSON.parse(JSON.stringify()) is the simplest deep-clone for plain objects.
  let departures: Departure[] = JSON.parse(JSON.stringify(departuresRaw));

  if (scored) {
    // Build a lookup map keyed by tripCode.
    // This is O(1) per departure lookup vs O(n) if we used .find() in the loop.
    const scoreMap = new Map(
      (productScoresRaw as ProductScore[]).map((s) => [s.tripCode, s]),
    );

    // Stamp each departure with its parent product's scores.
    // This is what Algolia's partialUpdateObjects does in production —
    // it updates specific attributes on existing records without
    // replacing the whole document.
    departures = departures.map((dep) => {
      const score = scoreMap.get(dep.tripCode);
      if (!score) return dep;

      return {
        ...dep,
        attractionScore_au: score.attractionScore_au,
        attractionScore_uk: score.attractionScore_uk,
        attractionScore_us: score.attractionScore_us,
        seasonalMultiplier: score.seasonalMultiplier,
        scoreUpdatedAt: score.scoreUpdatedAt,
      };
    });
  }

  return departures;
});
