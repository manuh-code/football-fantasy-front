<template>
  <div class="preview">
    <div class="preview__intro">
      <slot name="intro" />
    </div>

    <!-- El video ya es la pantalla completa de la app (886×1920, la misma
         proporción que un iPhone de 6.9"), así que aquí sí va dentro de un
         teléfono. -->
    <div ref="stage" class="preview__stage">
      <div class="phone">
        <div class="phone__screen">
          <video
            ref="video"
            class="phone__video"
            :src="DEMO_VIDEO.src"
            :poster="DEMO_VIDEO.poster"
            :width="DEMO_VIDEO.width"
            :height="DEMO_VIDEO.height"
            :aria-label="t('landing.preview.videoLabel')"
            preload="none"
            playsinline
            muted
            loop
            @click="togglePlay"
            @play="onPlay"
            @pause="onPause"
            @playing="loading = false"
            @waiting="loading = true"
            @volumechange="muted = video?.muted ?? true"
            @error="onError"
          />
          <span class="phone__island" aria-hidden="true" />

          <!-- Antes de la primera reproducción: el botón grande, que arranca
               con sonido porque es un gesto del usuario. -->
          <button
            v-if="!started && !failed"
            type="button"
            class="phone__start"
            :aria-label="t('landing.preview.play')"
            @click="startWithSound"
          >
            <span class="phone__start-disc">
              <LandingIcon name="play" />
            </span>
          </button>

          <p v-if="failed" class="phone__error" role="status">
            {{ t('landing.preview.error') }}
          </p>
        </div>
      </div>

      <div class="controls">
        <button
          type="button"
          class="controls__btn"
          :aria-label="playing ? t('landing.preview.pause') : t('landing.preview.play')"
          :disabled="failed"
          @click="togglePlay"
        >
          <span v-if="loading && playing" class="controls__spinner" aria-hidden="true" />
          <LandingIcon v-else :name="playing ? 'pause' : 'play'" />
        </button>
        <button
          type="button"
          class="controls__btn"
          :aria-label="muted ? t('landing.preview.unmute') : t('landing.preview.mute')"
          :aria-pressed="!muted"
          :disabled="failed"
          @click="toggleMute"
        >
          <LandingIcon :name="muted ? 'sound-off' : 'sound-on'" />
        </button>
        <span class="controls__time" aria-hidden="true">
          {{ clock(time) }} <span class="controls__total">/ {{ clock(DEMO_VIDEO.duration) }}</span>
        </span>
      </div>
    </div>

    <!-- Índice de escenas: el texto alternativo del video y su navegación a
         la vez. La que corre se enciende en lima; las que faltan quedan
         apagadas, dibujadas igual que las encendidas. -->
    <ol class="scenes" :aria-label="t('landing.preview.scenesLabel')">
      <li v-for="(scene, i) in scenes" :key="scene.key">
        <button
          type="button"
          class="scene"
          :class="{
            'is-active': i === activeIndex,
            'is-done': progress[i] >= 1 && i !== activeIndex,
          }"
          :aria-current="i === activeIndex ? 'step' : undefined"
          :disabled="failed"
          @click="seek(i)"
        >
          <span class="scene__time">{{ clock(scene.start, true) }}</span>
          <span class="scene__title">{{ t(`landing.preview.scenes.${scene.key}`) }}</span>
          <span class="scene__track" aria-hidden="true">
            <span class="scene__fill" :style="{ transform: `scaleX(${progress[i]})` }" />
          </span>
        </button>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LandingIcon from '@/components/landing/LandingIcon.vue'
import { DEMO_OUTRO_START, DEMO_SCENES, DEMO_VIDEO } from '@/views/landing/landingContent'

const emit = defineEmits<{
  /** El teléfono está al menos a medias en pantalla (≥ 55 %). */
  'stage-visible': [visible: boolean]
}>()

const { t } = useI18n()

const video = ref<HTMLVideoElement | null>(null)
const stage = ref<HTMLElement | null>(null)

const time = ref(0)
const playing = ref(false)
const loading = ref(false)
const muted = ref(true)
const started = ref(false)
const failed = ref(false)
// Si quien mira pausó, el video no vuelve a arrancar solo al regresar a él.
let pausedByUser = false

const scenes = DEMO_SCENES.map((scene, i) => ({
  ...scene,
  end: DEMO_SCENES[i + 1]?.start ?? DEMO_OUTRO_START,
}))

const activeIndex = computed(() =>
  started.value ? scenes.findIndex((s) => time.value >= s.start && time.value < s.end) : -1,
)

const progress = computed(() =>
  scenes.map((s) => Math.min(1, Math.max(0, (time.value - s.start) / (s.end - s.start)))),
)

/** m:ss. El reloj corre truncando, como cualquier reproductor; el inicio de
 *  cada escena se redondea (8.9 s se lee 0:09, no 0:08). */
