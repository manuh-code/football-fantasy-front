<template>
  <div class="dl" :class="`dl--${align}`">
    <div class="dl__stores">
      <!-- Insignia oficial de Apple: mismo destino, imagen y texto alternativo
           que el código del toolbox de marketing; solo cambia el tamaño en
           pantallas angostas, donde va lado a lado con la de Google Play. -->
      <a
        class="dl__appstore"
        :href="APP_STORE.badgeHref"
        target="_blank"
        rel="noopener"
      >
        <img
          :src="badgeSrc"
          :alt="t('landing.download.appStore')"
          width="246"
          height="82"
        />
      </a>

      <!-- Android todavía no existe: una celda apagada, dibujada igual de
           completa que la insignia encendida, en vez de un hueco. No es un
           control, así que no es focusable ni parece botón. -->
      <p class="dl__play">
        <LandingIcon name="google-play" class="dl__play-logo" />
        <span class="dl__play-text">
          <span class="dl__play-kick">{{ t('landing.download.playSoon') }}</span>
          <span class="dl__play-name">Google Play</span>
        </span>
      </p>
    </div>

    <!-- El QR es para quien está en una computadora (ratón o trackpad) y tiene
         el iPhone a la mano; en un dispositivo táctil se toca la insignia. -->
    <figure class="dl__qr">
      <span class="dl__qr-paper">
        <img
          :src="APP_STORE.qrSrc"
          width="400"
          height="400"
          :alt="t('landing.download.qrAlt')"
          loading="lazy"
          decoding="async"
        />
      </span>
      <figcaption>{{ t('landing.download.qrHint') }}</figcaption>
    </figure>

    <router-link :to="{ name: 'home' }" class="dl__web">
      {{ t('landing.download.web') }}
      <LandingIcon name="arrow-right" class="dl__web-arrow" />
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LandingIcon from '@/components/landing/LandingIcon.vue'
import { APP_STORE, appStoreBadgeSrc } from '@/views/landing/landingContent'

withDefaults(defineProps<{ align?: 'start' | 'center' }>(), { align: 'start' })

const { t, locale } = useI18n()
const badgeSrc = computed(() => appStoreBadgeSrc(locale.value))
</script>

<style scoped>
.dl {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
.dl--center {
  justify-items: center;
}

/* Teléfono: la insignia encendida a su tamaño oficial y la apagada debajo,
   más baja. Lado a lado no caben con texto legible en 390 px. */
.dl__stores {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.625rem;
}
.dl--center .dl__stores {
  align-items: center;
}

.dl__appstore,
.dl__play {
  width: 15.375rem;
  border-radius: 0.875rem;
}

/* ── Insignia oficial de Apple (246 × 82) ─────────────────────────────── */
.dl__appstore {
  display: inline-block;
  height: 5.125rem;
  transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
}
.dl__appstore img {
  display: block;
  width: 100%;
  height: 100%;
  vertical-align: middle;
  object-fit: contain;
}
.dl__appstore:hover {
  transform: translateY(-2px);
}
.dl__appstore:active {
  transform: translateY(0) scale(0.985);
}
.dl__appstore:focus-visible {
  outline: 2px solid var(--lp-lime);
  outline-offset: 4px;
}

/* ── Celda apagada de Google Play ─────────────────────────────────────── */
.dl__play {
  --icon-gap: var(--lp-ground);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 3.5rem;
  margin: 0;
  padding: 0 0.875rem;
  background: var(--lp-ground);
  border: 1px solid var(--lp-line-strong);
  color: var(--lp-ink-4);
  cursor: default;
  user-select: none;
}
.dl__play-logo {
  font-size: 1.6rem;
}
.dl__play-text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
  text-align: left;
}
.dl__play-kick {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.dl__play-name {
  margin-top: 0.15em;
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* ── QR ───────────────────────────────────────────────────────────────── */
.dl__qr {
  display: none;
  margin: 0;
}
.dl__qr-paper {
  display: block;
  width: 7.5rem;
  padding: 0.375rem;
  border-radius: 0.875rem;
  background: #fff;
}
.dl__qr-paper img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
.dl__qr figcaption {
  margin-top: 0.625rem;
  max-width: 8.5rem;
  font-size: 0.75rem;
  line-height: 1.35;
  font-weight: 600;
  color: var(--lp-ink-3);
}

/* ── Ruta web ─────────────────────────────────────────────────────────── */
.dl__web {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  justify-self: start;
  padding: 0.25rem 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--lp-ink-2);
  text-decoration: underline;
  text-decoration-color: var(--lp-line-strong);
  text-decoration-thickness: 1.5px;
  text-underline-offset: 0.3em;
  transition:
    color 160ms ease,
    text-decoration-color 160ms ease;
}
.dl--center .dl__web {
  justify-self: center;
}
.dl__web:hover {
  color: var(--lp-ink);
  text-decoration-color: var(--lp-lime);
}
.dl__web:focus-visible {
  outline: 2px solid var(--lp-lime);
  outline-offset: 4px;
  border-radius: 0.25rem;
}
.dl__web-arrow {
  font-size: 1.05rem;
  color: var(--lp-lime);
  transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
}
.dl__web:hover .dl__web-arrow {
  transform: translateX(3px);
}

/* ── Tableta: las dos insignias lado a lado, iguales ──────────────────── */
@media (min-width: 640px) {
  .dl__stores {
    flex-direction: row;
    gap: 0.75rem;
  }
  .dl__play {
    height: 5.125rem;
    gap: 0.625rem;
  }
  .dl__play-logo {
    font-size: 2rem;
  }
  .dl__play-kick {
    font-size: 0.6875rem;
  }
  .dl__play-name {
    font-size: 1.375rem;
  }
}

/* ── Con ratón: el QR junto a las insignias ────────────────────────────
   Va por tipo de puntero y no por ancho: una ventana angosta de escritorio
   también lo necesita, y un iPad horizontal no. */
@media (min-width: 768px) {
  .dl {
    grid-template-columns: auto auto;
    column-gap: 1.25rem;
    row-gap: 1.125rem;
    align-items: start;
    justify-content: start;
  }
  .dl--center {
    justify-content: center;
  }
  .dl__web,
  .dl--center .dl__web {
    grid-column: 1 / -1;
  }
}
/* Con QR, las insignias se apilan para que quede junto a la de Apple y no
   junto a la celda apagada de Google Play. */
@media (min-width: 768px) and (hover: hover) and (pointer: fine) {
  .dl__qr {
    display: block;
  }
  .dl__stores {
    flex-direction: column;
  }
}

/* ── Escritorio: insignias apiladas ───────────────────────────────────── */
@media (min-width: 1024px) {
  .dl__stores {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dl__appstore,
  .dl__web-arrow {
    transition: none;
  }
  .dl__appstore:hover,
  .dl__web:hover .dl__web-arrow {
    transform: none;
  }
}
</style>
