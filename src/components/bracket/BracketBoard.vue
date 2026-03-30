<template>
  <section class="bracket-board">
    <div class="bracket-board__canvas">
      <div class="bracket-board__grid">
        <BracketRegion
          v-if="regionMap.TL"
          class="bracket-board__region bracket-board__region--tl"
          :region="regionMap.TL"
          side="left"
          :stacked="isTabletOrPhone"
        />
        <BracketRegion
          v-if="regionMap.TR"
          class="bracket-board__region bracket-board__region--tr"
          :region="regionMap.TR"
          side="right"
          :stacked="isTabletOrPhone"
        />
        <BracketRegion
          v-if="regionMap.BL"
          class="bracket-board__region bracket-board__region--bl"
          :region="regionMap.BL"
          side="left"
          :stacked="isTabletOrPhone"
        />
        <BracketRegion
          v-if="regionMap.BR"
          class="bracket-board__region bracket-board__region--br"
          :region="regionMap.BR"
          side="right"
          :stacked="isTabletOrPhone"
        />

        <FinalsBracket class="bracket-board__finals" :finals="finals" />
      </div>
    </div>
    <div v-if="firstFour.games.length" class="bracket-board__first-four">
      <div class="bracket-board__section-heading">
        <div>
          <p>{{ firstFour.label }}</p>
          <h2>{{ firstFour.title }}</h2>
        </div>
        <span v-if="firstFour.subtitle">{{ firstFour.subtitle }}</span>
      </div>

      <div class="bracket-board__first-four-grid">
        <BracketGame
          v-for="game in firstFour.games"
          :key="game.contestId || game.bracketPositionId"
          :game="game"
          compact
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useViewportBreakpoints } from '@/composables/useViewportBreakpoints'
import BracketGame from './BracketGame.vue'
import BracketRegion from './BracketRegion.vue'
import FinalsBracket from './FinalsBracket.vue'

const props = defineProps({
  firstFour: {
    type: Object,
    required: true,
  },
  finals: {
    type: Object,
    required: true,
  },
  regions: {
    type: Array,
    required: true,
  },
})

const regionMap = computed(() =>
  props.regions.reduce((result, region) => {
    result[region.regionCode] = region
    return result
  }, {})
)

const { isTabletOrPhone } = useViewportBreakpoints()
</script>

<style scoped>
.bracket-board {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.bracket-board__first-four,
.bracket-board__canvas {
  padding: 22px;
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(9, 17, 35, 0.98), rgba(5, 10, 21, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.24);
}

.bracket-board__section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.bracket-board__section-heading p {
  margin: 0 0 6px;
  color: #ffca7a;
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.bracket-board__section-heading h2 {
  margin: 0;
  color: #f7f9ff;
  font-size: 1.24rem;
  font-weight: 900;
}

.bracket-board__section-heading span {
  color: rgba(233, 239, 255, 0.64);
  font-size: 0.88rem;
}

.bracket-board__first-four-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.bracket-board__canvas {
  overflow-x: auto;
}

.bracket-board__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.14fr) minmax(320px, 0.74fr) minmax(0, 1.14fr);
  grid-template-areas:
    'tl finals tr'
    'bl finals br';
  gap: 18px;
  min-width: max(100%, 1480px);
}

.bracket-board__region--tl {
  grid-area: tl;
}

.bracket-board__region--tr {
  grid-area: tr;
}

.bracket-board__region--bl {
  grid-area: bl;
}

.bracket-board__region--br {
  grid-area: br;
}

.bracket-board__finals {
  grid-area: finals;
  align-self: center;
}

/* iPad */
@media (max-width: 1279px) {
  .bracket-board__first-four,
  .bracket-board__canvas {
    padding: 20px 18px;
    border-radius: 24px;
  }

  .bracket-board__first-four-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bracket-board__canvas {
    overflow-x: visible;
  }

  .bracket-board__grid {
    min-width: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      'finals finals'
      'tl tr'
      'bl br';
  }
}

/* iPhone */
@media (max-width: 767px) {
  .bracket-board__first-four,
  .bracket-board__canvas {
    padding: 18px 14px;
    border-radius: 20px;
  }

  .bracket-board__section-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .bracket-board__grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      'finals'
      'tl'
      'tr'
      'bl'
      'br';
  }

  .bracket-board__first-four-grid {
    grid-template-columns: 1fr;
  }
}
</style>
