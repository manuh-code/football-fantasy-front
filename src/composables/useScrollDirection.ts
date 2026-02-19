import { ref, onMounted, onUnmounted } from 'vue'

interface ScrollDirectionOptions {
  threshold?: number // Minimum scroll distance to trigger hide/show
  startHidden?: boolean // Start with elements hidden
}

/**
 * Composable for detecting scroll direction and managing menu visibility
 * Shows menus on scroll up, hides on scroll down for better mobile UX
 */
export function useScrollDirection(options: ScrollDirectionOptions = {}) {
  const { threshold = 10, startHidden = false } = options
  
  const isVisible = ref(!startHidden)
  const scrollDirection = ref<'up' | 'down' | null>(null)
  const isAtTop = ref(true)
  const isAtBottom = ref(false)
  
  let lastScrollY = 0
  let ticking = false

  /**
   * Update scroll state
   */
  const updateScrollState = () => {
    const currentScrollY = window.scrollY
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    // Check if at top
    isAtTop.value = currentScrollY < 10

    // Check if at bottom (with small threshold)
    isAtBottom.value = currentScrollY + windowHeight >= documentHeight - 50

    // Determine scroll direction
    const delta = currentScrollY - lastScrollY

    if (Math.abs(delta) < threshold) {
      ticking = false
      return
    }

    // Update visibility based on scroll direction
    if (delta > 0) {
      // Scrolling down
      scrollDirection.value = 'down'
      // Hide menu unless at bottom
      if (!isAtBottom.value && !isAtTop.value) {
        isVisible.value = false
      }
    } else {
      // Scrolling up
      scrollDirection.value = 'up'
      // Always show menu when scrolling up
      isVisible.value = true
    }

    // Always show menu at top or bottom
    if (isAtTop.value || isAtBottom.value) {
      isVisible.value = true
    }

    lastScrollY = currentScrollY
    ticking = false
  }

  /**
   * Request animation frame for smooth performance
   */
  const requestTick = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollState)
      ticking = true
    }
  }

  /**
   * Handle scroll event
   */
  const handleScroll = () => {
    requestTick()
  }

  /**
   * Force show menu (useful for user interactions)
   */
  const show = () => {
    isVisible.value = true
  }

  /**
   * Force hide menu
   */
  const hide = () => {
    isVisible.value = false
  }

  /**
   * Initialize scroll listener
   */
  onMounted(() => {
    lastScrollY = window.scrollY
    updateScrollState()
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  /**
   * Clean up listener
   */
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    isVisible,
    scrollDirection,
    isAtTop,
    isAtBottom,
    show,
    hide,
  }
}
