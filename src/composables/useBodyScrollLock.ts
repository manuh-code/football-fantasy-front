import { onUnmounted } from 'vue'

/**
 * Congela la página de fondo mientras hay una capa abierta encima.
 *
 * El truco es `position: fixed` + `top` negativo, no solo `overflow: hidden`:
 * con overflow a secas el navegador salta al principio del documento al
 * soltarlo (y en iOS se queda donde lo dejó el teclado virtual). Se guarda el
 * scroll antes de fijar y se restaura al soltar.
 *
 * El bloqueo se cuenta entre todas las capas, no lo guarda cada una: una hoja
 * abierta SOBRE otra (el selector de liga encima de un formulario, la lista de
 * "Más" dentro del cajón de equipo) volvería a leer `scrollY` —ya 0 con el body
 * fijo— y, al cerrarse, devolvería el scroll a la página con la primera capa
 * todavía abierta.
 */
let openLayers = 0
let lockedScrollY = 0

export function useBodyScrollLock() {
  // Cada consumidor recuerda si tiene su parte cogida, para que un desmontaje
  // no descuente dos veces ni de menos.
  let holdsLock = false

  const lock = (): void => {
    if (holdsLock || typeof document === 'undefined') return
    if (openLayers === 0) {
      lockedScrollY = window.scrollY || document.documentElement.scrollTop
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${lockedScrollY}px`
      document.body.style.width = '100%'
    }
    openLayers++
    holdsLock = true
  }

  const unlock = (): void => {
    if (!holdsLock || typeof document === 'undefined') return
    holdsLock = false
    openLayers = Math.max(0, openLayers - 1)
    if (openLayers > 0) return // Queda alguna capa abierta por encima o por debajo.

    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo({ top: lockedScrollY, behavior: 'instant' })
  }

  // Desmontarse con la capa abierta (navegar desde dentro de ella) también
  // tiene que soltar su parte.
  onUnmounted(unlock)

  return { lock, unlock }
}
