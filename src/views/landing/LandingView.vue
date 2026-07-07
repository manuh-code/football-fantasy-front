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

          <!-- Community strip -->
          <div class="mt-7 flex items-center justify-center lg:justify-start gap-3">
            <div class="flex -space-x-2.5" aria-hidden="true">
              <span
                v-for="a in avatars"
                :key="a.abbr"
                class="grid place-items-center w-8 h-8 rounded-full bg-gradient-to-br text-white text-2xs font-bold ring-2 ring-white dark:ring-gray-900 shadow-soft"
                :class="[a.from, a.to]"
              >
                {{ a.abbr }}
              </span>
            </div>
            <div class="text-left">
              <div class="flex text-amber-400" aria-hidden="true">
                <v-icon v-for="s in 5" :key="s" name="bi-star-fill" class="w-3.5 h-3.5" />
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('landing.hero.social') }}</p>
            </div>
          </div>
        </div>

        <!-- Product mock -->
        <div class="relative mx-auto w-full max-w-sm lg:max-w-md" data-reveal style="--reveal-delay: 160ms" aria-hidden="true">
          <div class="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-primary-400/30 via-primary-300/20 to-transparent blur-3xl" />

          <div
            class="float-slow relative rounded-[2rem] border border-white/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-strong ring-1 ring-black/5 p-4 sm:p-5"
          >
            <!-- Mock header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-soft">
                  <v-icon name="md-sportssoccer" class="w-4 h-4" />
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

            <!-- Live match -->
            <div class="mt-4 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-4 text-white shadow-medium">
              <div class="flex items-center justify-between">
                <span class="grid place-items-center w-11 h-11 rounded-full bg-white/15 font-extrabold text-sm">GDL</span>
                <div class="text-center px-2">
                  <div class="text-2xl font-extrabold tracking-tight tabular-nums">2 · 1</div>
                  <div class="text-2xs text-primary-100/80 mt-0.5">{{ $t('landing.preview.min') }}</div>
                </div>
                <span class="grid place-items-center w-11 h-11 rounded-full bg-white/15 font-extrabold text-sm">CAZ</span>
              </div>
            </div>

            <!-- Standings -->
            <div class="mt-4">
              <div class="flex items-center justify-between px-1">
                <p class="text-2xs font-semibold uppercase tracking-wide text-gray-400">{{ $t('landing.preview.standings') }}</p>
                <p class="text-2xs font-semibold uppercase tracking-wide text-gray-400">{{ $t('landing.preview.points') }}</p>
              </div>
              <ul class="mt-2 space-y-1.5">
                <li
                  v-for="row in previewTable"
                  :key="row.pos"
                  class="flex items-center gap-3 rounded-xl px-2 py-1.5"
                  :class="row.pos === 1 ? 'bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-100 dark:ring-primary-800/40' : ''"
                >
                  <span class="w-4 text-center text-xs font-bold" :class="row.pos === 1 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'">
                    {{ row.pos }}
                  </span>
                  <span class="grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br text-white text-2xs font-bold shadow-soft shrink-0" :class="[row.from, row.to]">
                    {{ row.abbr.charAt(0) }}
                  </span>
                  <span class="h-2 rounded-full bg-gray-200 dark:bg-gray-700" :class="row.w" />
                  <span class="ml-auto text-sm font-bold tabular-nums">{{ row.pts }}</span>
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
            <span class="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br text-white shadow-soft shrink-0" :class="stat.accent">
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
            class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            :class="feature.gradient"
            aria-hidden="true"
          />
          <div
            class="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br text-white shadow-soft group-hover:scale-110 transition-transform duration-300"
            :class="feature.gradient"
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
        <div class="grid gap-10 md:grid-cols-4">
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

// Stat cards: gradient accent + icon; text comes from landing.stats.<key>.
const stats = [
  { key: "leagues", icon: "hi-solid-globe-alt", accent: "from-primary-500 to-emerald-400" },
  { key: "pools", icon: "bi-trophy-fill", accent: "from-amber-500 to-orange-400" },
  { key: "free", icon: "hi-solid-shield-check", accent: "from-blue-500 to-cyan-400" },
] as const;

// Feature cards: icon + gradient; text comes from landing.features.items.<key>.
const features = [
  { key: "live", icon: "md-sportssoccer", gradient: "from-primary-500 to-emerald-400" },
  { key: "pools", icon: "bi-trophy-fill", gradient: "from-blue-500 to-cyan-400" },
  { key: "fantasy", icon: "hi-solid-user-group", gradient: "from-amber-500 to-orange-400" },
  { key: "versus", icon: "md-comparearrows-round", gradient: "from-purple-500 to-fuchsia-400" },
  { key: "notifications", icon: "hi-solid-bell", gradient: "from-rose-500 to-red-400" },
  { key: "pwa", icon: "hi-solid-download", gradient: "from-emerald-500 to-teal-400" },
] as const;

// "How it works" steps: text comes from landing.how.steps.<key>.
const steps = [
  { key: "one", icon: "hi-solid-user-add" },
  { key: "two", icon: "md-sportssoccer" },
  { key: "three", icon: "hi-solid-share" },
] as const;

// Decorative avatar stack for the community strip (language-neutral initials).
const avatars = [
  { abbr: "JL", from: "from-primary-500", to: "to-emerald-400" },
  { abbr: "MR", from: "from-blue-500", to: "to-cyan-400" },
  { abbr: "AC", from: "from-amber-500", to: "to-orange-400" },
  { abbr: "SP", from: "from-purple-500", to: "to-fuchsia-400" },
] as const;

// Mini standings shown inside the hero product mock — purely decorative.
const previewTable = [
  { pos: 1, abbr: "MTY", from: "from-primary-500", to: "to-emerald-400", pts: 34, w: "w-2/3" },
  { pos: 2, abbr: "AME", from: "from-amber-500", to: "to-orange-400", pts: 31, w: "w-1/2" },
  { pos: 3, abbr: "CAZ", from: "from-blue-500", to: "to-cyan-400", pts: 29, w: "w-2/5" },
  { pos: 4, abbr: "TIG", from: "from-purple-500", to: "to-fuchsia-400", pts: 27, w: "w-1/3" },
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
:global(.dark) .hero-grid {
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
