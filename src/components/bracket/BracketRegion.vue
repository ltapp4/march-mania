<template>
  <section class="region-card" :class="`region-card--${side}`">
    <header class="region-card__header">
      <p class="region-card__eyebrow">{{ region.abbreviation || region.regionCode }}</p>
      <h3 class="region-card__title">{{ region.title }}</h3>
    </header>

    <div class="region-card__rounds" :class="`region-card__rounds--${side}`">
      <div
        v-for="round in visibleRounds"
        :key="`${region.sectionId}-${round.roundNumber}`"
        class="region-card__column"
        :class="`region-card__column--games-${round.games.length}`"
      >
        <div class="region-card__round-label">{{ round.label }}</div>

        <div
          class="region-card__games"
          :class="{ 'region-card__games--stacked': stacked }"
        >
          <BracketGame
            v-for="(game, gameIndex) in round.games"
            :key="game.contestId || game.bracketPositionId"
            :game="game"
            :compact="round.roundNumber >= 4"
            :style="getGamePositionStyle(round.games.length, gameIndex)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import BracketGame from './BracketGame.vue'

const props = defineProps({
  region: {
    type: Object,
    required: true,
  },
  side: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value),
  },
  stacked: {
    type: Boolean,
    default: false,
  },
})

const visibleRounds = computed(() =>
  props.stacked
    ? props.region.rounds
    : props.side === 'right'
    ? [...props.region.rounds].reverse()
    : props.region.rounds
)

const ROUND_OFFSETS = {
  8: { start: 0, step: 1 },
  4: { start: 0.5, step: 2 },
  2: { start: 1.5, step: 4 },
  1: { start: 3.5, step: 0 },
}

function getGamePositionStyle(gameCount, gameIndex) {
  if (props.stacked) {
    return null
  }

  const layout = ROUND_OFFSETS[gameCount]

  if (!layout) {
    return null
  }

  const offset = layout.start + layout.step * gameIndex

  return {
    top: `calc(var(--region-step) * ${offset})`,
  }
}
</script>

<style scoped>
.region-card {
  --region-game-height: 172px;
  --region-base-gap: 14px;
  --region-step: calc(var(--region-game-height) + var(--region-base-gap));
  --region-column-height: calc(
    (var(--region-game-height) * 8) + (var(--region-base-gap) * 7)
  );
  padding: 24px 18px 22px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(10, 18, 38, 0.98), rgba(7, 13, 27, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.region-card__header {
  margin-bottom: 18px;
}

.region-card__eyebrow {
  margin: 0 0 4px;
  color: #ffca7a;
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.region-card__title {
  margin: 0;
  color: #f7f9ff;
  font-size: 1.18rem;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.region-card__rounds {
  display: grid;
  gap: 14px;
}

.region-card__rounds--left {
  grid-template-columns: 1.28fr 1.08fr 0.98fr 0.9fr;
}

.region-card__rounds--right {
  grid-template-columns: 0.9fr 0.98fr 1.08fr 1.28fr;
}

.region-card__column {
  min-width: 0;
}

.region-card__round-label {
  margin-bottom: 12px;
  color: rgba(232, 239, 255, 0.72);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.region-card__games {
  position: relative;
  min-height: var(--region-column-height);
}

.region-card__games :deep(.game-card) {
  position: absolute;
  inset-inline: 0;
  block-size: var(--region-game-height);
  min-height: var(--region-game-height);
  padding: 12px;
  border-radius: 18px;
}

.region-card__games :deep(.game-card__meta) {
  min-height: 18px;
  justify-content: flex-start;
  font-size: 0.68rem;
}

.region-card__games :deep(.game-card__network) {
  display: none;
}

.region-card__games :deep(.game-card__team) {
  padding: 8px 10px;
}

.region-card__games :deep(.game-card__identity) {
  display: grid;
  align-items: flex-start;
  gap: 4px;
}

.region-card__games :deep(.game-card__name) {
  font-size: 0.86rem;
  line-height: 1.15;
  white-space: normal;
  overflow: visible;
}

.region-card__games :deep(.game-card__owner-chip) {
  justify-self: flex-start;
  flex: 0 0 auto;
  min-height: 18px;
  padding: 0 7px;
  font-size: 0.6rem;
}

.region-card__games :deep(.game-card__score) {
  font-size: 0.94rem;
}

.region-card__games--stacked {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}

.region-card__games--stacked :deep(.game-card) {
  position: static;
  inset-inline: auto;
  block-size: auto;
  min-height: 0;
}

/* iPad */
@media (max-width: 1279px) {
  .region-card {
    --region-game-height: auto;
    padding: 20px 16px;
    border-radius: 22px;
  }

  .region-card__rounds,
  .region-card__rounds--left,
  .region-card__rounds--right {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .region-card__column--games-4,
  .region-card__column--games-2,
  .region-card__column--games-1 {
    padding-top: 0;
  }

  .region-card__games :deep(.game-card) {
    position: static;
    inset-inline: auto;
    block-size: auto;
    min-height: 0;
  }

}

/* iPhone */
@media (max-width: 767px) {
  .region-card {
    padding: 18px 14px;
    border-radius: 20px;
  }

  .region-card__header {
    margin-bottom: 14px;
  }

  .region-card__rounds,
  .region-card__rounds--left,
  .region-card__rounds--right {
    grid-template-columns: 1fr;
  }
}
</style>
