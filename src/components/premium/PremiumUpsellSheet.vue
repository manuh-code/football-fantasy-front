<template>
  <BottomSheet
    :is-visible="isUpsellOpen"
    :title="$t('premium.upsell.title')"
    :subtitle="reason"
    icon="hi-solid-sparkles"
    icon-variant="amber"
    size="md"
    role="dialog"
    autofocus
    :z-index="200"
    @close="closeUpsell"
  >
    <div class="pb-1">
      <ul class="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        <li
          v-for="benefit in benefits"
          :key="benefit.key"
          class="flex items-start gap-3 px-4 py-3"
        >
          <v-icon
            :name="benefit.icon"
            class="w-4 h-4 mt-0.5 shrink-0 text-amber-500"
          />
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t(`premium.upsell.benefits.${benefit.key}.title`) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ $t(`premium.upsell.benefits.${benefit.key}.detail`) }}
            </p>
          </div>
        </li>
      </ul>

      <p class="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
        {{ $t('premium.upsell.freeNote') }}
      </p>

      <div class="mt-4 flex flex-col gap-2">
        <ButtonComponent
          variant="primary"
          always-full-width
          :text="$t('premium.upsell.cta')"
          @click="goToPlans"
        />
        <ButtonComponent
          variant="ghost"
          always-full-width
          :text="$t('premium.upsell.dismiss')"
          @click="closeUpsell"
        />
      </div>
    </div>
  </BottomSheet>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { BottomSheet, ButtonComponent } from '@/components/ui'
import { usePremiumUpsell } from '@/composables/usePremiumUpsell'

/**
 * El muro de pago, montado una sola vez en App.vue.
 *
 * Se abre desde `requirePremium()` cuando el usuario toca algo con candado, y
 * también solo cuando el API contesta 402 — así un candado que el front no
 * hubiera previsto sigue acabando en una explicación y no en un error suelto.
 *
 * Enseña siempre los mismos beneficios y encima, como subtítulo, el motivo
 * concreto por el que se abrió: el usuario tiene que reconocer lo que acaba de
 * intentar, no leer un catálogo genérico.
 */
const { isUpsellOpen, upsellFeature, closeUpsell } = usePremiumUpsell()
const router = useRouter()
const { t, te } = useI18n()

/**
 * Motivo concreto. Las claves son los códigos del enum del API, con puntos, y
 * vue-i18n los resuelve como ruta anidada — que es justo como está escrito el
 * archivo de traducción. Si llegara un código que este cliente no conoce (una
 * versión del API más nueva que la app instalada) se cae al texto genérico.
 */
const reason = computed(() => {
  const feature = upsellFeature.value
  const key = feature ? `premium.features.${feature}` : ''

  return key && te(key) ? t(key) : t('premium.upsell.subtitle')
})

const benefits = [
  { key: 'leagues', icon: 'hi-solid-globe-alt' },
  { key: 'rules', icon: 'hi-solid-adjustments' },
  { key: 'tools', icon: 'hi-solid-chart-bar' },
]

const goToPlans = () => {
  closeUpsell()
  router.push({ name: 'subscription' })
}
</script>
