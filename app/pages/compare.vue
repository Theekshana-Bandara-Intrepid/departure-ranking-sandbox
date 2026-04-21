<!-- app/pages/compare.vue
Shows the rank shift (▲ / ▼) for each departure between
before-pipeline and after-pipeline ordering.

This is the most honest test of whether the pipeline works.
If a trip like "Japan: Sakura & Cities" has 588 AU bookings
(the highest in the dataset), it should move from wherever it
landed in the raw index order to position #1 in the AU market.
If that doesn't happen, something is wrong in the normalisation logic.

The rank shift number itself (e.g. ▲ 3) tells you how many
positions a departure moved up relative to its unscored position.
A departure that was #5 before and is #2 after shows ▲ 3. 
-->

<script setup lang="ts">
import { useRanking } from '~/composables/useRanking'
import type { Departure } from '~~/shared/types/departure'

const { market, rankDepartures } = useRanking()

const { data: raw } = await useFetch<Departure[]>('/api/departures')
const { data: scored } = await useFetch<Departure[]>('/api/departures', {
    query: { scored: true },
})

const comparison = computed(() => {
    const before = rankDepartures(raw.value ?? [])
    const after = rankDepartures(scored.value ?? [])

    // Build the comparison from the "after" order — the after ranking
    // is the one we care about, and we annotate each row with where
    // that departure was in the "before" list.
    return after.map((dep, afterIdx) => {
        const beforeIdx = before.findIndex(d => d.objectID === dep.objectID)
        const shift = beforeIdx - afterIdx  // positive means moved up
        return {
            dep,
            beforeRank: beforeIdx + 1,
            afterRank: afterIdx + 1,
            shift,
        }
    })
})
</script>

<template>
    <div class="page">
        <h1>Rank Shift — Before vs After Pipeline</h1>
        <p class="subtitle">
            Switch market to see how rankings change per region.
            A departure ranked #5 in the raw index that rises to #2 after
            the pipeline shows ▲ 3. Departures that were already well-placed
            by chance show small or zero shifts.
        </p>

        <div class="market-switcher">
            <label>Market:</label>
            <select v-model="market">
                <option value="au">Australia (AU)</option>
                <option value="uk">United Kingdom (UK)</option>
                <option value="us">United States (US)</option>
            </select>
        </div>

        <table class="compare-table">
            <thead>
                <tr>
                    <th>Trip</th>
                    <th>Country</th>
                    <th>Departure</th>
                    <th>Before</th>
                    <th>After</th>
                    <th>Shift</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in comparison" :key="row.dep.objectID">
                    <td><strong>{{ row.dep.tripName }}</strong></td>
                    <td>{{ row.dep.country }}</td>
                    <td>{{ row.dep.departureDate }}</td>
                    <td class="rank-cell">#{{ row.beforeRank }}</td>
                    <td class="rank-cell">#{{ row.afterRank }}</td>
                    <td>
                        <span class="shift-badge" :class="row.shift > 0 ? 'up' : row.shift < 0 ? 'down' : 'flat'">
                            {{ row.shift > 0 ? `▲ ${row.shift}` : row.shift < 0 ? `▼ ${Math.abs(row.shift)}` : '—' }}
                                </span>
                    </td>
                    <td>
                        <ScoreBadge
                            :score="(row.dep as unknown as Record<string, unknown>)[`attractionScore_${market}`] as number | null"
                            :market="market" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.page {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px;
}

h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
}

.subtitle {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 20px;
    max-width: 600px;
    line-height: 1.6;
}

.market-switcher {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

select {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    font-size: 14px;
}

.compare-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.compare-table th,
.compare-table td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #f3f4f6;
}

.compare-table th {
    font-weight: 600;
    background: #f9fafb;
}

.rank-cell {
    font-weight: 700;
    color: #374151;
}

.shift-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 600;
}

.up {
    background: #f0fdf4;
    color: #166534;
}

.down {
    background: #fef2f2;
    color: #991b1b;
}

.flat {
    background: #f9fafb;
    color: #6b7280;
}
</style>