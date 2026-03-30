<template>
  <section class="owners-bar">
    <div class="owners-bar__header">
      <div class="owners-bar__heading">
        <p class="owners-bar__eyebrow">Owners</p>
        <h2 class="owners-bar__title">Leaderboard and payouts</h2>
      </div>
      <div class="owners-bar__controls">
        <p class="owners-bar__hint">
          {{
            viewMode === 'cards'
              ? `Pin up to ${maxVisible} names to keep them at the front of the rotation.`
              : 'List view is grouped by owners still alive and owners who are done.'
          }}
        </p>

        <v-btn
          class="owners-bar__toggle-btn"
          color="#ffb74d"
          size="small"
          variant="flat"
          @click="toggleViewMode"
        >
          {{ viewMode === 'cards' ? 'Show List' : 'Show Cards' }}
        </v-btn>
      </div>
    </div>

    <div v-if="viewMode === 'cards'" class="owners-bar__body">
      <v-btn
        class="owners-bar__nav owners-bar__nav--prev"
        icon="mdi-chevron-left"
        variant="text"
        :disabled="!canRotate"
        @click="handlePrev"
      />

      <div class="owners-bar__grid">
        <OwnersCard
          v-for="owner in visibleCards"
          :key="owner.name"
          :owner="owner"
          :is-pinned="isPinned(owner.name)"
          @toggle-pin="togglePin"
        />
      </div>

      <v-btn
        class="owners-bar__nav owners-bar__nav--next"
        icon="mdi-chevron-right"
        variant="text"
        :disabled="!canRotate"
        @click="handleNext"
      />
    </div>

    <div v-else class="owners-bar__list">
      <section
        v-for="section in ownerSections"
        :key="section.key"
        class="owners-bar__list-section"
      >
        <div class="owners-bar__list-header">
          <div>
            <p class="owners-bar__list-eyebrow">{{ section.label }}</p>
          </div>
          <span class="owners-bar__list-count">
            {{ section.owners.length }} owners
          </span>
        </div>

        <div class="owners-bar__list-table">
          <div class="owners-bar__list-table-head">
            <span>Owner</span>
            <span>Alive</span>
            <span>Wins</span>
            <span>Winnings</span>
            <span>Bonus</span>
            <span>Net</span>
          </div>

          <div
            v-for="owner in section.owners"
            :key="`${section.key}-${owner.name}`"
            class="owners-bar__list-row"
          >
            <div class="owners-bar__list-owner">
              <span
                class="owners-bar__list-swatch"
                :style="{ backgroundColor: owner.color }"
              ></span>
              <div class="owners-bar__list-owner-text">
                <strong>{{ owner.name }}</strong>
                <span>{{ owner.teamsBought }} teams</span>
              </div>
            </div>
            <span>{{ owner.aliveTeams }}</span>
            <span>{{ owner.wins }}</span>
            <span>{{ formatMoney(owner.winMoney) }}</span>
            <span>{{ formatMoney(owner.bonusMoney) }}</span>
            <strong
              class="owners-bar__list-net"
              :class="
                owner.net >= 0
                  ? 'owners-bar__list-net--positive'
                  : 'owners-bar__list-net--negative'
              "
            >
              {{ formatMoney(owner.net) }}
            </strong>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useViewportBreakpoints } from '@/composables/useViewportBreakpoints'
import { formatMoney } from '@/utils/tournament'
import OwnersCard from './OwnersCard.vue'

const props = defineProps({
  owners: {
    type: Array,
    required: true,
  },
  cycleMs: {
    type: Number,
    default: 5000,
  },
  maxVisible: {
    type: Number,
    default: 4,
  },
  storageKey: {
    type: String,
    default: 'march-mania:pinned-owners',
  },
})

const pinnedOwners = ref([])
const rotationStartIndex = ref(0)
const viewMode = ref('cards')
let intervalId = null
const { isIpad, isIphone } = useViewportBreakpoints()

const ownersSortedByNet = computed(() =>
  [...props.owners].sort((left, right) => {
    if (right.net !== left.net) {
      return right.net - left.net
    }

    if (right.winnings !== left.winnings) {
      return right.winnings - left.winnings
    }

    if (right.aliveTeams !== left.aliveTeams) {
      return right.aliveTeams - left.aliveTeams
    }

    return left.name.localeCompare(right.name)
  })
)

const ownerSections = computed(() => {
  const aliveOwners = ownersSortedByNet.value.filter((owner) => owner.aliveTeams > 0)
  const doneOwners = ownersSortedByNet.value.filter((owner) => owner.aliveTeams === 0)

  return [
    {
      key: 'alive',
      label: 'Still Alive',
      owners: aliveOwners,
    },
    {
      key: 'done',
      label: 'Eliminated',
      owners: doneOwners,
    },
  ].filter((section) => section.owners.length > 0)
})

