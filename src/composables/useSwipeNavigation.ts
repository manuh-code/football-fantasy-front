import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Composable for handling swipe navigation (swipe from left edge to go back)
 * Detects swipe gestures and navigates to the previous page with visual feedback
 */
export function useSwipeNavigation() {
  const router = useRouter()
  
  // State for tracking swipe progress
  const swipeDistance = ref(0)
  const isActive = ref(false)
  const threshold = 100 // Minimum distance to trigger navigation
  const edgeThreshold = 50 // Maximum distance from left edge to start swipe
  
  let startX = 0
  let startY = 0
  let currentX = 0
  let startTime = 0

  /**
   * Handle touch start event
   */
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
    
    // Only activate if starting near the left edge of the screen
    if (startX <= edgeThreshold) {
      isActive.value = true
    }
  }

  /**
   * Handle touch move event
   */
  const handleTouchMove = (e: TouchEvent) => {
    if (!isActive.value) return
    
    const touch = e.touches[0]
    currentX = touch.clientX
    const currentY = touch.clientY
    
    // Calculate distances
    const deltaX = currentX - startX
    const deltaY = Math.abs(currentY - startY)
    
    // If moving more vertically than horizontally, cancel swipe
    if (deltaY > Math.abs(deltaX)) {
      isActive.value = false
      swipeDistance.value = 0
      return
    }
    
    // Only track rightward movement (positive deltaX)
    if (deltaX > 0) {
      // Prevent default to avoid page scroll
      if (deltaX > 10) {
        e.preventDefault()
      }
      
      // Update swipe distance with diminishing returns for smoother feel
      swipeDistance.value = Math.min(deltaX * 0.8, 300)
    } else {
      // If swiping left, cancel
      isActive.value = false
      swipeDistance.value = 0
    }
  }

  /**
   * Handle touch end event
   */
  const handleTouchEnd = () => {
    if (!isActive.value) return
    
    const distance = currentX - startX
    const duration = Date.now() - startTime
    const velocity = distance / duration
    
    // Navigate back if:
    // 1. Swipe distance exceeds threshold OR
    // 2. Fast swipe (high velocity) in the right direction
    if (distance > threshold || (velocity > 0.5 && distance > 50)) {
      // Check if there's history to go back
      if (window.history.length > 1) {
        router.back()
      }
    }
    
    // Reset state with animation
    setTimeout(() => {
      isActive.value = false
      swipeDistance.value = 0
    }, 50)
  }

  /**
   * Handle touch cancel event
   */
  const handleTouchCancel = () => {
    isActive.value = false
    swipeDistance.value = 0
  }

  /**
   * Initialize event listeners
   */
  onMounted(() => {
    // Only enable on touch devices
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd, { passive: true })
      document.addEventListener('touchcancel', handleTouchCancel, { passive: true })
    }
  })

  /**
   * Clean up event listeners
   */
  onUnmounted(() => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
    document.removeEventListener('touchcancel', handleTouchCancel)
  })

  /**
   * Calculate opacity for visual feedback
   */
  const getOpacity = () => {
    return Math.min(swipeDistance.value / threshold, 1)
  }

  /**
   * Get transform value for visual feedback
   */
  const getTransform = () => {
    return swipeDistance.value
  }

  return {
    isActive,
    swipeDistance,
    getOpacity,
    getTransform,
  }
}
