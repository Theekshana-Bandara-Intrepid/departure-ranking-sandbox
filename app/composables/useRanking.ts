// app/composables/useRanking.ts
//
// A composable in Vue 3 / Nuxt is a function that encapsulates
// reactive state and logic and can be shared across components.
//
// useRanking exists for one reason: the ranking logic (sort direction,
// which score field to read, what a score label means) needs to be
// consistent across three different pages. If that logic lived inline
// in each page, changing the score thresholds would require editing
// three files. Here it lives in one place.
//
// The `market` ref is the key piece of shared reactive state.
// When the user switches market from "au" to "uk", every component
// using useRanking() reacts — the sorted order updates, badge colours
// update, and the correct score column is highlighted. All without
// any prop drilling or event emitting.
import type { Departure, Market } from "../../shared/types/departure";

export function useRanking() {
  const market = ref<Market>("au");

  /**
   * Sort departures by the market-specific attractionScore, descending.
   *
   * Departures with null scores (before pipeline) use -1 as their sort value,
   * which pushes them to the bottom. This accurately represents the DRR
   * cold-start state: records with no signal sink in ranking.
   *
   * We spread into a new array first (...departures) because Array.sort()
   * mutates in place. Mutating a prop or a ref's inner array directly
   * causes hard-to-debug reactivity issues in Vue.
   */
  function rankDepartures(departures: Departure[]): Departure[] {
    const scoreKey = `attractionScore_${market.value}` as keyof Departure;
    return [...departures].sort((a, b) => {
      const scoreA = (a[scoreKey] as number | null) ?? -1;
      const scoreB = (b[scoreKey] as number | null) ?? -1;
      return scoreB - scoreA;
    });
  }

  /** Human-readable tier label for a score value */
  function scoreLabel(score: number | null): string {
    if (score === null) return "No data";
    if (score >= 80) return "High";
    if (score >= 50) return "Medium";
    return "Low";
  }

  /** Colour for badge backgrounds and text, keyed to tier */
  function scoreColour(score: number | null): string {
    if (score === null) return "#888";
    if (score >= 80) return "#3B6D11"; // green — high demand
    if (score >= 50) return "#854F0B"; // amber — moderate
    return "#A32D2D"; // red — low demand for this market
  }

  return { market, rankDepartures, scoreLabel, scoreColour };
}
