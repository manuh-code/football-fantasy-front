import { ref, onMounted, onUnmounted, readonly } from 'vue'

/**
 * Tracks the gap between the *layout* viewport and the *visual* viewport using
 * the VisualViewport API.
 *
 * Why this exists: on mobile (notably iOS Safari) a `position: fixed; bottom: 0`
 * element is pinned to the *layout* viewport, which does NOT track the *visual*
 * one — so it drifts whenever the two disagree, not just when a keyboard is
 * open. iOS's own bottom toolbar (address bar area) collapses/expands on load
 * and on scroll, shrinking and growing the visual viewport by ~40-80px without
 * ever crossing a "keyboard-sized" threshold; the browser's fixed-position
 * compositing doesn't reliably follow that smaller delta, so the bar visually
 * floats up into the middle of the screen ("aparece muy arriba") — this is
 * exactly the class of bug the keyboard case is a (much larger) special case of.
 *
 * `keyboardInset` is the raw, *continuous* pixel gap — consumers should apply
 * it as a `bottom` offset on every fixed bottom element on every render, not
 * only past the keyboard threshold, so the bar stays glued to the true visible
 * bottom through toolbar transitions too. `isOpen` is the debounced boolean
 * for the (much larger) keyboard case specifically, so consumers can hide/
 * relift a bottom bar while typing instead of trying to reposition it.
 */
export function useKeyboardInset(openThreshold = 120) {
  const keyboardInset = ref(0)
  const isOpen = ref(false)

  function update() {
    const vv = window.visualViewport
    if (!vv) {
      keyboardInset.value = 0
      isOpen.value = false
      return
    }
    // window.innerHeight = layout viewport; vv.height + vv.offsetTop = the part
    // still visible above the keyboard. The difference is the keyboard overlap.
    const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
    keyboardInset.value = Math.round(inset)
    isOpen.value = inset > openThreshold
  }

  onMounted(() => {
    const vv = window.visualViewport
    if (!vv) return
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
  })

  onUnmounted(() => {
    const vv = window.visualViewport
    if (!vv) return
    vv.removeEventListener('resize', update)
    vv.removeEventListener('scroll', update)
  })

  return {
    keyboardInset: readonly(keyboardInset),
    isKeyboardOpen: readonly(isOpen),
  }
}
