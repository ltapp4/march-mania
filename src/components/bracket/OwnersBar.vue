<template>
  <section class="owners-bar">
    <div class="owners-bar__header">
      <div>
        <p class="owners-bar__eyebrow">Owners</p>
        <h2 class="owners-bar__title">Leaderboard and payouts</h2>
      </div>
      <p class="owners-bar__hint">
        Pin up to {{ maxVisible }} names to keep them at the front of the rotation.
      </p>
    </div>

    <div class="owners-bar__body">
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
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useViewportBreakpoints } from '@/composables/useViewportBreakpoints'
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
let intervalId = null
const { isIpad, isIphone } = useViewportBreakpoints()

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

  .owners-bar__body {
    gap: 10px;
  }

  .owners-bar__grid {
    grid-template-columns: 1fr;
  }

  .owners-bar__nav {
    min-width: 44px;
  }
}
</style>
