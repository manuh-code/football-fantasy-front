<template>
  <article v-if="meta" class="guide bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    <!-- ───────────────────────── Header ───────────────────────── -->
    <header class="relative isolate overflow-hidden">
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50/70 via-white to-white dark:from-primary-900/20 dark:via-gray-900 dark:to-gray-900"
        aria-hidden="true"
      />
      <div class="container mx-auto max-w-3xl px-4 pt-8 pb-8 md:pt-12 md:pb-10">
        <router-link
          :to="{ name: 'guides' }"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <v-icon name="hi-solid-arrow-left" class="w-4 h-4" />
          {{ t('guides.nav.back') }}
        </router-link>

        <div class="mt-6 flex items-center gap-4">
          <div
            class="grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-soft shrink-0"
          >
            <v-icon :name="meta.icon" class="w-7 h-7" />
          </div>
          <p class="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            {{ t('guides.hub.badge') }} · {{ meta.minRead }} {{ t('guides.hub.minRead') }}
          </p>
        </div>

        <h1 class="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1]">
          {{ t(`guides.items.${meta.key}.title`) }}
        </h1>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {{ t(`guides.items.${meta.key}.intro`) }}
        </p>
      </div>
    </header>

    <!-- ───────────────────────── Body ───────────────────────── -->
    <div class="container mx-auto max-w-3xl px-4 pb-4">
      <section
        v-for="(section, i) in sections"
        :key="i"
        class="py-7 border-t border-gray-100 dark:border-gray-800 first:border-t-0"
      >
        <span class="block w-6 h-1 rounded-full bg-primary-500/80" aria-hidden="true" />
        <h2 class="mt-3 text-xl md:text-2xl font-bold tracking-tight">
          {{ rt(section.h) }}
        </h2>
        <p v-if="section.p" class="mt-3 text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          {{ rt(section.p) }}
        </p>

        <!-- Rule / term list -->
        <ul v-if="section.list" class="mt-4 space-y-2.5">
          <li
            v-for="(item, j) in asItems(section.list)"
            :key="j"
            class="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 px-4 py-3 ring-1 ring-gray-100 dark:ring-gray-700/50"
          >
            <span
              class="mt-1 grid place-items-center w-5 h-5 rounded-md bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 shrink-0"
              aria-hidden="true"
            >
              <v-icon name="hi-solid-check" class="w-3 h-3" />
            </span>
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              <strong class="font-bold text-gray-900 dark:text-white">{{ rt(item.t) }}</strong>
              <span aria-hidden="true"> — </span>{{ rt(item.d) }}
            </p>
          </li>
        </ul>

        <!-- Highlighted note -->
        <aside
          v-if="section.note"
          class="mt-4 flex items-start gap-3 rounded-xl border-l-4 border-primary-500 bg-primary-50/70 dark:bg-primary-900/20 px-4 py-3"
        >
          <v-icon name="hi-solid-light-bulb" class="w-5 h-5 shrink-0 text-primary-600 dark:text-primary-400 mt-0.5" />
          <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
            {{ rt(section.note) }}
          </p>
        </aside>
      </section>
    </div>

    <!-- ───────────────────────── CTA ───────────────────────── -->
    <section class="container mx-auto max-w-3xl px-4 py-8">
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-10 text-center text-white shadow-strong"
      >
        <span
          class="pointer-events-none absolute -top-16 -right-10 w-52 h-52 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <h2 class="relative text-2xl font-extrabold tracking-tight">
          {{ t('guides.nav.ctaTitle') }}
        </h2>
        <p class="relative mx-auto mt-2 max-w-md text-white/90">
          {{ t('guides.nav.ctaText') }}
        </p>
        <router-link
          :to="{ name: 'register' }"
          class="relative mt-6 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold bg-white text-primary-700 hover:bg-gray-50 shadow-medium hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <v-icon name="hi-solid-user-add" class="w-5 h-5" />
          {{ t('guides.nav.ctaButton') }}
        </router-link>
      </div>
    </section>

    <!-- ───────────────────────── Related guides ───────────────────────── -->
    <section class="container mx-auto max-w-5xl px-4 pb-16">
      <h2 class="text-lg font-bold tracking-tight">
        {{ t('guides.nav.related') }}
      </h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <router-link
          v-for="other in related"
          :key="other.key"
          :to="{ name: 'guideDetail', params: { slug: other.slug } }"
          class="group flex items-start gap-3 rounded-xl bg-white dark:bg-gray-800 p-4 ring-1 ring-gray-200/70 dark:ring-gray-700/60 hover:shadow-soft transition-shadow"
        >
          <span
            class="shrink-0 grid place-items-center w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-1 ring-primary-200/70 dark:ring-primary-700/40"
          >
            <v-icon :name="other.icon" class="w-4 h-4" />
          </span>
          <span class="text-sm font-semibold leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {{ t(`guides.items.${other.key}.title`) }}
          </span>
        </router-link>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { GUIDES, getGuideBySlug } from './guides'

const route = useRoute()
const router = useRouter()
const { t, tm, rt } = useI18n()

const meta = computed(() => getGuideBySlug(route.params.slug as string))

// Base i18n path for the active guide, e.g. `guides.items.fantasy`.
const base = computed(() => (meta.value ? `guides.items.${meta.value.key}` : ''))

// Unknown slug → 404 so we never render an empty shell (bad for users and ads).
watchEffect(() => {
  if (!meta.value) router.replace({ name: 'not-found' })
})

// Section list comes from i18n. Each section is `{ h, p?, list?, note? }`,
// where `list` is an array of `{ t, d }` term/description rules. `tm` returns
// the raw messages for the active locale (and is itself reactive to locale
// changes); `rt` resolves each leaf to a plain string.
const sections = computed<Array<Record<string, unknown>>>(() => {
  if (!base.value) return []
  return tm(`${base.value}.sections`) as Array<Record<string, unknown>>
})

// Narrow a section's raw `list` message into iterable term/description items.
const asItems = (list: unknown) => list as Array<Record<string, unknown>>

const related = computed(() => GUIDES.filter((g) => g.key !== meta.value?.key))

// Per-guide SEO: keep <title> and meta description in sync with the guide so
// crawlers index each guide as its own content page.
watchEffect(() => {
  if (!base.value) return
  const guideTitle = t(`${base.value}.title`)
  document.title = `${guideTitle} — Fantasy MX`
  const desc = document.querySelector('meta[name="description"]')
  if (desc) desc.setAttribute('content', t(`${base.value}.excerpt`))
})
</script>