const activeMaxVisible = computed(() => {
  if (isIphone.value) {
    return Math.min(props.maxVisible, 1)
  }

  if (isIpad.value) {
    return Math.min(props.maxVisible, 2)
  }

  return props.maxVisible
})

const visiblePinnedOwnerNames = computed(() =>
  pinnedOwners.value.slice(0, activeMaxVisible.value)
)

const pinnedCards = computed(() =>
  visiblePinnedOwnerNames.value
    .map((name) => props.owners.find((owner) => owner.name === name))
    .filter(Boolean)
)

const unpinnedOwners = computed(() =>
  props.owners.filter((owner) => !pinnedOwners.value.includes(owner.name))
)

const rotatingSlotCount = computed(() =>
  Math.max(0, activeMaxVisible.value - visiblePinnedOwnerNames.value.length)
)

const rotatingCards = computed(() => {
  const ownerPool = unpinnedOwners.value
  const slotCount = rotatingSlotCount.value

  if (!slotCount || ownerPool.length === 0) {
    return []
  }

  const actualCount = Math.min(slotCount, ownerPool.length)
  const cards = []

  for (let offset = 0; offset < actualCount; offset += 1) {
    const ownerIndex = (rotationStartIndex.value + offset) % ownerPool.length
    cards.push(ownerPool[ownerIndex])
  }

  return cards
})

const visibleCards = computed(() => [...pinnedCards.value, ...rotatingCards.value])

const canRotate = computed(
  () => unpinnedOwners.value.length > rotatingSlotCount.value
)

watch(
  () => props.owners,
  () => {
    pinnedOwners.value = pinnedOwners.value.filter((name) =>
      props.owners.some((owner) => owner.name === name)
    )
    rotationStartIndex.value = 0
    restartTimer()
  },
  { deep: true }
)

watch(
  () => props.storageKey,
  () => {
    pinnedOwners.value = readPinnedOwners()
    rotationStartIndex.value = 0
    restartTimer()
  }
)

watch(
  pinnedOwners,
  () => {
    persistPinnedOwners()
    rotationStartIndex.value = 0
    restartTimer()
  },
  { deep: true }
)

watch(activeMaxVisible, () => {
  rotationStartIndex.value = 0
  restartTimer()
})

onMounted(() => {
  pinnedOwners.value = readPinnedOwners()
  restartTimer()
})

onBeforeUnmount(() => {
  stopTimer()
})

function isPinned(ownerName) {
  return pinnedOwners.value.includes(ownerName)
}

function togglePin(ownerName) {
  if (isPinned(ownerName)) {
    pinnedOwners.value = pinnedOwners.value.filter((name) => name !== ownerName)
    return
  }

  if (pinnedOwners.value.length >= props.maxVisible) {
    return
  }

  pinnedOwners.value = [...pinnedOwners.value, ownerName]
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'cards' ? 'list' : 'cards'
}

function handleNext() {
  advanceRotation(1)
  restartTimer()
}

function handlePrev() {
  advanceRotation(-1)
  restartTimer()
}

function advanceRotation(delta) {
  if (unpinnedOwners.value.length === 0) {
    return
  }

  rotationStartIndex.value =
    (rotationStartIndex.value + delta + unpinnedOwners.value.length) %
    unpinnedOwners.value.length
}

function restartTimer() {
  stopTimer()

  if (!canRotate.value) {
    return
  }

  intervalId = window.setInterval(() => {
    advanceRotation(1)
  }, props.cycleMs)
}

function stopTimer() {
  if (intervalId) {
    window.clearInterval(intervalId)
    intervalId = null
  }
}

function readPinnedOwners() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(props.storageKey)
    const parsed = rawValue ? JSON.parse(rawValue) : []

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((name) =>
      props.owners.some((owner) => owner.name === name)
    )
  } catch {
    return []
  }
}

function persistPinnedOwners() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      props.storageKey,
      JSON.stringify(pinnedOwners.value)
    )
  } catch {
    // Ignore storage failures and keep the in-memory selection.
  }
}
</script>

<style scoped>
.owners-bar {
  padding: 28px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(255, 169, 74, 0.14), transparent 28%),
    linear-gradient(180deg, rgba(11, 20, 44, 0.98), rgba(6, 13, 28, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.28);
}

.owners-bar__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.owners-bar__heading {
  min-width: 0;
}

.owners-bar__eyebrow {
  margin: 0 0 6px;
  color: #ffcb7d;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.owners-bar__title {
  margin: 0;
  color: #f7f9ff;
  font-size: 1.45rem;
  font-weight: 900;
}

