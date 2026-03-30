import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const DESKTOP_MIN_WIDTH = 1280
const IPHONE_MAX_WIDTH = 767

export function useViewportBreakpoints() {
  const viewportWidth = ref(
    typeof window === 'undefined' ? DESKTOP_MIN_WIDTH : window.innerWidth
  )

  function updateViewportWidth() {
    viewportWidth.value = window.innerWidth
  }

  onMounted(() => {
    updateViewportWidth()
    window.addEventListener('resize', updateViewportWidth, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateViewportWidth)
  })

  const isDesktop = computed(() => viewportWidth.value >= DESKTOP_MIN_WIDTH)
  const isIphone = computed(() => viewportWidth.value <= IPHONE_MAX_WIDTH)
  const isIpad = computed(
    () => !isDesktop.value && !isIphone.value
  )
  const isTabletOrPhone = computed(() => !isDesktop.value)

  return {
    viewportWidth,
    isDesktop,
    isIpad,
    isIphone,
    isTabletOrPhone,
  }
}
