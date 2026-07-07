<template>
  <div class="about bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    <!-- ───────────────────────── Hero ───────────────────────── -->
    <section class="relative isolate overflow-hidden">
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50/70 via-white to-white dark:from-primary-900/20 dark:via-gray-900 dark:to-gray-900"
        aria-hidden="true"
      />
      <div class="container mx-auto max-w-4xl px-4 pt-10 pb-12 md:pt-16 md:pb-16 text-center">
        <span
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200/70 dark:ring-primary-700/40 shadow-soft backdrop-blur"
        >
          <v-icon name="hi-solid-sparkles" class="w-3.5 h-3.5" />
          {{ $t('ui.about.badge') }}
        </span>

        <h1 class="mt-6 text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
          {{ $t('ui.about.heading') }}
        </h1>

        <p class="mx-auto mt-5 max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {{ $t('ui.about.subtitle') }}
        </p>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <router-link
            :to="{ name: 'register' }"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-medium hover:shadow-strong hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <v-icon name="hi-solid-user-add" class="w-5 h-5" />
            {{ $t('ui.about.cta.primary') }}
          </router-link>
          <router-link
            :to="{ name: 'home' }"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {{ $t('ui.about.cta.secondary') }}
            <v-icon name="hi-solid-arrow-right" class="w-5 h-5" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Intro ───────────────────────── -->
    <section class="container mx-auto max-w-3xl px-4 py-10 md:py-14">
      <h2 class="text-2xl md:text-3xl font-bold tracking-tight">
        {{ $t('ui.about.intro.heading') }}
      </h2>
      <p class="mt-5 text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
        {{ $t('ui.about.intro.p1') }}
      </p>
      <p class="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
        {{ $t('ui.about.intro.p2') }}
      </p>
    </section>

    <!-- ───────────────────────── Game modes ───────────────────────── -->
    <section class="bg-gray-50 dark:bg-gray-800/40 border-y border-gray-100 dark:border-gray-800">
      <div class="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div class="text-center max-w-2xl mx-auto">
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">
            {{ $t('ui.about.modes.heading') }}
          </h2>
          <p class="mt-3 text-gray-600 dark:text-gray-300">
            {{ $t('ui.about.modes.subtitle') }}
          </p>
        </div>

        <div class="mt-10 grid gap-5 sm:grid-cols-2">
          <article
            v-for="mode in modes"
            :key="mode.key"
            class="group relative rounded-2xl bg-white dark:bg-gray-800 p-6 ring-1 ring-gray-200/70 dark:ring-gray-700/60 shadow-soft hover:shadow-medium transition-shadow"
          >
            <div
              class="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-soft"
            >
              <v-icon :name="mode.icon" class="w-6 h-6" />
            </div>
            <h3 class="mt-4 text-lg font-bold">
              {{ $t(`ui.about.modes.${mode.key}.title`) }}
            </h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ $t(`ui.about.modes.${mode.key}.desc`) }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── How it works ───────────────────────── -->
    <section class="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-center">
        {{ $t('ui.about.how.heading') }}
      </h2>

      <ol class="mt-10 grid gap-6 md:grid-cols-3">
        <li
          v-for="(step, i) in steps"
          :key="step.key"
          class="relative rounded-2xl bg-white dark:bg-gray-800 p-6 ring-1 ring-gray-200/70 dark:ring-gray-700/60"
        >
          <span
            class="grid place-items-center w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 font-bold ring-1 ring-primary-200/70 dark:ring-primary-700/40"
          >
            {{ i + 1 }}
          </span>
          <h3 class="mt-4 text-lg font-bold">
            {{ $t(`ui.about.how.${step.key}.title`) }}
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ $t(`ui.about.how.${step.key}.desc`) }}
          </p>
        </li>
      </ol>

      <div class="mt-8 text-center">
        <router-link
          :to="{ name: 'guides' }"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 ring-1 ring-primary-200/70 dark:ring-primary-700/40 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
        >
          <v-icon name="hi-solid-academic-cap" class="w-4 h-4" />
          {{ $t('ui.about.guidesLink') }}
          <v-icon name="hi-solid-arrow-right" class="w-4 h-4" />
        </router-link>
      </div>
    </section>

    <!-- ───────────────────────── Features ───────────────────────── -->
    <section class="bg-gray-50 dark:bg-gray-800/40 border-y border-gray-100 dark:border-gray-800">
      <div class="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-center">
          {{ $t('ui.about.features.heading') }}
        </h2>

        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="feature in features"
            :key="feature.key"
            class="text-center px-4"
          >
            <div
              class="mx-auto grid place-items-center w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/15"
            >
              <v-icon :name="feature.icon" class="w-6 h-6" />
            </div>
            <h3 class="mt-4 font-bold">
              {{ $t(`ui.about.features.${feature.key}.title`) }}
            </h3>
            <p class="mt-1.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ $t(`ui.about.features.${feature.key}.desc`) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Responsible play ───────────────────────── -->
    <section class="container mx-auto max-w-3xl px-4 py-12 md:py-14">
      <div class="rounded-2xl bg-white dark:bg-gray-800 p-6 md:p-8 ring-1 ring-gray-200/70 dark:ring-gray-700/60">
        <div class="flex items-start gap-4">
          <div
            class="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/15"
          >
            <v-icon name="hi-solid-shield-check" class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-bold">
              {{ $t('ui.about.responsible.heading') }}
            </h2>
            <p class="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ $t('ui.about.responsible.text') }}
            </p>
            <router-link
              :to="{ name: 'privacy' }"
              class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              <v-icon name="hi-solid-document-text" class="w-4 h-4" />
              {{ $t('ui.about.privacyLink') }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Final CTA ───────────────────────── -->
    <section class="container mx-auto max-w-4xl px-4 pb-16">
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-12 md:py-14 text-center text-white shadow-strong"
      >
        <span
          class="pointer-events-none absolute -top-16 -right-10 w-52 h-52 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <h2 class="relative text-2xl md:text-3xl font-extrabold tracking-tight">
          {{ $t('ui.about.cta.heading') }}
        </h2>
        <p class="relative mx-auto mt-3 max-w-xl text-white/90">
          {{ $t('ui.about.cta.text') }}
        </p>
        <router-link
          :to="{ name: 'register' }"
          class="relative mt-7 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold bg-white text-primary-700 hover:bg-gray-50 shadow-medium hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <v-icon name="hi-solid-user-add" class="w-5 h-5" />
          {{ $t('ui.about.cta.primary') }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// About page: original, publicly reachable content describing Fantasy MX and its
// game modes. Copy lives in i18n (ui.about.*) for es/en.

const modes = [
  { key: 'follow', icon: 'md-sportssoccer' },
  { key: 'fantasy', icon: 'bi-trophy-fill' },
  { key: 'pool', icon: 'hi-solid-clipboard-check' },
  { key: 'survivor', icon: 'hi-solid-fire' },
] as const

const steps = [
  { key: 'step1' },
  { key: 'step2' },
  { key: 'step3' },
] as const

const features = [
  { key: 'free', icon: 'hi-solid-sparkles' },
  { key: 'mobile', icon: 'hi-solid-phone' },
  { key: 'realtime', icon: 'hi-solid-lightning-bolt' },
  { key: 'friends', icon: 'hi-solid-users' },
] as const
</script>
