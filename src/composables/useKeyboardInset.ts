import { ref, onMounted, onUnmounted, readonly } from 'vue'

/**
 * Tracks the on-screen keyboard using the VisualViewport API.
 *
 * Why this exists: on mobile (notably iOS Safari) a `position: fixed; bottom: 0`
 * element is pinned to the *layout* viewport, which does NOT shrink when the
 * keyboard opens. The browser then scroll-shifts fixed elements, so a bottom bar
 * can visually float up into the middle of the screen ("aparece muy arriba").
 *
 * `keyboardInset` is how many pixels the keyboard overlaps the layout viewport
 * bottom; `isOpen` is a debounced boolean so consumers can hide/relift a bottom
 * bar while typing instead of letting the browser misplace it.
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
