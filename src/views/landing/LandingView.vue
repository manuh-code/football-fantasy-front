<template>
  <div class="landing min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-x-clip">
    <!-- ───────────────────────── Top nav ───────────────────────── -->
    <header
      class="sticky top-0 z-40 border-b border-gray-100/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
    >
      <nav class="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <a href="#top" class="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span class="grid place-items-center w-9 h-9 rounded-xl bg-primary-500 text-white shadow-soft">
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
            class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white shadow-soft transition-colors"
          >
            {{ $t('landing.nav.signup') }}
          </router-link>
        </div>
      </nav>
    </header>

    <!-- ───────────────────────── Hero ───────────────────────── -->
    <section id="top" class="relative isolate overflow-hidden">
      <!-- Decorative gradient backdrop -->
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50 via-white to-white dark:from-primary-900/30 dark:via-gray-900 dark:to-gray-900"
      />
      <div
        class="absolute -top-24 -right-24 -z-10 w-96 h-96 rounded-full bg-primary-300/30 dark:bg-primary-500/10 blur-3xl"
      />

      <div class="container mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
        <span
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200/60 dark:ring-primary-700/40"
        >
          <v-icon name="hi-solid-sparkles" class="w-3.5 h-3.5" />
          {{ $t('landing.hero.badge') }}
        </span>

        <h1 class="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
          {{ $t('landing.hero.titleLine1') }}<br />
          <span class="text-primary-500">{{ $t('landing.hero.titleLine2') }}</span>
        </h1>

        <p class="mx-auto mt-5 max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {{ $t('landing.hero.subtitle') }}
        </p>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <router-link
            :to="{ name: 'register' }"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold bg-primary-500 hover:bg-primary-600 text-white shadow-medium hover:shadow-strong transition-all"
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

        <!-- Stats strip -->
        <div class="mx-auto mt-14 grid max-w-3xl grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            v-for="stat in stats"
            :key="stat.key"
            class="rounded-2xl bg-white/70 dark:bg-gray-800/60 ring-1 ring-gray-100 dark:ring-gray-700/60 px-5 py-5 shadow-soft"
          >
            <div class="text-xl md:text-2xl font-extrabold text-primary-500">
              {{ $t(`landing.stats.${stat.key}.value`) }}
            </div>
            <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ $t(`landing.stats.${stat.key}.label`) }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Features ───────────────────────── -->
    <section id="features" class="container mx-auto max-w-6xl px-4 py-20 md:py-28 scroll-mt-20">
      <div class="text-center max-w-2xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight">{{ $t('landing.features.title') }}</h2>
        <p class="mt-4 text-gray-600 dark:text-gray-300">{{ $t('landing.features.subtitle') }}</p>
      </div>

      <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="feature in features"
          :key="feature.key"
          class="group rounded-2xl bg-white dark:bg-gray-800 p-6 ring-1 ring-gray-100 dark:ring-gray-700/60 shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all"
        >
          <div
            class="grid place-items-center w-12 h-12 rounded-xl text-white shadow-soft"
            :class="feature.accent"
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
    <section id="how" class="bg-gray-50 dark:bg-gray-800/40 scroll-mt-20">
      <div class="container mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div class="text-center max-w-2xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight">{{ $t('landing.how.title') }}</h2>
          <p class="mt-4 text-gray-600 dark:text-gray-300">{{ $t('landing.how.subtitle') }}</p>
        </div>

        <ol class="mt-14 grid gap-6 md:grid-cols-3">
          <li
            v-for="(step, index) in steps"
            :key="step.key"
            class="relative rounded-2xl bg-white dark:bg-gray-800 p-7 ring-1 ring-gray-100 dark:ring-gray-700/60 shadow-soft"
          >
            <div class="flex items-center gap-3">
              <span
                class="grid place-items-center w-10 h-10 rounded-full bg-primary-500 text-white font-bold shadow-soft"
              >
                {{ index + 1 }}
              </span>
              <v-icon :name="step.icon" class="w-6 h-6 text-primary-500" />
            </div>
            <h3 class="mt-5 text-lg font-bold">{{ $t(`landing.how.steps.${step.key}.title`) }}</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ $t(`landing.how.steps.${step.key}.body`) }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- ───────────────────────── Final CTA ───────────────────────── -->
    <section class="container mx-auto max-w-6xl px-4 py-20 md:py-28">
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-14 md:py-20 text-center text-white shadow-strong"
      >
        <div class="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div class="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-black/10 blur-3xl" />

        <h2 class="relative text-3xl md:text-4xl font-extrabold tracking-tight">{{ $t('landing.cta.title') }}</h2>
        <p class="relative mx-auto mt-4 max-w-xl text-primary-50/90">{{ $t('landing.cta.subtitle') }}</p>

        <div class="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <router-link
            :to="{ name: 'register' }"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold bg-white text-primary-700 hover:bg-primary-50 shadow-medium transition-colors"
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
              <span class="grid place-items-center w-9 h-9 rounded-xl bg-primary-500 text-white shadow-soft">
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
const currentYear = new Date().getFullYear();

// Marketing strip: keys map to landing.stats.<key>.{value,label} in i18n.
const stats = [
  { key: "leagues" },
  { key: "pools" },
  { key: "free" },
] as const;

// Feature cards: icon + accent background; text comes from landing.features.items.<key>.
const features = [
  { key: "live", icon: "md-sportssoccer", accent: "bg-primary-500" },
  { key: "pools", icon: "bi-trophy-fill", accent: "bg-blue-500" },
  { key: "fantasy", icon: "hi-solid-user-group", accent: "bg-amber-500" },
  { key: "versus", icon: "md-comparearrows-round", accent: "bg-purple-500" },
  { key: "notifications", icon: "hi-solid-bell", accent: "bg-red-500" },
  { key: "pwa", icon: "hi-solid-download", accent: "bg-emerald-500" },
] as const;

// "How it works" steps: text comes from landing.how.steps.<key>.
const steps = [
  { key: "one", icon: "hi-solid-user-add" },
  { key: "two", icon: "md-sportssoccer" },
  { key: "three", icon: "hi-solid-share" },
] as const;
</script>
