<!-- app/components/ScoreBadge.vue
A coloured pill displaying a market score and its tier label.
Used in both DepartureCard and the pipeline scores table.
Colour is derived from the score value, not hardcoded per market,
so the same component works correctly for all three markets. 
-->

<script setup lang="ts">
import type { Market } from "../../shared/types/departure";
import { useRanking } from "~/composables/useRanking";

const props = defineProps<{
    score: number | null
    market: Market
}>()

const { scoreLabel, scoreColour } = useRanking()
const label = computed(() => scoreLabel(props.score))
const colour = computed(() => scoreColour(props.score))
</script>

<template>
    <span class="score-badge" :style="{ background: colour + '22', color: colour, borderColor: colour + '55' }">
        {{ market.toUpperCase() }} {{ score ?? '—' }}
        <small>{{ label }}</small>
    </span>
</template>

<style scoped>
.score-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 99px;
    border: 1px solid;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
}

small {
    font-weight: 400;
    opacity: 0.8;
}
</style>