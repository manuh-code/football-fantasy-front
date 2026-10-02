<template>
  <div class="rail">
    <!-- Carrusel a sangre: arranca en el borde del contenido y se sale por la
         derecha de la ventana, como la fila de capturas de la ficha. Se recorre
         con el dedo, la rueda, el teclado (la pista es enfocable) o las flechas. -->
    <ul
      ref="track"
      class="rail__track"
      role="list"
      tabindex="0"
      :aria-label="t('landing.screens.label')"
      @scroll.passive="queueMeasure"
    >
      <li
        v-for="(screen, i) in SCREENS"
        :key="screen.key"
        class="rail__item"
        :style="{ '--i': i }"
      >
        <img
          class="rail__shot"
          :src="screen.remote"
          :srcset="screenSrcset(screen)"
          sizes="(min-width: 1024px) 18vw, (min-width: 640px) 16rem, 68vw"
          :width="SCREEN_SIZE.width"
          :height="SCREEN_SIZE.height"
          :alt="t(`landing.screens.items.${screen.key}`)"
          :loading="i < 4 ? 'eager' : 'lazy'"
          :fetchpriority="i === 0 ? 'high' : 'auto'"
          decoding="async"
          draggable="false"
        />
      </li>
    </ul>

    <div class="rail__bar">
      <div class="rail__progress" aria-hidden="true">
        <span
          class="rail__thumb"
          :style="{ width: `${thumb.size * 100}%`, transform: `translateX(${thumb.offset * 100}%)` }"
        />
      </div>
      <div class="rail__arrows">
        <button
          type="button"
          class="rail__arrow"
          :disabled="!canPrev"
          :aria-label="t('landing.screens.prev')"
          @click="page(-1)"
        >
          <LandingIcon name="chevron-left" />
        </button>
        <button
          type="button"
          class="rail__arrow"
          :disabled="!canNext"
          :aria-label="t('landing.screens.next')"
          @click="page(1)"
        >
          <LandingIcon name="chevron-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LandingIcon from '@/components/landing/LandingIcon.vue'
import { SCREENS, SCREEN_SIZE, screenSrcset } from '@/views/landing/landingContent'

const { t } = useI18n()

const track = ref<HTMLUListElement | null>(null)
const canPrev = ref(false)
const canNext = ref(true)
// Ventana visible sobre el total, en fracciones: alimenta la barrita de
// progreso que sustituye a la barra de desplazamiento nativa (oculta).
const thumb = reactive({ size: 0.4, offset: 0 })

let frame = 0
function queueMeasure() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    measure()
  })
}

function measure() {
  const el = track.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  canPrev.value = el.scrollLeft > 4
  canNext.value = el.scrollLeft < max - 4
  thumb.size = Math.min(1, el.clientWidth / el.scrollWidth)
  // translateX en % se mide contra el propio ancho del pulgar.
  thumb.offset = max > 0 ? (el.scrollLeft / max) * (1 / thumb.size - 1) : 0
}

/** Avanza tantas capturas como caben enteras menos una, para no perder el hilo. */
function page(direction: 1 | -1) {
  const el = track.value
  const first = el?.querySelector<HTMLElement>('.rail__item')
  if (!el || !first) return
  const styles = getComputedStyle(el)
  const span = first.offsetWidth + (parseFloat(styles.columnGap) || 0)
  const visible = Math.floor((el.clientWidth - (parseFloat(styles.paddingLeft) || 0)) / span)
  const step = Math.max(1, visible - 1)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: direction * step * span, behavior: reduce ? 'auto' : 'smooth' })
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  measure()
  if (track.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(queueMeasure)
    resizeObserver.observe(track.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (frame) cancelAnimationFrame(frame)
})
</script>

<style scoped>
.rail {
  position: relative;
}

.rail__track {
  /* El borde izquierdo del contenido de la página, calculado contra el ancho
     de esta misma pista (sin la barra de desplazamiento de la ventana). */
  --edge: max(var(--lp-gutter), calc((100% - var(--lp-max)) / 2 + var(--lp-gutter)));
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0.25rem var(--edge) 0.5rem;
  list-style: none;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--edge);
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.rail__track::-webkit-scrollbar {
  display: none;
}
.rail__track:focus-visible {
  outline: 2px solid var(--lp-lime);
  outline-offset: -2px;
  border-radius: 1.25rem;
}

.rail__item {
  flex: 0 0 auto;
  width: min(68vw, 16.5rem);
  scroll-snap-align: start;
}

.rail__shot {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 1rem;
  /* Las capturas traen su propio fondo casi negro: un filo de 1 px las separa
     del suelo de la página. Es su único borde; no llevan sombra. */
  box-shadow: 0 0 0 1px rgba(249, 249, 249, 0.09);
  background: var(--lp-ground-2);
  user-select: none;
  -webkit-user-drag: none;
}

/* ── Progreso y flechas ───────────────────────────────────────────────── */
.rail__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  max-width: var(--lp-max);
  margin: 1.25rem auto 0;
  padding-inline: var(--lp-gutter);
}
.rail__progress {
  position: relative;
  flex: 0 1 12rem;
  height: 3px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--lp-line);
}
.rail__thumb {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: var(--lp-ink-2);
}
.rail__arrows {
  display: none;
  gap: 0.5rem;
}
.rail__arrow {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  font-size: 1.25rem;
  color: var(--lp-ink);
  background: var(--lp-surface);
  border: 1px solid var(--lp-line);
  transition:
    background-color 160ms ease,
    color 160ms ease,
    opacity 160ms ease;
}
.rail__arrow:hover:not(:disabled) {
  background: var(--lp-surface-2);
}
.rail__arrow:active:not(:disabled) {
  transform: scale(0.96);
}
.rail__arrow:disabled {
  opacity: 0.35;
  cursor: default;
}
.rail__arrow:focus-visible {
  outline: 2px solid var(--lp-lime);
  outline-offset: 3px;
}

@media (min-width: 640px) {
  .rail__item {
    width: 16rem;
  }
}
@media (min-width: 1024px) {
  .rail__track {
    gap: 1.25rem;
  }
  .rail__item {
    width: clamp(15rem, 18vw, 17.5rem);
  }
  .rail__arrows {
    display: flex;
  }
}

/* La entrada de la página: las capturas llegan desde la derecha, en cadena.
   Es el único movimiento de entrada de toda la landing. Arrancan ya visibles
   (opacidad parcial): son lo más grande del primer pantallazo y no deben
   pasar ni un cuadro en blanco. */
@media (prefers-reduced-motion: no-preference) {
  .rail__item {
    animation: rail-in 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: calc(min(var(--i), 5) * 70ms + 120ms);
  }
}
@keyframes rail-in {
  from {
    opacity: 0.4;
    transform: translateX(3rem);
  }
}
</style>
