import { ref, onMounted, onUnmounted } from 'vue'

export function useMediaQuery(query: string) {
  // Se resuelve ya en el primer render, no en onMounted: quien decide QUÉ pinta
  // con esto (cuántas pestañas caben, por ejemplo) enseñaría si no un fotograma
  // de la versión móvil en un escritorio. Sin `window` —prerender— se asume que
  // no encaja, que es el layout más estrecho y por tanto el más seguro.
  const matches = ref(typeof window !== 'undefined' && window.matchMedia(query).matches)
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
