<template>
  <v-card class="owner-card pa-4" rounded="xl">
    <div class="owner-card__header">
      <div class="owner-card__identity">
        <span
          class="owner-card__swatch"
          :style="{ backgroundColor: owner.color }"
        ></span>
        <div class="owner-card__name-block">
          <div class="owner-card__name">{{ owner.name }}</div>
          <div class="owner-card__subhead">
            {{ owner.aliveTeams }} alive of {{ owner.teamsBought }}
          </div>
        </div>
      </div>

      <v-btn
        :icon="isPinned ? 'mdi-pin' : 'mdi-pin-outline'"
        class="owner-card__pin"
        size="small"
        variant="text"
        @click="$emit('toggle-pin', owner.name)"
      />
    </div>

    <div class="owner-card__stats">
      <div class="owner-card__stat">
        <span class="owner-card__label">Wins</span>
        <strong>{{ owner.wins }}</strong>
      </div>
      <div class="owner-card__stat">
        <span class="owner-card__label">Winnings</span>
        <strong>{{ formatMoney(owner.winMoney) }}</strong>
      </div>
      <div class="owner-card__stat">
        <span class="owner-card__label">Bonus</span>
        <strong>{{ formatMoney(owner.bonusMoney) }}</strong>
      </div>
      <div class="owner-card__stat">
        <span class="owner-card__label">Entry</span>
        <strong>{{ formatMoney(owner.entryFees) }}</strong>
      </div>
      <div class="owner-card__stat">
        <span class="owner-card__label">Pot</span>
        <strong>{{ formatMoney(owner.potContribution) }}</strong>
      </div>
      <div class="owner-card__stat" :class="netClass">
        <span class="owner-card__label">Net</span>
        <strong>{{ formatMoney(owner.net) }}</strong>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '@/utils/tournament'

const props = defineProps({
  owner: {
    type: Object,
    required: true,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle-pin'])

const netClass = computed(() =>
  props.owner.net >= 0 ? 'owner-card__stat--positive' : 'owner-card__stat--negative'
)
</script>

<style scoped>
.owner-card {
  min-height: 214px;
  color: #f4f7ff;
  background:
    radial-gradient(circle at top right, rgba(255, 171, 84, 0.16), transparent 36%),
    linear-gradient(180deg, rgba(12, 22, 46, 0.98), rgba(7, 14, 29, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 48px rgba(1, 6, 17, 0.35);
}

.owner-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.owner-card__identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.owner-card__swatch {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  border-radius: 999px;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.06);
}

.owner-card__name-block {
  min-width: 0;
}

.owner-card__name {
  font-size: 1.02rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.owner-card__subhead {
  margin-top: 2px;
  color: rgba(229, 237, 255, 0.72);
  font-size: 0.82rem;
}

.owner-card__pin {
  color: rgba(255, 255, 255, 0.86);
}

.owner-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 10px;
}

.owner-card__stat {
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.owner-card__label {
  display: block;
  margin-bottom: 6px;
  color: rgba(229, 237, 255, 0.64);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.owner-card__stat strong {
  font-size: 0.96rem;
  font-weight: 800;
}

.owner-card__stat--positive strong {
  color: #8ef0b2;
}

.owner-card__stat--negative strong {
  color: #ff9b92;
}

/* iPad */
@media (max-width: 1279px) {
  .owner-card {
    min-height: auto;
  }

  .owner-card__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* iPhone */
@media (max-width: 767px) {
  .owner-card {
    padding: 14px !important;
    border-radius: 20px;
  }

  .owner-card__header {
    margin-bottom: 14px;
  }

  .owner-card__stats {
    gap: 10px 8px;
  }

  .owner-card__stat {
    padding: 10px;
    border-radius: 14px;
  }

  .owner-card__label {
    font-size: 0.68rem;
  }

  .owner-card__stat strong {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .owner-card {
    min-height: auto;
  }

  .owner-card__stats {
    grid-template-columns: 1fr;
  }
}
</style>
