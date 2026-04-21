// server/api/pipeline/scores.get.ts
//
// Returns the current product-level scores.
// In production this would query your data warehouse or database.
// Here it reads from the seed JSON file.
//
// This endpoint is used by the /pipeline page to show existing scores
// before the pipeline has been manually triggered.

import productScoresRaw from "../../../data/product-scores.json";
import type { ProductScore } from "../../../shared/types/pipeline";

export default defineEventHandler(() => {
  return productScoresRaw as ProductScore[];
});
