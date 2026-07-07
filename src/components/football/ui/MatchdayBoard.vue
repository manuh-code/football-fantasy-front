<script setup lang="ts">
/**
 * MatchdayBoard — the quiet shell of the Home experience.
 *
 * Every content panel (standings, fixtures, stats, versus, TOTW) is framed as a
 * "board": a calm card whose header carries a single emerald accent "tick", an
 * uppercase micro-eyebrow, an optional title, and a count/context chip on the
 * right — separated from the body by a hairline rule. The identity lives in the
 * restraint, the one accent (emerald, shared with the rest of the app), and the
 * tabular numerics used inside the body.
 */
interface Props {
  /** Micro-eyebrow label — short, rendered uppercase with wide tracking. */
  eyebrow: string;
  /** Optional title shown under the eyebrow (ink). */
  title?: string;
  /** Optional oi-icon name shown as a small neutral glyph before the eyebrow. */
  icon?: string;
  /** Optional short context string rendered as a chip on the right. */
  context?: string;
  /** Show a calm pulsing "now" indicator next to the eyebrow. */
  live?: boolean;
  /** Extra classes for the body wrapper (padding is flush by default). */
  bodyClass?: string;
}

withDefaults(defineProps<Props>(), {
  title: "",
  icon: "",
  context: "",
  live: false,
  bodyClass: "",
});
</script>

<template>
  <section
    class="matchday-board relative rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/60 overflow-hidden"
    :aria-label="title || eyebrow"
  >
    <!-- ── Board header (the signature: accent tick + micro-eyebrow) ── -->
    <header class="flex items-center gap-2.5 px-4 pt-3.5 pb-3">
      <!-- Accent tick — a short jersey-stripe marker, not a full card rail -->
      <span
        class="self-center shrink-0 w-[3px] h-[22px] rounded-full bg-emerald-500 dark:bg-emerald-400"
        aria-hidden="true"
      />

      <!-- Neutral section glyph -->
      <v-icon
        v-if="icon"
        :name="icon"
        class="shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500"
      />

      <!-- Eyebrow + title -->
      <div class="min-w-0 flex flex-col justify-center gap-0.5">
        <span class="flex items-center gap-1.5 min-w-0">
          <span
            v-if="live"
            class="relative flex h-1.5 w-1.5 shrink-0"
            aria-hidden="true"
          >
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span
            class="text-[10px] font-bold uppercase tracking-[0.15em] leading-none text-gray-500 dark:text-gray-400 truncate"
          >
            {{ eyebrow }}
          </span>
        </span>
        <span
          v-if="title"
          class="text-callout font-bold leading-none tracking-tight text-gray-900 dark:text-white truncate"
        >
          {{ title }}
        </span>
      </div>

      <div class="flex-1" />

      <!-- Context: named slot wins, otherwise the string chip -->
      <div class="shrink-0">
        <slot name="context">
          <span
            v-if="context"
            class="inline-flex items-center h-6 px-2.5 rounded-full bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 text-[11px] font-semibold tracking-wide tabular-nums"
          >
            {{ context }}
          </span>
        </slot>
      </div>
    </header>

    <!-- Hairline separating header from body -->
    <div class="h-px mx-4 bg-gray-100 dark:bg-white/[0.06]" aria-hidden="true" />

    <!-- ── Data body ── -->
    <div :class="bodyClass">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.matchday-board {
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 26px -18px rgba(15, 23, 42, 0.22);
}

@media (prefers-reduced-motion: reduce) {
  .animate-ping {
    animation: none;
  }
}
</style>
