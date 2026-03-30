<template>
  <section class="finals-card">
    <header class="finals-card__header">
      <p class="finals-card__eyebrow">Center Court</p>
      <h3 class="finals-card__title">Final Four and Championship</h3>
    </header>

    <div class="finals-card__rounds">
      <div class="finals-card__round-block">
        <div class="finals-card__round-label">
          {{ finals.semifinalLabel }}
          <span v-if="finals.semifinalSubtitle">{{ finals.semifinalSubtitle }}</span>
        </div>
        <div class="finals-card__semifinals">
          <BracketGame
            v-for="game in finals.semifinals"
            :key="game.contestId || game.bracketPositionId"
            :game="game"
            featured
          />
        </div>
      </div>

      <div class="finals-card__round-block">
        <div class="finals-card__round-label">
          {{ finals.championshipLabel }}
          <span v-if="finals.championshipSubtitle">{{ finals.championshipSubtitle }}</span>
        </div>
        <BracketGame
          v-if="finals.championship"
          :game="finals.championship"
          featured
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import BracketGame from './BracketGame.vue'

defineProps({
  finals: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.finals-card {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 26px 22px;
  border-radius: 30px;
  background:
    radial-gradient(circle at top, rgba(255, 172, 81, 0.16), transparent 35%),
    linear-gradient(180deg, rgba(11, 22, 46, 0.98), rgba(6, 12, 24, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 28px 68px rgba(0, 0, 0, 0.28);
}

.finals-card__header {
  text-align: center;
}

.finals-card__eyebrow {
  margin: 0 0 6px;
  color: #ffd08a;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.finals-card__title {
  margin: 0;
  color: #f7f9ff;
  font-size: 1.35rem;
  font-weight: 900;
}

.finals-card__rounds {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.finals-card__round-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.finals-card__round-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: rgba(234, 240, 255, 0.82);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.finals-card__round-label span {
  color: rgba(234, 240, 255, 0.58);
  font-size: 0.72rem;
}

.finals-card__semifinals {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

/* iPad */
@media (max-width: 1279px) {
  .finals-card {
    padding: 22px 18px;
    border-radius: 24px;
  }
}

/* iPhone */
@media (max-width: 767px) {
  .finals-card {
    padding: 18px 14px;
    border-radius: 20px;
  }

  .finals-card__semifinals {
    grid-template-columns: 1fr;
  }
}
</style>
