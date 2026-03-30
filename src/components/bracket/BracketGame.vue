<template>
  <article
    class="game-card"
    :class="{
      'game-card--compact': compact,
      'game-card--featured': featured,
      'game-card--live': game.isLive,
    }"
  >
    <div class="game-card__meta">
      <span class="game-card__status">{{ formatGameStatus(game) }}</span>
      <span v-if="game.broadcaster" class="game-card__network">
        {{ game.broadcaster }}
      </span>
    </div>

    <div class="game-card__teams">
      <div
        v-for="team in game.teams"
        :key="`${game.bracketPositionId}-${team.slot}`"
        class="game-card__team"
        :class="{
          'game-card__team--winner': game.isFinal && team.isWinner,
          'game-card__team--loser': game.isFinal && !team.isWinner && !team.isPlaceholder,
          'game-card__team--leading': !game.isFinal && team.isLeading,
          'game-card__team--placeholder': team.isPlaceholder,
        }"
      >
        <div class="game-card__team-main">
          <span class="game-card__seed">
            {{ team.seed ?? '-' }}
          </span>

          <div class="game-card__identity">
            <span class="game-card__name">{{ team.displayName }}</span>
            <span
              v-if="team.owner"
              class="game-card__owner-chip"
              :style="{
                backgroundColor: team.owner.color,
                color: '#08111e',
              }"
            >
              {{ team.owner.name }}
            </span>
          </div>
        </div>

        <strong class="game-card__score">
          {{ team.score ?? '-' }}
        </strong>
      </div>
    </div>
  </article>
</template>

<script setup>
import { formatGameStatus } from '@/utils/tournament'

defineProps({
  game: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.game-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  overflow: hidden;
  padding: 14px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(14, 24, 47, 0.98), rgba(6, 13, 28, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 14px 34px rgba(2, 6, 17, 0.3);
}

.game-card--live {
  border-color: rgba(255, 186, 102, 0.42);
  box-shadow: 0 16px 42px rgba(255, 156, 52, 0.12);
}

.game-card--compact {
  padding: 12px;
}

.game-card--featured {
  padding: 18px;
  border-radius: 24px;
}

.game-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: rgba(234, 240, 255, 0.72);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.game-card__status {
  color: #ffd38f;
}

.game-card__network {
  white-space: nowrap;
}

.game-card__teams {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.game-card__team {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: border-color 120ms ease, transform 120ms ease;
}

.game-card__team--winner {
  border-color: rgba(131, 241, 173, 0.38);
  background: rgba(88, 205, 124, 0.08);
}

.game-card__team--loser {
  opacity: 0.64;
}

.game-card__team--leading {
  border-color: rgba(255, 196, 122, 0.36);
}

.game-card__team--placeholder {
  opacity: 0.72;
}

.game-card__team-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1 1 auto;
}

.game-card__seed {
  width: 20px;
  flex: 0 0 20px;
  color: rgba(234, 240, 255, 0.64);
  font-size: 0.84rem;
  font-weight: 800;
  text-align: center;
}

.game-card__identity {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1 1 auto;
  flex-wrap: wrap;
}

.game-card__name {
  color: #f7f9ff;
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.2;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.game-card__owner-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  min-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.03em;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.game-card__score {
  color: #f7f9ff;
  font-size: 1rem;
  font-weight: 900;
  flex: 0 0 auto;
}

/* iPad */
@media (max-width: 1279px) {
  .game-card {
    padding: 13px;
    border-radius: 18px;
  }

  .game-card__meta {
    flex-wrap: wrap;
  }
}

/* iPhone */
@media (max-width: 767px) {
  .game-card {
    padding: 12px;
    border-radius: 16px;
  }

  .game-card__meta {
    font-size: 0.68rem;
    gap: 6px;
  }

  .game-card__team {
    padding: 9px 10px;
    gap: 8px;
  }

  .game-card__team-main {
    gap: 8px;
  }

  .game-card__name {
    font-size: 0.84rem;
  }

  .game-card__owner-chip {
    min-height: 18px;
    padding: 0 7px;
    font-size: 0.6rem;
  }

  .game-card__score {
    font-size: 0.92rem;
  }
}
</style>
