import { onUnmounted, ref, watch, type Ref } from 'vue'

/**
 * Bloqueo de scroll del fondo + swipe-down-para-cerrar para un panel/drawer
 * `position: fixed`, mismo comportamiento que ya tiene `BottomSheet.vue`.
 *
 * Por qué hace falta el bloqueo: un backdrop `position: fixed` no basta para
 * evitar que un touchmove sobre él (o sobre el panel) haga scroll de la
 * página real detrás — en iOS Safari, si el `<body>` sigue siendo scrolleable,
 * el navegador puede resolver el gesto contra el documento en vez de contra el
 * panel, así que visualmente el drawer se queda quieto mientras la lista de
 * jugadores de atrás se desplaza, sin forma de cerrarlo con el gesto. El truco
 * `position: fixed` + `top: -scrollY` en el body es el único que no salta a la
 * parte de arriba (o se queda pegado abajo si el teclado virtual estaba
 * abierto) al togglear `overflow`.
 *
 * El swipe-to-dismiss solo debe engancharse al handle/header del panel (nunca
 * al área de contenido con su propio scroll), para que arrastrar dentro de una
 * lista no se confunda con el gesto de cerrar.
 */
export function useDismissibleSheet(isOpen: Ref<boolean>, onDismiss: () => void) {
  const dragOffset = ref(0)
  const isDragging = ref(false)

  let startY = 0

  function onTouchStart(e: TouchEvent): void {
    startY = e.touches[0].clientY
    dragOffset.value = 0
    isDragging.value = false
  }

  function onTouchMove(e: TouchEvent): void {
    const deltaY = e.touches[0].clientY - startY

    if (!isDragging.value && deltaY > 10) {
      isDragging.value = true
    }

    if (isDragging.value && deltaY > 0) {
      dragOffset.value = deltaY
      e.preventDefault()
    }
  }

  function onTouchEnd(): void {
    if (isDragging.value && dragOffset.value > 100) {
      onDismiss()
    }
    dragOffset.value = 0
    isDragging.value = false
  }

  let lockedScrollY = 0

  function lockBodyScroll(): void {
    lockedScrollY = window.scrollY || document.documentElement.scrollTop
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${lockedScrollY}px`
    document.body.style.width = '100%'
  }

  function unlockBodyScroll(): void {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo({ top: lockedScrollY, behavior: 'instant' })
  }

  watch(isOpen, (open) => (open ? lockBodyScroll() : unlockBodyScroll()), { immediate: true })

  onUnmounted(() => {
    if (isOpen.value) unlockBodyScroll()
  })

  return { dragOffset, isDragging, onTouchStart, onTouchMove, onTouchEnd }
}
