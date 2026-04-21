<!-- app/components/DepartureCard.vue
Renders one departure result row with rank number and score badge.
The rank number is passed as a prop because the component itself
has no knowledge of its position — the parent page decides the sorted
order and passes the index in. This keeps the component pure and
independently testable. 
-->

<script setup lang="ts">
import type { Departure, Market } from '~~/shared/types/departure';

const props = defineProps<{
  departure: Departure
  rank: number
  market: Market
}>()

// Dynamically build the score key from the market prop.
// This avoids a v-if/v-else for each market and stays type-safe
// because Market is constrained to 'au' | 'uk' | 'us'.
const scoreKey = computed(
  () => `attractionScore_${props.market}` as keyof Departure
)
const score = computed(() => props.departure[scoreKey.value] as number | null)
</script>

<template>
  <div class="card">
    <div class="card-rank">#{{ rank }}</div>
    <div class="card-body">
      <div class="card-title">{{ departure.tripName }}</div>
      <div class="card-meta">
        {{ departure.country }} · {{ departure.duration }} days ·
        {{ departure.departureDate }} · {{ departure.currency }}
        {{ departure.price.toLocaleString() }}
      </div>
      <div class="card-tags">
        <span v-for="tag in departure.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
    <ScoreBadge :score="score" :market="market" />
  </div>
</template>

<style scoped>
.card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}

.card-rank {
  font-size: 22px;
  font-weight: 700;
  color: #9ca3af;
  min-width: 36px;
}

.card-body {
  flex: 1;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;
}

.card-meta {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 99px;
  font-size: 12px;
  color: #374151;
}
</style>