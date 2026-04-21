<!--
Lets you manually trigger the scoring pipeline and inspect the output.

In production, this trigger would be a Cloud Scheduler job (GCP) or
EventBridge rule (AWS) calling a serverless function once per day.
Having a manual trigger here is useful for testing because you can
compare the recalculated scores against the seed data and verify
the normalisation maths is correct.

Note that clicking "Run Pipeline" here does not persist changes —
it reads from the seed JSON and returns recalculated scores in memory.
The returned scores are displayed instead of the seed scores, but the
JSON files are not written. This is intentional: the sandbox avoids
filesystem writes to stay stateless and easy to reset. 

-->
<script setup lang="ts">
import type { PipelineRunResult } from "../../shared/types/pipeline";
import type { ProductScore } from "../../shared/types/pipeline";

const result = ref<PipelineRunResult | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function runPipeline() {
    loading.value = true;
    error.value = null;
    try {
        result.value = await $fetch<PipelineRunResult>("/api/pipeline/run", {
            method: "POST",
        });
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : "Pipeline failed";
    } finally {
        loading.value = false;
    }
}

// Load the seed scores on mount so the table is populated immediately,
// before the user has clicked "Run Pipeline".
const { data: existingScores } = await useFetch<ProductScore[]>(
    "/api/pipeline/scores",
);

// After the pipeline runs, show the recalculated scores.
// Before it runs, show the seed scores. The template handles this with
// the (result?.scores ?? existingScores ?? []) expression.
</script>

<template>
    <div class="page">
        <h1>Product Score Pipeline</h1>
        <p class="subtitle">
            Simulates the daily aggregation job. Reads booking counts by
            <code>tripCode</code>, normalises to 0–100 per market, applies seasonal
            multipliers, then returns the scores that would be pushed to every
            departure via <code>partialUpdateObjects</code>.
        </p>

        <button class="run-btn" :disabled="loading" @click="runPipeline">
            {{ loading ? "Running…" : "Run Pipeline" }}
        </button>

        <div v-if="error" class="error">{{ error }}</div>

        <div v-if="result" class="result-banner">
            Pipeline ran at {{ result.ran_at }} · {{ result.trips_processed }} trips
            processed · {{ result.departures_updated }} departures updated
        </div>

        <h2 style="margin-top: 32px">Product scores</h2>

        <table class="scores-table">
            <thead>
                <tr>
                    <th>Trip</th>
                    <th>Region</th>
                    <th>Bookings AU</th>
                    <th>Bookings UK</th>
                    <th>Bookings US</th>
                    <th>Score AU</th>
                    <th>Score UK</th>
                    <th>Score US</th>
                    <th>Seasonal ×</th>
                    <th>Updated</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="s in result?.scores ?? existingScores ?? []" :key="s.tripCode">
                    <td>
                        <strong>{{ s.tripName }}</strong><br />
                        <small>{{ s.tripCode }}</small>
                    </td>
                    <td>{{ s.region }}</td>
                    <td>{{ s.bookings_au_12m }}</td>
                    <td>{{ s.bookings_uk_12m }}</td>
                    <td>{{ s.bookings_us_12m }}</td>
                    <td>
                        <ScoreBadge :score="s.attractionScore_au" market="au" />
                    </td>
                    <td>
                        <ScoreBadge :score="s.attractionScore_uk" market="uk" />
                    </td>
                    <td>
                        <ScoreBadge :score="s.attractionScore_us" market="us" />
                    </td>
                    <td>{{ s.seasonalMultiplier }}×</td>
                    <td>{{ s.scoreUpdatedAt }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 24px;
}

h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
}

h2 {
    font-size: 18px;
    font-weight: 600;
}

.subtitle {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 20px;
    max-width: 640px;
    line-height: 1.6;
}

code {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
}

.run-btn {
    padding: 10px 22px;
    background: #1d4ed8;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 16px;
}

.run-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.error {
    color: #b91c1c;
    margin-bottom: 12px;
    font-size: 14px;
}

.result-banner {
    padding: 10px 16px;
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 8px;
    font-size: 13px;
    color: #166534;
    margin-bottom: 16px;
}

.scores-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.scores-table th,
.scores-table td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #f3f4f6;
}

.scores-table th {
    font-weight: 600;
    background: #f9fafb;
}

small {
    color: #9ca3af;
}
</style>
