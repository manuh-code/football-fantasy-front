<template>
  <div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    <!-- ───────────────────────── Hero ───────────────────────── -->
    <section class="relative isolate overflow-hidden">
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50/70 via-white to-white dark:from-amber-900/15 dark:via-gray-900 dark:to-gray-900"
        aria-hidden="true"
      />
      <div class="container mx-auto max-w-4xl px-4 pt-10 pb-12 md:pt-16 md:pb-14 text-center">
        <span
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200/70 dark:ring-amber-700/40 shadow-soft backdrop-blur"
        >
          <v-icon name="hi-solid-sparkles" class="w-3.5 h-3.5" />
          {{ $t('premium.landing.badge') }}
        </span>

        <h1 class="mt-6 text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
          {{ $t('premium.landing.heading') }}
        </h1>

        <p class="mx-auto mt-5 max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {{ $t('premium.landing.subheading') }}
        </p>

        <!-- Riel de ligas: la etiqueta dice de un vistazo cuál está abierta y
             cuál se paga, que es la pregunta que trae al visitante aquí. -->
        <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span
            v-for="league in leagues"
            :key="league.name"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 ring-1 ring-gray-200 dark:ring-gray-700 shadow-soft"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="league.premium ? 'bg-amber-500' : 'bg-primary-500'"
              aria-hidden="true"
            />
            {{ league.name }}
            <span
              class="font-semibold"
              :class="league.premium
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-primary-600 dark:text-primary-400'"
            >
              {{ league.premium ? $t('premium.landing.compare.premium') : $t('premium.landing.compare.free') }}
            </span>
          </span>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Planes ───────────────────────── -->
    <section id="planes" class="container mx-auto max-w-4xl px-4 pb-12 md:pb-16">
      <div class="text-center max-w-2xl mx-auto">
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight">
          {{ $t('premium.landing.plans.heading') }}
        </h2>
        <p class="mt-3 text-gray-600 dark:text-gray-300">
          {{ $t('premium.landing.plans.subheading') }}
        </p>
      </div>

      <!-- Cargando -->
      <div v-if="isLoading" class="mt-10 grid gap-5 sm:grid-cols-2" aria-busy="true">
        <div
          v-for="n in 2"
          :key="`plan-sk-${n}`"
          class="rounded-2xl p-6 ring-1 ring-gray-200 dark:ring-gray-700"
        >
          <div class="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div class="mt-4 h-9 w-32 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div class="mt-6 h-11 w-full rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      </div>

      <!-- Falló la carga: el visitante vino justo a ver el precio, así que la
           salida es reintentar y no un mensaje muerto. -->
      <div v-else-if="hasError" class="mt-10 text-center">
        <p class="text-gray-600 dark:text-gray-300">{{ $t('premium.landing.plans.error') }}</p>
        <button
          type="button"
          class="mt-4 min-h-[44px] px-6 rounded-full text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
          @click="loadPlans"
        >
          {{ $t('premium.landing.plans.retry') }}
        </button>
      </div>

      <div v-else class="mt-10 grid gap-5 sm:grid-cols-2">
        <article
          v-for="plan in plans"
          :key="plan.id"
          class="relative rounded-2xl p-6 bg-white dark:bg-gray-800 transition-shadow"
          :class="isBestValue(plan)
            ? 'ring-2 ring-amber-500 shadow-medium'
            : 'ring-1 ring-gray-200 dark:ring-gray-700'"
        >
          <span
            v-if="isBestValue(plan)"
            class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-sm"
          >
            {{ $t('premium.landing.plans.popular') }}
          </span>

          <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {{ intervalLabel(plan) }}
          </p>

          <p class="mt-2 flex items-baseline gap-1.5">
            <span class="text-4xl font-extrabold tracking-tight">{{ money(plan.amount, plan.currency) }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ plan.currency }}</span>
          </p>

          <p
            v-if="plan.amount_per_month !== null && plan.interval === 'year'"
            class="mt-1.5 text-sm text-gray-600 dark:text-gray-300"
          >
            {{ $t('premium.landing.plans.equivalent', { amount: money(plan.amount_per_month, plan.currency) }) }}
          </p>

          <p
            v-if="plan.savings_percent"
            class="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          >
            <v-icon name="hi-solid-badge-check" class="w-3.5 h-3.5" aria-hidden="true" />
            {{ $t('premium.landing.plans.save', { percent: plan.savings_percent }) }}
          </p>

          <button
            type="button"
            class="mt-6 w-full min-h-[48px] rounded-full text-base font-semibold transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
            :class="isBestValue(plan)
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-medium'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'"
            @click="goToCheckout"
          >
            {{ ctaLabel }}
          </button>
        </article>
      </div>

      <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {{ $t('premium.landing.plans.note') }}
      </p>

      <p class="mt-4 text-center">
        <router-link
          :to="{ name: 'home' }"
          class="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
        >
          {{ $t('premium.landing.ctaSecondary') }}
        </router-link>
      </p>
    </section>

    <!-- ───────────────────────── Qué incluye ───────────────────────── -->
    <section class="bg-gray-50 dark:bg-gray-800/40 border-y border-gray-100 dark:border-gray-800">
      <div class="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div class="text-center max-w-2xl mx-auto">
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">
            {{ $t('premium.landing.includes.heading') }}
          </h2>
          <p class="mt-3 text-gray-600 dark:text-gray-300">
            {{ $t('premium.landing.includes.subheading') }}
          </p>
        </div>

        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="item in includes"
            :key="item.key"
            class="rounded-2xl bg-white dark:bg-gray-800 p-5 ring-1 ring-gray-200/70 dark:ring-gray-700/60"
          >
            <div
              class="grid place-items-center w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/15"
            >
              <v-icon :name="item.icon" class="w-5 h-5" />
            </div>
            <h3 class="mt-4 font-bold">
              {{ $t(`premium.landing.includes.items.${item.key}.title`) }}
            </h3>
            <p class="mt-1.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ $t(`premium.landing.includes.items.${item.key}.detail`) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Comparativa ───────────────────────── -->
    <section class="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-center">
        {{ $t('premium.landing.compare.heading') }}
      </h2>

      <!-- La tabla scrollea dentro de su caja: en un móvil estrecho la página
           entera no debe irse de lado. -->
      <div class="mt-8 overflow-x-auto rounded-2xl ring-1 ring-gray-200 dark:ring-gray-700">
        <table class="w-full text-sm">
          <caption class="sr-only">{{ $t('premium.landing.compare.heading') }}</caption>
          <thead class="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <th scope="col" class="px-4 py-3 text-left font-semibold">&nbsp;</th>
              <th scope="col" class="px-4 py-3 text-center font-semibold w-24">
                {{ $t('premium.landing.compare.free') }}
              </th>
              <th scope="col" class="px-4 py-3 text-center font-semibold w-28 text-amber-700 dark:text-amber-400">
                {{ $t('premium.landing.compare.premium') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60">
            <tr v-for="(row, i) in compareRows" :key="i">
              <th scope="row" class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">
                {{ row.feature }}
              </th>
              <td class="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{{ row.free }}</td>
              <td class="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">{{ row.premium }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ───────────────────────── Dudas ───────────────────────── -->
    <section class="bg-gray-50 dark:bg-gray-800/40 border-y border-gray-100 dark:border-gray-800">
      <div class="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-center">
          {{ $t('premium.landing.faq.heading') }}
        </h2>

        <dl class="mt-8 space-y-4">
          <div
            v-for="(item, i) in faqItems"
            :key="i"
            class="rounded-2xl bg-white dark:bg-gray-800 p-5 ring-1 ring-gray-200/70 dark:ring-gray-700/60"
          >
            <dt class="font-bold">{{ item.q }}</dt>
            <dd class="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{{ item.a }}</dd>
          </div>
        </dl>

        <p class="mt-6 text-center text-sm">
          <router-link
            :to="{ name: 'guideDetail', params: { slug: 'preguntas-frecuentes' } }"
            class="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            {{ $t('guides.hub.title') }}
          </router-link>
        </p>
      </div>
    </section>

    <!-- ───────────────────────── CTA final ───────────────────────── -->
    <section class="container mx-auto max-w-4xl px-4 py-14">
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-12 md:py-14 text-center text-white shadow-strong"
      >
        <span
          class="pointer-events-none absolute -top-16 -right-10 w-52 h-52 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <h2 class="relative text-2xl md:text-3xl font-extrabold tracking-tight">
          {{ $t('premium.landing.heading') }}
        </h2>
        <p class="relative mx-auto mt-3 max-w-xl text-white/90">
          {{ $t('premium.landing.subheading') }}
        </p>
        <button
          type="button"
          class="relative mt-7 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold bg-white text-primary-700 hover:bg-gray-50 shadow-medium hover:-translate-y-0.5 active:translate-y-0 transition-all"
          @click="goToCheckout"
        >
          <v-icon name="hi-solid-sparkles" class="w-5 h-5" />
          {{ ctaLabel }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * Landing pública de Premium.
 *
 * Existe para captar la búsqueda que hoy no tiene dónde caer ("fantasy Premier
 * League en español", "quiniela LaLiga"): `/premium` es la pantalla de gestión y
 * pide sesión, así que un visitante que llega de Google no puede ni ver el
 * precio.
 *
 * Los precios NO se escriben aquí: se piden a `catalog/subscription/plans`, que
 * los saca de Stripe. Hornearlos en el bundle significaría que subir un precio
 * en el panel deja publicada una cifra falsa hasta el siguiente despliegue.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import subscriptionService from '@/services/user/billing/SubscriptionService'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { usePremiumStore } from '@/store/billing/usePremiumStore'
import type { SubscriptionPlanResponse } from '@/interfaces/user/billing/SubscriptionPlanResponse'

const router = useRouter()
const { t, tm, locale } = useI18n()

const plans = ref<SubscriptionPlanResponse[]>([])
const isLoading = ref(true)
const hasError = ref(false)

const leagues = [
  { name: 'Liga MX', premium: false },
  { name: 'Premier League', premium: true },
  { name: 'LaLiga', premium: true },
  { name: 'Serie A', premium: true },
  { name: 'Bundesliga', premium: true },
] as const

const includes = [
  { key: 'leagues', icon: 'hi-solid-globe-alt' },
  { key: 'scoring', icon: 'hi-solid-adjustments' },
  { key: 'capacity', icon: 'hi-solid-user-group' },
  { key: 'survivor', icon: 'hi-solid-fire' },
  { key: 'tools', icon: 'hi-solid-chart-bar' },
  { key: 'guests', icon: 'hi-solid-user-add' },
] as const

/**
 * `tm` y no `t`: son listas de objetos en el JSON, y `t` las devolvería como
 * cadena. Se copian a un tipo plano para que la plantilla no dependa de los
 * objetos de mensaje internos de vue-i18n.
 */
const compareRows = computed(() =>
  (tm('premium.landing.compare.rows') as unknown as Array<Record<string, string>>).map((row) => ({
    feature: String(row.feature),
    free: String(row.free),
    premium: String(row.premium),
  })),
)

const faqItems = computed(() =>
  (tm('premium.landing.faq.items') as unknown as Array<Record<string, string>>).map((item) => ({
    q: String(item.q),
    a: String(item.a),
  })),
)

/** El anual: es el que ahorra, y el que conviene destacar. */
const isBestValue = (plan: SubscriptionPlanResponse): boolean =>
  (plan.savings_percent ?? 0) > 0

const intervalLabel = (plan: SubscriptionPlanResponse): string =>
  plan.interval === 'year'
    ? t('premium.landing.plans.perYear')
    : t('premium.landing.plans.perMonth')

/**
 * El locale de la app es `es`/`en` a secas, y eso no basta para el dinero: `es`
 * genérico formatea MXN como "79 MXN" (y con símbolo, "79 $", pospuesto a la
 * europea). El precio está en pesos y lo lee sobre todo gente en México, así
 * que se fija la variante regional para que salga "$79", con el símbolo delante.
 */
const MONEY_LOCALE: Record<string, string> = { es: 'es-MX', en: 'en-US' }

const money = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat(MONEY_LOCALE[locale.value] ?? 'es-MX', {
      style: 'currency',
      currency,
      // Sin el código repetido: la tarjeta ya lo lleva al lado, y "79 MXN MXN"
      // es lo que salía con el formato por defecto.
      currencyDisplay: 'narrowSymbol',
      // Los precios redondos se leen mejor sin decimales; el equivalente
      // mensual del plan anual sí los necesita.
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `$${amount}`
  }
}

/**
 * Quien ya paga no debería leer "Empezar con Premium": para esa persona el
 * botón lleva a gestionar lo que ya tiene.
 */
const ctaLabel = computed(() =>
  usePremiumStore().isPremium
    ? t('premium.landing.manage')
    : t('premium.landing.ctaPrimary'),
)

/**
 * La compra vive en la pantalla autenticada. Sin sesión se pasa por el registro
 * conservando el destino, para que el usuario no acabe en la home tras crear la
 * cuenta y tenga que volver a buscar los planes.
 */
const goToCheckout = (): void => {
  const target = { name: 'subscription' }

  if (!useAuthStore().getToken()) {
    router.push({ name: 'register', query: { redirect: '/premium' } })

    return
  }

  router.push(target)
}

async function loadPlans(): Promise<void> {
  isLoading.value = true
  hasError.value = false

  try {
    plans.value = await subscriptionService.publicPlans()
  } catch (e) {
    console.error('No se pudieron cargar los planes públicos:', e)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(loadPlans)
</script>
