<template>
  <div class="guides bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    <!-- ───────────────────────── Hero ───────────────────────── -->
    <section class="relative isolate overflow-hidden">
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50/70 via-white to-white dark:from-primary-900/20 dark:via-gray-900 dark:to-gray-900"
        aria-hidden="true"
      />
      <div class="container mx-auto max-w-4xl px-4 pt-10 pb-10 md:pt-16 md:pb-12 text-center">
        <span
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200/70 dark:ring-primary-700/40 shadow-soft backdrop-blur"
        >
          <v-icon name="hi-solid-academic-cap" class="w-3.5 h-3.5" />
          {{ t('guides.hub.badge') }}
        </span>

        <h1 class="mt-6 text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
          {{ t('guides.hub.title') }}
        </h1>

        <p class="mx-auto mt-5 max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {{ t('guides.hub.subtitle') }}
        </p>
      </div>
    </section>

    <!-- ───────────────────────── Guide cards ───────────────────────── -->
    <section class="container mx-auto max-w-5xl px-4 pb-16">
      <div class="grid gap-5 sm:grid-cols-2">
        <router-link
          v-for="guide in GUIDES"
          :key="guide.key"
          :to="{ name: 'guideDetail', params: { slug: guide.slug } }"
          class="group relative flex flex-col rounded-2xl bg-white dark:bg-gray-800 p-6 ring-1 ring-gray-200/70 dark:ring-gray-700/60 shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all"
        >
          <div
            class="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-soft"
          >
            <v-icon :name="guide.icon" class="w-6 h-6" />
          </div>
          <h2 class="mt-4 text-lg font-bold">
            {{ t(`guides.items.${guide.key}.title`) }}
          </h2>
          <p class="mt-2 flex-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ t(`guides.items.${guide.key}.excerpt`) }}
          </p>
          <div class="mt-4 flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400">
              {{ t('guides.hub.read') }}
              <v-icon name="hi-solid-arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span class="text-xs text-gray-400">
              {{ guide.minRead }} {{ t('guides.hub.minRead') }}
            </span>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { GUIDES } from './guides'

const { t } = useI18n()
</script>
