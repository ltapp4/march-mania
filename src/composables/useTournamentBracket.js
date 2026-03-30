import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  buildTournamentSnapshot,
  resolveTournamentOptions,
} from '@/utils/tournament'

export function useTournamentBracket(ownersByName) {
  const options = resolveTournamentOptions()
  const tournament = ref(null)
  const isLoading = ref(true)
  const error = ref('')
  const lastUpdatedAt = ref('')
  const isRefreshing = ref(false)
  let intervalId = null

  const ownerRows = computed(() => tournament.value?.standings || [])

  async function fetchBracket() {
    const endpoint = [
      options.apiBase,
      'brackets',
      options.sport,
      options.division,
      options.year,
    ].join('/')

    const isInitialLoad = !tournament.value

    if (!isInitialLoad) {
      isRefreshing.value = true
    }

    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Bracket request failed with ${response.status}`)
      }

      const payload = await response.json()
      const championship = payload.championships?.[0]

      if (!championship) {
        throw new Error('No championship data was returned by the bracket API.')
      }

      tournament.value = buildTournamentSnapshot(championship, ownersByName)
      lastUpdatedAt.value = new Date().toISOString()
      error.value = ''
    } catch (fetchError) {
      error.value =
        fetchError instanceof Error
          ? fetchError.message
          : 'Unable to load the live bracket right now.'
    } finally {
      isLoading.value = false
      isRefreshing.value = false
    }
  }

  onMounted(() => {
    fetchBracket()

    intervalId = window.setInterval(() => {
      fetchBracket()
    }, options.pollMs)
  })

  onBeforeUnmount(() => {
    if (intervalId) {
      window.clearInterval(intervalId)
      intervalId = null
    }
  })

  return {
    error,
    isLoading,
    isRefreshing,
    lastUpdatedAt,
    options,
    ownerRows,
    refreshBracket: fetchBracket,
    tournament,
  }
}
