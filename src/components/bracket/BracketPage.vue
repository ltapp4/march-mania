<template>
  <div class="bracket-page">
    <div class="bracket-page__shell">
      <section class="bracket-page__hero">
        <div>
          <p class="bracket-page__eyebrow">March Mania {{ options.year }}</p>
        </div>

        <div class="bracket-page__stats">
          <div class="bracket-page__stat-pill">
            <span>Championship pot</span>
            <strong>{{ formatMoney(tournament?.statistics.championshipPot || 0) }}</strong>
          </div>
          <div class="bracket-page__stat-pill">
            <span>Owners</span>
            <strong>{{ tournament?.statistics.ownerCount || 0 }}</strong>
          </div>
          <div class="bracket-page__stat-pill">
            <span>Teams drafted</span>
            <strong>{{ tournament?.statistics.teamsBought || 0 }}</strong>
          </div>
          <div class="bracket-page__stat-pill">
            <span>Live games</span>
            <strong>{{ tournament?.liveGameCount || 0 }}</strong>
          </div>
          <div class="bracket-page__stat-pill">
            <span>Completed games</span>
            <strong>
              {{ tournament?.completedGameCount || 0 }}/{{ tournament?.gameCount || 0 }}
            </strong>
          </div>
          <div class="bracket-page__stat-pill">
            <span>Updated</span>
            <strong>{{ formatUpdatedAt(lastUpdatedAt) }}</strong>
          </div>
        </div>
      </section>

      <div v-if="error" class="bracket-page__alert bracket-page__alert--error">
        <strong>Live update issue:</strong>
        <span>{{ error }}</span>
      </div>

      <div
        v-if="tournament?.unmatchedTeams.length"
        class="bracket-page__alert bracket-page__alert--warning"
      >
        <strong>Unmatched owner teams:</strong>
        <span>
          {{
            tournament.unmatchedTeams
              .map((entry) => `${entry.team} (${entry.owner})`)
              .join(', ')
          }}
        </span>
      </div>

      <OwnersBar
        v-if="ownerRows.length"
        :owners="ownerRows"
        :storage-key="`march-mania:pinned-owners:${options.year}`"
      />

      <div v-if="isLoading && !tournament" class="bracket-page__loading">
        <v-progress-circular color="#ffb74d" indeterminate size="48" width="4" />
        <p>Loading the live bracket...</p>
      </div>

      <div
        v-else-if="tournament"
        class="bracket-page__content"
        :class="{ 'bracket-page__content--refreshing': isRefreshing }"
      >
        <BracketBoard
          :first-four="tournament.firstFour"
          :finals="tournament.finals"
          :regions="tournament.regions"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import owners from '@/data/owners.json'
import { useTournamentBracket } from '@/composables/useTournamentBracket'
import { formatMoney, formatUpdatedAt } from '@/utils/tournament'
import BracketBoard from './BracketBoard.vue'
import OwnersBar from './OwnersBar.vue'

const {
  error,
  isLoading,
  isRefreshing,
  lastUpdatedAt,
  options,
  ownerRows,
  tournament,
} = useTournamentBracket(owners)
</script>

<style scoped>
.bracket-page {
  min-height: 100%;
  background:
    radial-gradient(circle at top, rgba(255, 166, 77, 0.14), transparent 26%),
    linear-gradient(180deg, #050b17 0%, #091324 38%, #0d1832 100%);
  color: #f4f7ff;
}

.bracket-page__shell {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 24px clamp(18px, 2vw, 32px) 32px;
}

.bracket-page__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 22px;
  padding: 30px;
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(255, 177, 86, 0.18), transparent 34%),
    linear-gradient(180deg, rgba(14, 24, 48, 0.98), rgba(5, 12, 24, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 32px 72px rgba(0, 0, 0, 0.28);
}

.bracket-page__eyebrow {
  margin: 0 0 8px;
  color: #ffca7a;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.bracket-page__title {
  margin: 0 0 12px;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1;
  font-weight: 900;
}

.bracket-page__summary {
  margin: 0;
  max-width: 760px;
  color: rgba(230, 237, 255, 0.78);
  font-size: 1rem;
  line-height: 1.65;
}

.bracket-page__summary code {
  color: #ffdfa8;
}

.bracket-page__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.bracket-page__stat-pill {
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.bracket-page__stat-pill span {
  display: block;
  margin-bottom: 8px;
  color: rgba(230, 237, 255, 0.64);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.bracket-page__stat-pill strong {
  font-size: 1.05rem;
  font-weight: 900;
}

.bracket-page__alert {
  display: flex;
  gap: 8px;
  padding: 14px 18px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.92rem;
}

.bracket-page__alert--error {
  background: rgba(221, 86, 86, 0.12);
  color: #ffd7d4;
}

.bracket-page__alert--warning {
  background: rgba(255, 194, 102, 0.12);
  color: #ffe1ad;
}

.bracket-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 320px;
  padding: 28px;
  border-radius: 30px;
  background: rgba(5, 11, 22, 0.74);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.bracket-page__loading p {
  margin: 0;
  color: rgba(230, 237, 255, 0.72);
}

.bracket-page__content {
  transition: opacity 180ms ease;
}

.bracket-page__content--refreshing {
  opacity: 0.92;
}

/* iPad */
@media (max-width: 1279px) {
  .bracket-page__shell {
    padding: 22px 20px 24px;
  }

  .bracket-page__hero {
    grid-template-columns: 1fr;
    padding: 24px 22px;
    border-radius: 24px;
  }

  .bracket-page__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* iPhone */
@media (max-width: 767px) {
  .bracket-page__shell {
    gap: 18px;
    padding: 14px;
  }

  .bracket-page__hero {
    padding: 18px 16px;
    border-radius: 20px;
  }

  .bracket-page__eyebrow {
    font-size: 0.72rem;
  }

  .bracket-page__title {
    font-size: 1.75rem;
  }

  .bracket-page__stats {
    grid-template-columns: 1fr;
  }

  .bracket-page__stat-pill {
    padding: 14px 15px;
    border-radius: 16px;
  }

  .bracket-page__alert {
    flex-direction: column;
    padding: 12px 14px;
    border-radius: 16px;
  }

  .bracket-page__loading {
    min-height: 240px;
    padding: 20px 16px;
    border-radius: 20px;
  }
}
</style>