function clock(seconds: number, round = false): string {
  const s = Math.max(0, round ? Math.round(seconds) : Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ── Reloj: lee currentTime en cada cuadro mientras corre, para que las
// barras de escena avancen lisas (timeupdate solo llega ~4 veces por segundo).
let frame = 0
function tick() {
  if (video.value) time.value = video.value.currentTime
  frame = requestAnimationFrame(tick)
}
function startClock() {
  if (!frame) frame = requestAnimationFrame(tick)
}
function stopClock() {
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  if (video.value) time.value = video.value.currentTime
}

function onPlay() {
  started.value = true
  playing.value = true
  startClock()
}
function onPause() {
  playing.value = false
  loading.value = false
  stopClock()
}
function onError() {
  failed.value = true
  playing.value = false
  loading.value = false
  stopClock()
}

async function play(): Promise<boolean> {
  const el = video.value
  if (!el || failed.value) return false
  loading.value = true
  try {
    await el.play()
    return true
  } catch {
    // Autoplay bloqueado (modo ahorro de batería, política del navegador):
    // se queda el póster con su botón de reproducir.
    loading.value = false
    return false
  }
}

function startWithSound() {
  pausedByUser = false
  if (video.value) video.value.muted = false
  void play()
}

function togglePlay() {
  const el = video.value
  if (!el) return
  if (el.paused) {
    pausedByUser = false
    void play()
  } else {
    pausedByUser = true
    el.pause()
  }
}

function toggleMute() {
  const el = video.value
  if (!el) return
  el.muted = !el.muted
  if (!el.muted && el.paused) {
    pausedByUser = false
    void play()
  }
}

function seek(index: number) {
  const el = video.value
  if (!el) return
  const target = scenes[index].start
  pausedByUser = false
  // Sin metadatos (preload="none") algunos navegadores ignoran el salto:
  // se repite en cuanto el video sabe su duración.
  if (el.readyState < HTMLMediaElement.HAVE_METADATA) {
    el.addEventListener('loadedmetadata', () => (el.currentTime = target), { once: true })
  }
  el.currentTime = target
  time.value = target
  started.value = true
  if (el.paused) void play()
}

// ── Reproducción automática al entrar en pantalla, silenciada y en bucle,
// como la App Preview de la propia App Store. Con el original de la tienda
// (41 MB) solo arranca sola con ratón: en un teléfono, casi siempre con datos
// móviles, se descarga si la persona toca reproducir. Con la versión web
// (`DEMO_VIDEO.lightweight`) arranca sola en todos lados. Nunca si se pidió
// menos movimiento o ahorro de datos. Se pausa al salir de pantalla.
let observer: IntersectionObserver | null = null
let stageVisible = false

function autoplayAllowed(): boolean {
  const pointerIsFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!DEMO_VIDEO.lightweight && !pointerIsFine) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return !connection?.saveData
}

onMounted(() => {
  if (!stage.value || !('IntersectionObserver' in window)) return
  const canAutoplay = autoplayAllowed()
  observer = new IntersectionObserver(
    ([entry]) => {
      const visible = entry.intersectionRatio >= 0.55
      if (visible !== stageVisible) {
        stageVisible = visible
        emit('stage-visible', visible)
      }
      const el = video.value
      if (!el || failed.value) return
      if (visible) {
        if (el.paused && !pausedByUser && (canAutoplay || started.value)) void play()
      } else if (entry.intersectionRatio < 0.2 && !el.paused) {
        el.pause()
      }
    },
    { threshold: [0, 0.2, 0.55, 0.8] },
  )
  observer.observe(stage.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  stopClock()
})
</script>

<style scoped>
.preview {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'intro'
    'stage'
    'scenes';
  gap: 2.5rem;
  align-items: start;
}
.preview__intro {
  grid-area: intro;
}
.preview__stage {
  grid-area: stage;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}
/* Luz de estadio sobre el teléfono. */
.preview__stage::before {
  content: '';
  position: absolute;
  inset: -10% -30% 10%;
  z-index: 0;
  background: radial-gradient(closest-side, rgba(1, 55, 210, 0.42), transparent 75%);
  pointer-events: none;
}

/* ── El iPhone ────────────────────────────────────────────────────────── */
.phone {
  position: relative;
  z-index: 1;
  width: min(78vw, 19.5rem);
  /* Con las barras de Safari el alto útil es el `svh`: teléfono y controles
     caben en una sola pantalla. */
  width: min(78vw, 19.5rem, calc((100svh - 10rem) * 0.46));
  padding: 0.6rem;
  border-radius: 3.1rem;
  background: #050505;
  box-shadow:
    inset 0 0 0 1px #3a3a3a,
    inset 0 0 0 3px #111,
    0 40px 80px -24px rgba(0, 0, 0, 0.9),
    0 18px 40px -12px rgba(0, 37, 170, 0.35);
}
/* Botones laterales: acción y volumen a la izquierda, encendido a la derecha. */
.phone::before,
.phone::after {
  content: '';
  position: absolute;
  width: 3px;
  border-radius: 2px;
  background: #2b2b2b;
}
.phone::before {
  left: -3px;
  top: 17%;
  height: 6.5%;
  box-shadow:
    0 4rem 0 0 #2b2b2b,
    0 8rem 0 0 #2b2b2b;
}
.phone::after {
  right: -3px;
  top: 27%;
  height: 11%;
}
.phone__screen {
  position: relative;
  overflow: hidden;
  aspect-ratio: 886 / 1920;
  border-radius: 2.5rem;
  background: #000;
  isolation: isolate;
}
.phone__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}
.phone__island {
  position: absolute;
  top: 2.1%;
  left: 50%;
  width: 31%;
  height: 3.6%;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #000;
  pointer-events: none;
}
.phone__start {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.35));
  cursor: pointer;
}
.phone__start-disc {
  display: grid;
  place-items: center;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 999px;
  font-size: 1.9rem;
  color: var(--lp-lime-ink);
  background: var(--lp-lime);
  box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.7);
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.phone__start-disc :deep(svg) {
  margin-left: 0.15em;
}
.phone__start:hover .phone__start-disc {
  transform: scale(1.06);
}
.phone__start:focus-visible {
  outline: none;
}
.phone__start:focus-visible .phone__start-disc {
  outline: 2px solid var(--lp-ink);
  outline-offset: 4px;
}
.phone__error {
  position: absolute;
  inset: auto 1rem 1.25rem;
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.35;
  color: var(--lp-ink);
  background: rgba(19, 19, 19, 0.92);
}

