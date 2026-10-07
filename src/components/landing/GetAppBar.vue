<template>
  <!-- La barra de "Obtener" de la ficha, solo en pantallas de teléfono y
       tableta: aparece cuando la descarga del encabezado ya salió de vista y
       se esconde cuando la del cierre entra. En Android, donde la app aún no
       existe, ofrece la web en su lugar.

       Va por Teleport: `.app-content` (App.vue) lleva un transform para el
       gesto de volver, y un transform hace que `position: fixed` se mida
       contra ese contenedor; dentro de la página, la barra quedaría al final
       del documento y no al pie de la pantalla. -->
  <Teleport to="body">
    <div class="getbar" :class="{ 'is-visible': visible }" :inert="!visible">
      <img :src="APP_ICON" width="44" height="44" alt="" class="getbar__icon" />
      <span class="getbar__copy">
        <span class="getbar__name">{{ t('landing.brand') }}</span>
        <span class="getbar__sub">
          {{ isAndroid ? t('landing.getBar.androidSubtitle') : t('landing.getBar.subtitle') }}
        </span>
      </span>
      <router-link v-if="isAndroid" :to="{ name: 'home' }" class="getbar__action">
        {{ t('landing.getBar.androidAction') }}
      </router-link>
      <a v-else :href="APP_STORE.link" target="_blank" rel="noopener" class="getbar__action">
        {{ t('landing.getBar.action') }}
      </a>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { APP_ICON, APP_STORE } from '@/views/landing/landingContent'

defineProps<{ visible: boolean }>()

const { t } = useI18n()
const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
</script>

<style scoped>
/* Vive fuera de `.landing` (Teleport), así que trae sus propios tokens. */
.getbar {
  --lp-surface: #212121;
  --lp-line-strong: #414141;
  --lp-ink: #f9f9f9;
  --lp-ink-3: #b1b1b1;
  --lp-lime: #b4e70e;
  --lp-lime-ink: #212121;

  position: fixed;
  left: 0.75rem;
  right: 0.75rem;
  bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem;
  border-radius: 1.25rem;
  background: var(--lp-surface);
  border: 1px solid var(--lp-line-strong);
  transform: translateY(calc(100% + 2rem));
  opacity: 0;
  font-family: 'Montserrat Variable', 'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  transition:
    transform 320ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 200ms ease;
}
.getbar.is-visible {
  transform: none;
  opacity: 1;
}
.getbar__icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.7rem;
  flex-shrink: 0;
}
.getbar__copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;
}
.getbar__name {
  font-size: 0.9375rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--lp-ink);
}
.getbar__sub {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--lp-ink-3);
}
.getbar__action {
  flex-shrink: 0;
  margin-left: auto;
  padding: 0.7rem 1.15rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--lp-lime-ink);
  background: var(--lp-lime);
  transition: filter 160ms ease;
}
.getbar__action:hover {
  filter: brightness(1.06);
}
.getbar__action:active {
  transform: scale(0.97);
}
.getbar__action:focus-visible {
  outline: 2px solid var(--lp-ink);
  outline-offset: 3px;
}

@media (min-width: 1024px) {
  .getbar {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .getbar {
    transition: opacity 120ms linear;
    transform: none;
  }
}
</style>