.owners-bar__hint {
  margin: 0;
  max-width: 320px;
  color: rgba(232, 239, 255, 0.74);
  font-size: 0.92rem;
  text-align: right;
}

.owners-bar__controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.owners-bar__toggle-btn {
  min-width: 110px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.owners-bar__body {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas: 'prev grid next';
  align-items: center;
  gap: 12px;
}

.owners-bar__nav {
  color: rgba(255, 255, 255, 0.86);
}

.owners-bar__nav--prev {
  grid-area: prev;
}

.owners-bar__nav--next {
  grid-area: next;
}

.owners-bar__grid {
  grid-area: grid;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.owners-bar__list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.owners-bar__list-section {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.owners-bar__list-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.owners-bar__list-eyebrow {
  margin: 0 0 4px;
  color: #ffcb7d;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.owners-bar__list-title {
  margin: 0;
  color: #f7f9ff;
  font-size: 1rem;
  font-weight: 900;
}

.owners-bar__list-count {
  color: rgba(232, 239, 255, 0.68);
  font-size: 0.82rem;
  white-space: nowrap;
}

.owners-bar__list-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.owners-bar__list-table-head,
.owners-bar__list-row {
  display: grid;
  grid-template-columns: minmax(220px, 1.6fr) repeat(5, minmax(0, 0.72fr));
  align-items: center;
  gap: 12px;
}

.owners-bar__list-table-head {
  padding: 0 12px 6px;
  color: rgba(232, 239, 255, 0.64);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.owners-bar__list-row {
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #f7f9ff;
  font-size: 0.92rem;
}

.owners-bar__list-owner {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.owners-bar__list-swatch {
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  border-radius: 999px;
}

.owners-bar__list-owner-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.owners-bar__list-owner-text strong {
  font-size: 0.96rem;
  font-weight: 800;
}

.owners-bar__list-owner-text span {
  color: rgba(232, 239, 255, 0.64);
  font-size: 0.78rem;
}

.owners-bar__list-net--positive {
  color: #8ef0b2;
}

.owners-bar__list-net--negative {
  color: #ff9b92;
}

/* iPad */
@media (max-width: 1279px) {
  .owners-bar {
    padding: 24px 20px;
    border-radius: 24px;
  }

  .owners-bar__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .owners-bar__controls {
    width: 100%;
    align-items: flex-start;
  }

  .owners-bar__hint {
    max-width: none;
    text-align: left;
  }

  .owners-bar__body {
    grid-template-columns: repeat(2, minmax(0, auto));
    grid-template-areas:
      'grid grid'
      'prev next';
    justify-content: center;
  }

  .owners-bar__nav--prev {
    justify-self: end;
  }

  .owners-bar__nav--next {
    justify-self: start;
  }

  .owners-bar__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .owners-bar__list-section {
    padding: 16px;
  }

  .owners-bar__list-table-head,
  .owners-bar__list-row {
    grid-template-columns: minmax(180px, 1.4fr) repeat(5, minmax(0, 0.72fr));
    gap: 10px;
  }
}

/* iPhone */
@media (max-width: 767px) {
  .owners-bar {
    padding: 18px 14px;
    border-radius: 20px;
  }

  .owners-bar__title {
    font-size: 1.2rem;
  }

  .owners-bar__hint {
    font-size: 0.86rem;
  }

  .owners-bar__toggle-btn {
    width: 100%;
  }

  .owners-bar__body {
    gap: 10px;
  }

  .owners-bar__grid {
    grid-template-columns: 1fr;
  }

  .owners-bar__nav {
    min-width: 44px;
  }

  .owners-bar__list-section {
    padding: 14px;
    border-radius: 18px;
  }

  .owners-bar__list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .owners-bar__list-table-head {
    display: none;
  }

  .owners-bar__list-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    align-items: start;
  }

  .owners-bar__list-owner {
    grid-column: 1 / -1;
  }

  .owners-bar__list-row > span,
  .owners-bar__list-row > strong {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .owners-bar__list-row > span::before,
  .owners-bar__list-row > strong::before {
    color: rgba(232, 239, 255, 0.58);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .owners-bar__list-row > span:nth-child(2)::before {
    content: 'Alive';
  }

  .owners-bar__list-row > span:nth-child(3)::before {
    content: 'Wins';
  }

  .owners-bar__list-row > span:nth-child(4)::before {
    content: 'Winnings';
  }

  .owners-bar__list-row > span:nth-child(5)::before {
    content: 'Bonus';
  }

  .owners-bar__list-row > strong:nth-child(6)::before {
    content: 'Net';
  }
}
</style>