/* ── Controles bajo el teléfono ───────────────────────────────────────── */
.controls {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.controls__btn {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  font-size: 1.15rem;
  color: var(--lp-ink);
  background: var(--lp-surface);
  border: 1px solid var(--lp-line);
  transition: background-color 160ms ease;
}
.controls__btn:hover:not(:disabled) {
  background: var(--lp-surface-2);
}
.controls__btn:disabled {
  opacity: 0.4;
}
.controls__btn:focus-visible {
  outline: 2px solid var(--lp-lime);
  outline-offset: 3px;
}
.controls__spinner {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 999px;
  border: 2px solid rgba(249, 249, 249, 0.25);
  border-top-color: var(--lp-lime);
  animation: spin 0.8s linear infinite;
}
.controls__time {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--lp-ink-2);
}
.controls__total {
  color: var(--lp-ink-4);
}

/* ── Índice de escenas ────────────────────────────────────────────────── */
.scenes {
  grid-area: scenes;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--lp-line);
}
.scene {
  position: relative;
  display: grid;
  grid-template-columns: 3.25rem minmax(0, 1fr);
  align-items: baseline;
  gap: 0.75rem;
  width: 100%;
  padding: 1.05rem 0.25rem 1.15rem;
  text-align: left;
  border-bottom: 1px solid var(--lp-line);
  transition: background-color 160ms ease;
}
.scene:hover:not(:disabled) {
  background: rgba(249, 249, 249, 0.03);
}
.scene:focus-visible {
  outline: 2px solid var(--lp-lime);
  outline-offset: -2px;
  border-radius: 0.5rem;
}
.scene__time {
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--lp-ink-4);
}
.scene__title {
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--lp-ink-3);
  transition: color 200ms ease;
}
.scene__track {
  position: absolute;
  left: 0.25rem;
  right: 0.25rem;
  bottom: -1px;
  height: 2px;
  overflow: hidden;
}
.scene__fill {
  display: block;
  height: 100%;
  background: var(--lp-lime);
  transform: scaleX(0);
  transform-origin: left;
}
.scene.is-done .scene__fill {
  background: var(--lp-line-strong);
}
.scene.is-done .scene__title {
  color: var(--lp-ink-2);
}
.scene.is-active .scene__time {
  color: var(--lp-lime);
}
.scene.is-active .scene__title {
  color: var(--lp-ink);
}

@media (min-width: 1024px) {
  .preview {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    grid-template-areas:
      'stage intro'
      'stage scenes';
    grid-template-rows: auto 1fr;
    column-gap: clamp(3rem, 7vw, 7rem);
    row-gap: 2.5rem;
  }
  .preview__stage {
    position: sticky;
    top: 6rem;
  }
  /* Teléfono y controles caben en la ventana aun en laptops de 768 px. */
  .phone {
    width: clamp(15rem, calc((100vh - 12rem) * 0.46), 20rem);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .phone__start-disc,
  .scene,
  .scene__title {
    transition: none;
  }
  .controls__spinner {
    animation-duration: 2s;
  }
}
</style>
