<template>
  <span
    :class="['inline-flex flex-shrink-0', sizeClass]"
    role="img"
    :aria-label="ariaLabel"
  >
    <svg viewBox="0 0 44 30" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <!-- Card face -->
      <rect x="0.5" y="0.5" width="43" height="29" rx="4.5" :fill="livery.field" />
      <!-- One diagonal sheen: the only decoration on the face -->
      <path d="M0 21 44 5V0H0Z" fill="#ffffff" fill-opacity="0.07" />

      <!-- EMV chip -->
      <rect x="5" y="7.5" width="7.5" height="6" rx="1.4" fill="#E3BE68" />
      <path d="M5 10.5h7.5M8.75 7.5v6" stroke="#A8842F" stroke-width="0.6" />

      <!-- Brand mark, bottom-right -->
      <g v-if="livery.mark === 'wordmark'">
        <text
          x="39"
          y="24.2"
          text-anchor="end"
          :font-size="livery.wordSize"
          font-weight="800"
          :font-style="livery.italic ? 'italic' : 'normal'"
          letter-spacing="-0.3"
          font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
          :fill="livery.ink"
        >{{ livery.word }}</text>
      </g>

      <!-- Mastercard: the interlocking discs, drawn to spec -->
      <g v-else-if="livery.mark === 'mastercard'">
        <clipPath :id="`${uid}-mc`"><circle cx="25.5" cy="19" r="5.5" /></clipPath>
        <circle cx="33.5" cy="19" r="5.5" fill="#F79E1B" />
        <circle cx="25.5" cy="19" r="5.5" fill="#EB001B" />
        <circle cx="33.5" cy="19" r="5.5" fill="#FF5F00" :clip-path="`url(#${uid}-mc)`" />
      </g>

      <!-- JCB: three stacked bars -->
      <g v-else-if="livery.mark === 'jcb'">
        <rect x="22" y="13" width="5.2" height="11" rx="1.4" fill="#0B4EA2" />
        <rect x="28.4" y="13" width="5.2" height="11" rx="1.4" fill="#BE0034" />
        <rect x="34.8" y="13" width="5.2" height="11" rx="1.4" fill="#00A05A" />
      </g>

      <!-- Diners Club: the split disc -->
      <g v-else-if="livery.mark === 'diners'">
        <circle cx="33" cy="19" r="5" fill="#ffffff" />
        <path d="M33 14a5 5 0 0 0 0 10z" fill="#0079BE" />
      </g>

      <!-- Discover: the orb -->
      <circle v-else-if="livery.mark === 'discover'" cx="34" cy="19" r="4.8" fill="#F27712" />

      <!-- UnionPay: three leaning panels -->
      <g v-else-if="livery.mark === 'unionpay'">
        <path d="M24.6 13h4l-2 11h-4z" fill="#E21836" />
        <path d="M29.8 13h4l-2 11h-4z" fill="#00447C" />
        <path d="M35 13h4l-2 11h-4z" fill="#007B84" />
      </g>

      <!-- Unknown brand: a magstripe stub rather than a fake logo -->
      <rect v-else x="24" y="17" width="15" height="4" rx="2" fill="#ffffff" fill-opacity="0.35" />

      <rect x="0.5" y="0.5" width="43" height="29" rx="4.5" fill="none" stroke="#000000" stroke-opacity="0.14" />
    </svg>
  </span>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    // Stripe's lowercase brand code (`visa`, `mastercard`, …) or null for the
    // types that have no card behind them.
    brand?: string | null
    // Stripe payment method type, used when there is no brand to key off.
    type?: string | null
    size?: 'sm' | 'md' | 'lg'
    label?: string
  }>(),
  { brand: null, type: null, size: 'md', label: '' },
)

// SVG ids live in the document, not the component, so every instance needs its
// own — a list of cards renders many of these at once.
const uid = useId()

interface Livery {
  field: string
  mark: 'wordmark' | 'mastercard' | 'jcb' | 'diners' | 'discover' | 'unionpay' | 'blank'
  word?: string
  wordSize?: number
  italic?: boolean
  ink?: string
}

const LIVERIES: Record<string, Livery> = {
  visa: { field: '#1A1F71', mark: 'wordmark', word: 'VISA', wordSize: 9, italic: true, ink: '#ffffff' },
  mastercard: { field: '#232323', mark: 'mastercard' },
  amex: { field: '#0077C8', mark: 'wordmark', word: 'AMEX', wordSize: 7.6, ink: '#ffffff' },
  discover: { field: '#232323', mark: 'discover' },
  diners: { field: '#0B5E92', mark: 'diners' },
  jcb: { field: '#1C1C1C', mark: 'jcb' },
  unionpay: { field: '#1C1C1C', mark: 'unionpay' },
  cartes_bancaires: { field: '#00437B', mark: 'wordmark', word: 'CB', wordSize: 9, ink: '#ffffff' },
  eftpos_au: { field: '#E4002B', mark: 'wordmark', word: 'EFTPOS', wordSize: 5.4, ink: '#ffffff' },
  link: { field: '#00D66F', mark: 'wordmark', word: 'link', wordSize: 9, ink: '#1A1A1A' },
}

const FALLBACK: Livery = { field: '#475569', mark: 'blank' }

const livery = computed<Livery>(() => {
  if (props.brand && LIVERIES[props.brand]) {
    return LIVERIES[props.brand]
  }
  if (props.type && LIVERIES[props.type]) {
    return LIVERIES[props.type]
  }
  return FALLBACK
})

const sizeClass = computed(
  () => ({ sm: 'w-9 h-[1.55rem]', md: 'w-11 h-[1.875rem]', lg: 'w-[3.75rem] h-[2.55rem]' })[props.size],
)

const ariaLabel = computed(() => props.label || props.brand || props.type || 'card')
</script>
