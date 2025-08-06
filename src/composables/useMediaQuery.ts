import { ref, onMounted, onUnmounted } from 'vue'

export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mediaQuery: MediaQueryList | null = null

  onMounted(() => {
    if (typeof window !== 'undefined') {
      mediaQuery = window.matchMedia(query)
      matches.value = mediaQuery.matches

      const handler = (e: MediaQueryListEvent) => {
        matches.value = e.matches
      }

      mediaQuery.addEventListener('change', handler)

      onUnmounted(() => {
        if (mediaQuery) {
          mediaQuery.removeEventListener('change', handler)
        }
      })
    }
  })

  return matches
}

export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isLarge = useMediaQuery('(min-width: 1280px)')

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
  }
}
