<template>
  <div class="landing relative min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-x-clip antialiased">
    <!-- ───────────────────────── Top nav ───────────────────────── -->
    <header
      class="sticky top-0 z-40 border-b border-gray-100/70 dark:border-gray-800/70 bg-white/75 dark:bg-gray-900/75 backdrop-blur-xl"
    >
      <nav class="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <a href="#top" class="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span class="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-soft">
            <v-icon name="md-sportssoccer" class="w-5 h-5" />
          </span>
          <span>{{ $t('landing.brand') }}</span>
        </a>

        <div class="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600 dark:text-gray-300">
          <a href="#features" class="hover:text-primary-500 transition-colors">{{ $t('landing.nav.features') }}</a>
          <a href="#how" class="hover:text-primary-500 transition-colors">{{ $t('landing.nav.how') }}</a>
        </div>

        <div class="flex items-center gap-2">
          <router-link
            :to="{ name: 'login' }"
            class="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {{ $t('landing.nav.login') }}
          </router-link>
          <router-link
            :to="{ name: 'register' }"
            class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-soft transition-all"
          >
            {{ $t('landing.nav.signup') }}
          </router-link>
        </div>
      </nav>
    </header>

    <!-- ───────────────────────── Hero ───────────────────────── -->
    <section id="top" class="relative isolate overflow-hidden">
      <!-- Decorative backdrop -->
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50/70 via-white to-white dark:from-primary-900/20 dark:via-gray-900 dark:to-gray-900"
        aria-hidden="true"
      />
      <div class="hero-grid absolute inset-0 -z-10" aria-hidden="true" />
      <div
        class="float-slow absolute -top-24 -right-16 -z-10 w-[26rem] h-[26rem] rounded-full bg-primary-300/30 dark:bg-primary-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="float-slower absolute top-40 -left-24 -z-10 w-80 h-80 rounded-full bg-emerald-300/20 dark:bg-emerald-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div class="container mx-auto max-w-6xl px-4 pt-14 pb-16 md:pt-20 md:pb-24 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <!-- Copy -->
        <div class="text-center lg:text-left" data-reveal>
          <span
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200/70 dark:ring-primary-700/40 shadow-soft backdrop-blur"
          >
            <v-icon name="hi-solid-sparkles" class="w-3.5 h-3.5" />
            {{ $t('landing.hero.badge') }}
          </span>

          <h1 class="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
            {{ $t('landing.hero.titleLine1') }}<br />
            <span class="bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-400 bg-clip-text text-transparent">
              {{ $t('landing.hero.titleLine2') }}
            </span>
          </h1>

          <p class="mx-auto lg:mx-0 mt-5 max-w-xl text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ $t('landing.hero.subtitle') }}
          </p>

          <div class="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <router-link
              :to="{ name: 'register' }"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-medium hover:shadow-strong hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <v-icon name="hi-solid-user-add" class="w-5 h-5" />
              {{ $t('landing.hero.ctaPrimary') }}
            </router-link>
            <router-link
              :to="{ name: 'home' }"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {{ $t('landing.hero.ctaSecondary') }}
              <v-icon name="hi-solid-arrow-right" class="w-5 h-5" />
            </router-link>
          </div>

          <p class="mt-4 text-xs text-gray-400 dark:text-gray-500">{{ $t('landing.hero.note') }}</p>

          <!-- League rail: the five competitions the app covers -->
          <div class="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span class="w-full lg:w-auto text-2xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 lg:mr-1">
              {{ $t('landing.hero.leaguesLabel') }}
            </span>
            <span
              v-for="league in leagues"
              :key="league"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 ring-1 ring-gray-200 dark:ring-gray-700 shadow-soft"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-primary-500" aria-hidden="true" />
              {{ league }}
            </span>
          </div>
        </div>

        <!-- Product mock: a live head-to-head fantasy matchup -->
        <div class="relative mx-auto w-full max-w-sm lg:max-w-md" data-reveal style="--reveal-delay: 160ms" aria-hidden="true">
          <div class="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-primary-400/30 via-primary-300/20 to-transparent blur-3xl" />

          <div
            class="float-slow relative rounded-[2rem] border border-white/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-strong ring-1 ring-black/5 p-4 sm:p-5"
          >
            <!-- Mock header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-soft">
                  <v-icon name="bi-trophy-fill" class="w-4 h-4" />
                </span>
                <div class="leading-tight">
                  <p class="text-sm font-bold">{{ $t('landing.preview.title') }}</p>
                  <p class="text-2xs text-gray-400">{{ $t('landing.preview.matchday') }}</p>
                </div>
              </div>
              <span class="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 text-rose-500 px-2.5 py-1 text-2xs font-bold">
                <span class="relative flex h-1.5 w-1.5">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                  <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                </span>
                {{ $t('landing.preview.live') }}
              </span>
            </div>

            <!-- Matchup scoreline -->
            <div class="mt-4 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-4 text-white shadow-medium">
              <div class="flex items-center justify-between gap-2">
                <div class="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                  <span class="grid place-items-center w-11 h-11 rounded-full bg-white/15 font-extrabold text-sm">
                    {{ matchup.home.abbr }}
                  </span>
                  <span class="text-2xs font-semibold text-primary-100/90 truncate max-w-full">{{ matchup.home.name }}</span>
                </div>
                <div class="text-center px-1 shrink-0">
                  <div class="text-2xl font-extrabold tracking-tight tabular-nums">
                    {{ matchup.home.pts }} · {{ matchup.away.pts }}
                  </div>
                  <div class="text-2xs font-bold tracking-[0.25em] text-primary-100/70 mt-0.5">
                    {{ $t('landing.preview.vs') }}
                  </div>
                </div>
                <div class="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                  <span class="grid place-items-center w-11 h-11 rounded-full bg-white/15 font-extrabold text-sm">
                    {{ matchup.away.abbr }}
                  </span>
                  <span class="text-2xs font-semibold text-primary-100/90 truncate max-w-full">{{ matchup.away.name }}</span>
                </div>
              </div>
            </div>

            <!-- Top starters feed -->
            <div class="mt-4">
              <p class="px-1 text-2xs font-semibold uppercase tracking-wide text-gray-400">
                {{ $t('landing.preview.starters') }}
              </p>
              <ul class="mt-2 space-y-1.5">
                <li
                  v-for="starter in previewStarters"
                  :key="starter.abbr"
                  class="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 px-2.5 py-1.5"
                >
                  <span class="grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-emerald-400 text-white text-2xs font-bold shrink-0">
                    {{ starter.abbr }}
                  </span>
                  <span class="text-xs font-semibold truncate">{{ starter.name }}</span>
                  <span class="ml-auto text-sm font-extrabold tabular-nums text-primary-600 dark:text-primary-400">
                    +{{ starter.pts }}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Floating chips -->
          <div class="float-slower absolute -left-3 sm:-left-6 top-24 rounded-2xl bg-white dark:bg-gray-800 shadow-strong ring-1 ring-black/5 dark:ring-white/10 px-3 py-2 flex items-center gap-2">
            <span class="grid place-items-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
              <v-icon name="bi-trophy-fill" class="w-4 h-4" />
            </span>
            <div class="leading-tight">
              <p class="text-xs font-extrabold tabular-nums">+12</p>
              <p class="text-2xs text-gray-400">pts</p>
            </div>
          </div>
          <div class="float-slow absolute -right-3 sm:-right-5 bottom-14 rounded-2xl bg-white dark:bg-gray-800 shadow-strong ring-1 ring-black/5 dark:ring-white/10 px-3 py-2 flex items-center gap-2">
            <span class="grid place-items-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-400 text-white">
              <v-icon name="hi-solid-chart-bar" class="w-4 h-4" />
            </span>
            <p class="text-sm font-extrabold tabular-nums">#1</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Stats strip ───────────────────────── -->
    <section class="border-y border-gray-100 dark:border-gray-800/80 bg-gray-50/60 dark:bg-gray-800/20">
      <div class="container mx-auto max-w-5xl px-4 py-10">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            v-for="(stat, i) in stats"
            :key="stat.key"
            class="flex items-center gap-4 rounded-2xl bg-white dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700/60 px-5 py-4 shadow-soft"
            data-reveal
            :style="{ '--reveal-delay': `${i * 90}ms` }"
          >
            <span
              class="grid place-items-center w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/15 shrink-0"
            >
              <v-icon :name="stat.icon" class="w-5 h-5" />
            </span>
            <div>
              <div class="text-lg md:text-xl font-extrabold leading-tight">
                {{ $t(`landing.stats.${stat.key}.value`) }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                {{ $t(`landing.stats.${stat.key}.label`) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Features ───────────────────────── -->
    <section id="features" class="container mx-auto max-w-6xl px-4 py-20 md:py-28 scroll-mt-20">
      <div class="text-center max-w-2xl mx-auto" data-reveal>
        <span class="text-xs font-bold uppercase tracking-widest text-primary-500">{{ $t('landing.nav.features') }}</span>
        <h2 class="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">{{ $t('landing.features.title') }}</h2>
        <p class="mt-4 text-gray-600 dark:text-gray-300">{{ $t('landing.features.subtitle') }}</p>
      </div>

      <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(feature, i) in features"
          :key="feature.key"
          class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 ring-1 ring-gray-100 dark:ring-gray-700/60 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300"
          data-reveal
          :style="{ '--reveal-delay': `${(i % 3) * 90}ms` }"
        >
          <span
            class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-hidden="true"
          />
          <div
            class="grid place-items-center w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/15 group-hover:scale-110 transition-transform duration-300"
          >
            <v-icon :name="feature.icon" class="w-6 h-6" />
          </div>
          <h3 class="mt-5 text-lg font-bold">{{ $t(`landing.features.items.${feature.key}.title`) }}</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ $t(`landing.features.items.${feature.key}.body`) }}
          </p>
        </article>
      </div>
    </section>

    <!-- ───────────────────────── How it works ───────────────────────── -->
    <section id="how" class="relative bg-gray-50 dark:bg-gray-800/40 scroll-mt-20">
      <div class="container mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div class="text-center max-w-2xl mx-auto" data-reveal>
          <span class="text-xs font-bold uppercase tracking-widest text-primary-500">{{ $t('landing.nav.how') }}</span>
          <h2 class="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">{{ $t('landing.how.title') }}</h2>
          <p class="mt-4 text-gray-600 dark:text-gray-300">{{ $t('landing.how.subtitle') }}</p>
        </div>

        <ol class="relative mt-20 grid gap-10 md:gap-6 md:grid-cols-3">
          <!-- Connector -->
          <div
            class="hidden md:block absolute top-0 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 dark:from-primary-800 dark:via-primary-600 dark:to-primary-800"
            aria-hidden="true"
          />

          <li v-for="(step, index) in steps" :key="step.key" class="relative" data-reveal :style="{ '--reveal-delay': `${index * 110}ms` }">
            <span
              class="absolute -top-6 left-1/2 -translate-x-1/2 z-10 grid place-items-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white text-lg font-extrabold shadow-medium ring-4 ring-gray-50 dark:ring-gray-900"
            >
              {{ index + 1 }}
            </span>
            <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-7 pt-10 pb-7 ring-1 ring-gray-100 dark:ring-gray-700/60 shadow-soft h-full">
              <span class="pointer-events-none absolute -right-3 -bottom-4 text-8xl font-black text-gray-100 dark:text-gray-700/40 select-none" aria-hidden="true">
                {{ index + 1 }}
              </span>
              <v-icon :name="step.icon" class="relative w-7 h-7 text-primary-500" />
              <h3 class="relative mt-4 text-lg font-bold">{{ $t(`landing.how.steps.${step.key}.title`) }}</h3>
              <p class="relative mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ $t(`landing.how.steps.${step.key}.body`) }}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- ───────────────────────── Final CTA ───────────────────────── -->
    <section class="container mx-auto max-w-6xl px-4 py-20 md:py-28">
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-14 md:py-20 text-center text-white shadow-strong"
        data-reveal
      >
        <div class="cta-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div class="float-slow absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div class="float-slower absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-black/10 blur-3xl" aria-hidden="true" />

        <h2 class="relative text-3xl md:text-4xl font-extrabold tracking-tight">{{ $t('landing.cta.title') }}</h2>
        <p class="relative mx-auto mt-4 max-w-xl text-primary-50/90">{{ $t('landing.cta.subtitle') }}</p>

        <div class="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <router-link
            :to="{ name: 'register' }"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold bg-white text-primary-700 hover:bg-primary-50 shadow-medium hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <v-icon name="bi-trophy-fill" class="w-5 h-5" />
            {{ $t('landing.cta.button') }}
          </router-link>
          <router-link
            :to="{ name: 'login' }"
            class="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full text-base font-semibold text-white ring-1 ring-white/40 hover:bg-white/10 transition-colors"
          >
            {{ $t('landing.cta.secondary') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Footer ───────────────────────── -->
    <footer class="border-t border-gray-100 dark:border-gray-800">
      <div class="container mx-auto max-w-6xl px-4 py-12">
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div class="md:col-span-1">
            <div class="flex items-center gap-2 font-bold text-lg">
              <span class="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-soft">
                <v-icon name="md-sportssoccer" class="w-5 h-5" />
              </span>
              <span>{{ $t('landing.brand') }}</span>
            </div>
            <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">{{ $t('landing.footer.tagline') }}</p>
          </div>

          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {{ $t('landing.footer.product') }}
            </h4>
            <ul class="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li><a href="#features" class="hover:text-primary-500 transition-colors">{{ $t('landing.footer.features') }}</a></li>
              <li><a href="#how" class="hover:text-primary-500 transition-colors">{{ $t('landing.footer.how') }}</a></li>
              <li>
                <router-link :to="{ name: 'home' }" class="hover:text-primary-500 transition-colors">
                  {{ $t('landing.footer.explore') }}
                </router-link>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {{ $t('landing.footer.resources') }}
            </h4>
            <ul class="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>
                <router-link :to="{ name: 'guides' }" class="hover:text-primary-500 transition-colors">
                  {{ $t('landing.footer.guides') }}
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'about' }" class="hover:text-primary-500 transition-colors">
                  {{ $t('landing.footer.about') }}
                </router-link>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {{ $t('landing.footer.account') }}
            </h4>
            <ul class="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>
                <router-link :to="{ name: 'login' }" class="hover:text-primary-500 transition-colors">
                  {{ $t('landing.footer.login') }}
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'register' }" class="hover:text-primary-500 transition-colors">
                  {{ $t('landing.footer.signup') }}
                </router-link>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {{ $t('landing.footer.legal') }}
            </h4>
            <ul class="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>
                <router-link :to="{ name: 'privacy' }" class="hover:text-primary-500 transition-colors">
                  {{ $t('landing.footer.privacy') }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
          © {{ currentYear }} {{ $t('landing.brand') }}. {{ $t('landing.footer.rights') }}
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";

const currentYear = new Date().getFullYear();

// The five competitions available in the app. Proper nouns, identical in every
// locale, so they live here instead of i18n.
const leagues = ["Liga MX", "Premier League", "LaLiga", "Serie A", "Bundesliga"] as const;

// Stat cards: icon per key; text comes from landing.stats.<key>.
const stats = [
  { key: "leagues", icon: "hi-solid-globe-alt" },
  { key: "modes", icon: "bi-trophy-fill" },
  { key: "free", icon: "hi-solid-shield-check" },
] as const;

// Feature cards: icon per key; text comes from landing.features.items.<key>.
const features = [
  { key: "live", icon: "md-sportssoccer" },
  { key: "fantasy", icon: "bi-trophy-fill" },
  { key: "pools", icon: "hi-solid-clipboard-check" },
  { key: "survivor", icon: "hi-solid-fire" },
  { key: "versus", icon: "md-comparearrows-round" },
  { key: "pwa", icon: "hi-solid-download" },
] as const;

// "How it works" steps: text comes from landing.how.steps.<key>.
const steps = [
  { key: "one", icon: "hi-solid-user-add" },
  { key: "two", icon: "hi-solid-globe-alt" },
  { key: "three", icon: "bi-trophy-fill" },
] as const;

// Decorative head-to-head matchup shown inside the hero mock. Invented,
// language-neutral team names; the panel is aria-hidden.
const matchup = {
  home: { abbr: "GAL", name: "Los Galácticos", pts: 68 },
  away: { abbr: "RBV", name: "Rayo Bravo FC", pts: 63 },
} as const;

const previewStarters = [
  { abbr: "JH", name: "J. Hernández", pts: 12 },
  { abbr: "CA", name: "C. Aguirre", pts: 8 },
  { abbr: "MT", name: "M. Torres", pts: 7 },
] as const;

// Reveal-on-scroll: elements marked with [data-reveal] fade/slide in once visible.
let observer: IntersectionObserver | null = null;

onMounted(() => {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => observer!.observe(el));
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
/* Subtle grid backdrop behind the hero, faded out toward the edges. */
.hero-grid {
  background-image:
    linear-gradient(to right, rgba(5, 150, 105, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(5, 150, 105, 0.06) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(ellipse 90% 65% at 50% 0%, #000 35%, transparent 78%);
  mask-image: radial-gradient(ellipse 90% 65% at 50% 0%, #000 35%, transparent 78%);
}
/* `.dark .foo` (not `:global(.dark)`) — the build drops scoped :global(.dark) rules. */
.dark .hero-grid {
  background-image:
    linear-gradient(to right, rgba(52, 211, 153, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(52, 211, 153, 0.06) 1px, transparent 1px);
}

/* Grid texture over the final CTA. */
.cta-grid {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 36px 36px;
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 75%);
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 75%);
}

/* Gentle floating for decorative blobs, the mock and chips. */
@keyframes floaty {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
}
@keyframes floaty-alt {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(12px); }
}
.float-slow {
  animation: floaty 6s ease-in-out infinite;
}
.float-slower {
  animation: floaty-alt 7.5s ease-in-out infinite;
}

/* Reveal on scroll. */
[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, transform;
}
[data-reveal].is-visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .float-slow,
  .float-slower {
    animation: none !important;
  }
}
</style>
