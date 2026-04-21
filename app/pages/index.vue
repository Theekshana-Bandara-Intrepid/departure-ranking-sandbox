<!-- app/pages/index.vue
The main result page. Shows two columns side by side:
left = before pipeline (null scores, no meaningful ranking),
right = after pipeline (scores inherited, ranked by market demand).

Both columns use the same market selector. Switching market triggers
re-ranking in both columns simultaneously, making it easy to observe
that the same departure can rank very differently across markets. 

-->
<script setup lang="ts">
import { useRanking } from '~/composables/useRanking'
import type { Departure } from '~~/shared/types/departure'

const { market, rankDepartures } = useRanking()

// useFetch is Nuxt's SSR-aware data fetching composable.
// It fetches on the server during the initial request and hydrates
// the result on the client — no loading flash on first paint.
const { data: rawDepartures } = await useFetch<Departure[]>('/api/departures')
const { data: scoredDepartures } = await useFetch<Departure[]>('/api/departures', {
    query: { scored: true },
})

// rankDepartures is reactive to market because it reads market.value inside.
// When market changes, these computed properties recalculate automatically.
const rankedBefore = computed(() => rankDepartures(rawDepartures.value ?? []))
const rankedAfter = computed(() => rankDepartures(scoredDepartures.value ?? []))
</script>

<template>
    <div class="page">
        <h1>Search Results — Departure Ranking</h1>

        <div class="market-switcher">
            <label>Market:</label>
            <select v-model="market">
                <option value="au">Australia (AU)</option>
                <option value="uk">United Kingdom (UK)</option>
                <option value="us">United States (US)</option>
            </select>
        </div>

        <div class="columns">
            <section>
                <h2>Before pipeline <span class="tag-bad">DRR cold start</span></h2>
                <p class="note">
                    Scores are null. The re-ranking AI has no signal to learn from.
                    Departures appear in index order — effectively random from a
                    demand perspective.
                </p>
                <DepartureCard v-for="(dep, i) in rankedBefore" :key="dep.objectID" :departure="dep" :rank="i + 1"
                    :market="market" />
            </section>

            <section>
                <h2>After pipeline <span class="tag-good">Attraction Score</span></h2>
                <p class="note">
                    Every departure has inherited its parent product's accumulated
                    purchase history. Rankings now reflect real demand for this market.
                </p>
                <DepartureCard v-for="(dep, i) in rankedAfter" :key="dep.objectID" :departure="dep" :rank="i + 1"
                    :market="market" />
            </section>
        </div>
    </div>
</template>

<style scoped>
.page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 24px;
}

h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 16px;
}

h2 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.note {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 12px;
}

.market-switcher {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
}

select {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    font-size: 14px;
}

.columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
}

section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.tag-bad {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 99px;
    background: #fef2f2;
    color: #991b1b;
}

.tag-good {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 99px;
    background: #f0fdf4;
    color: #166534;
}

@media (max-width: 768px) {
    .columns {
        grid-template-columns: 1fr;
    }
}
</style>