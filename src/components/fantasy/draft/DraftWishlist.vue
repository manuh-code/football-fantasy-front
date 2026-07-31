<template>
  <div class="w-full">
    <!-- ==================== Header ==================== -->
    <div class="flex items-center justify-between gap-3 mb-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <span
          class="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 shrink-0"
        >
          <v-icon name="bi-star-fill" class="w-4.5 h-4.5 text-amber-500 dark:text-amber-400" />
        </span>
        <div class="min-w-0">
          <h3 class="text-callout font-bold text-gray-900 dark:text-white leading-tight truncate">
            {{ $t('fantasy.draft.wishlist.title') }}
          </h3>
          <p class="text-2xs text-gray-500 dark:text-gray-400 leading-tight">
            {{ $t('fantasy.draft.wishlist.subtitle', { count: players.length }) }}
          </p>
        </div>
      </div>

      <button
        v-if="players.length"
        type="button"
        :aria-label="$t('fantasy.draft.wishlist.clearAria')"
        class="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-2xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors cursor-pointer"
        @click="clearAll"
      >
        <v-icon name="hi-solid-trash" class="w-3.5 h-3.5" />
        {{ $t('fantasy.draft.wishlist.clear') }}
      </button>
    </div>

    <!-- ==================== Turn hint ==================== -->
    <div
      v-if="players.length && !isMyTurn"
      class="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40"
    >
      <v-icon name="hi-solid-clock" class="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 animate-pulse" />
      <p class="text-2xs font-medium text-amber-700 dark:text-amber-300 leading-snug">
        {{ $t('fantasy.draft.wishlist.waitTurn') }}
      </p>
    </div>

    <!-- ==================== Empty state ==================== -->
    <div
      v-if="!players.length"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center"
    >
      <div
        class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center"
      >
        <v-icon name="bi-star" class="w-7 h-7 text-amber-400 dark:text-amber-500" />
      </div>
      <h4 class="text-footnote font-semibold text-gray-900 dark:text-white mb-1">
        {{ $t('fantasy.draft.wishlist.empty') }}
      </h4>
      <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
        {{ $t('fantasy.draft.wishlist.emptyBody') }}
      </p>
    </div>

    <!-- ==================== Player list ==================== -->
    <TransitionGroup
      v-else
      tag="div"
      name="wishlist-card"
      class="space-y-2"
    >
      <div
        v-for="(player, idx) in players"
        :key="player.player.uuid"
        class="relative flex items-center gap-3 pl-3 pr-2.5 py-2.5 rounded-2xl border-l-[3px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm"
        :class="getPositionRailClass(player.position.developer_name)"
      >
        <!-- Priority index -->
        <span
          class="absolute -top-1.5 -left-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-2xs font-bold tabular-nums shadow"
        >
          {{ idx + 1 }}
        </span>

        <!-- Avatar -->
        <img
          :src="player.player.image_path || '/img/default-avatar.svg'"
          :alt="player.player.display_name"
          class="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
        />

        <!-- Name + meta -->
        <div class="flex-1 min-w-0">
          <p class="text-footnote font-semibold text-gray-900 dark:text-white leading-snug line-clamp-1">
            {{ player.player.display_name }}
          </p>
          <div class="flex items-center gap-1.5 mt-1">
            <span
              class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-2xs font-bold shrink-0"
              :class="getPositionColorClass(player.position.developer_name)"
            >
              {{ positionShort(player.position.developer_name) }}
            </span>
            <img
              :src="player.team.image_path || '/img/default-team.svg'"
              :alt="player.team.name"
              class="w-3.5 h-3.5 object-contain shrink-0"
            />
            <span class="text-2xs text-gray-400 dark:text-gray-500 truncate">
              {{ player.team.short_code }}
            </span>
            <span class="text-2xs font-bold text-gray-700 dark:text-gray-300 tabular-nums ml-0.5">
              {{ formatNumber(player.average_points, 2) }}
              <span class="font-normal text-gray-400 dark:text-gray-500">{{ $t('fantasy.search.avgShort') }}</span>
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1.5 shrink-0">
          <!-- Remove from wishlist -->
          <button
            type="button"
            :aria-label="$t('fantasy.draft.wishlist.removeAria', { name: player.player.display_name })"
            class="flex items-center justify-center w-8 h-8 rounded-xl text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/60 active:bg-gray-200 dark:active:bg-gray-700 active:scale-90 transition-all cursor-pointer"
            @click="removeOne(player)"
          >
            <v-icon name="hi-solid-x" class="w-4 h-4" />
          </button>

          <!-- Draft / pick -->
          <button
            type="button"
            :disabled="!isMyTurn || isPicking(player.player.uuid)"
            :aria-label="$t('fantasy.draft.wishlist.draftAria', { name: player.player.display_name })"
            class="flex items-center justify-center gap-1 h-8 px-3 rounded-xl text-2xs font-bold text-white bg-emerald-500 dark:bg-emerald-600 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
            @click="draftPlayer(player)"
          >
            <v-icon
              v-if="isPicking(player.player.uuid)"
              name="pr-spinner"
              class="w-3.5 h-3.5"
              animation="spin"
            />
            <v-icon v-else name="hi-solid-plus" class="w-3.5 h-3.5" />
            <span>{{ $t('fantasy.draft.wishlist.draft') }}</span>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePositionShortCode } from '@/composables/usePositionShortCode'
import { useDraftPick } from '@/composables/useDraftPick'
import { useDraftWishlistStore } from '@/store/fantasy/useDraftWishlistStore'
import type { FantasyPlayerDraftResponse } from '@/interfaces/fantasy/draft/FantasyPlayerDraftResponse'

const props = withDefaults(
  defineProps<{
    fantasyLeagueUuid: string
    /** Only when it's the user's turn can a wishlisted player be drafted. */
    isMyTurn?: boolean
    /**
     * Cómo fichar desde la lista. El draft real usa el endpoint por defecto;
     * el mock draft inyecta el suyo para poder encadenar los picks de los bots.
     */
    pickHandler?: (player: FantasyPlayerDraftResponse) => Promise<void>
  }>(),
  { isMyTurn: false, pickHandler: undefined },
)

const positionShort = usePositionShortCode()
const wishlistStore = useDraftWishlistStore()
const { pickPlayer, isPicking } = useDraftPick(
  () => props.fantasyLeagueUuid,
  props.pickHandler,
)

const players = computed(() => wishlistStore.items(props.fantasyLeagueUuid))

function formatNumber(value: number | null | undefined, decimals = 2): string {
  return (Number(value) || 0).toFixed(decimals)
}

function getPositionColorClass(position: string): string {
  const colors: Record<string, string> = {
    GOALKEEPER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    DEFENDER: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    MIDFIELDER: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    ATTACKER: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  return colors[position] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
}

function getPositionRailClass(position: string): string {
  const rails: Record<string, string> = {
    GOALKEEPER: 'border-l-blue-400 dark:border-l-blue-500',
    DEFENDER: 'border-l-green-400 dark:border-l-green-500',
    MIDFIELDER: 'border-l-yellow-400 dark:border-l-yellow-500',
    ATTACKER: 'border-l-red-400 dark:border-l-red-500',
  }
  return rails[position] || 'border-l-gray-200 dark:border-l-gray-600'
}

function removeOne(player: FantasyPlayerDraftResponse) {
  wishlistStore.remove(props.fantasyLeagueUuid, player.player.uuid)
}

function clearAll() {
  wishlistStore.clear(props.fantasyLeagueUuid)
}

async function draftPlayer(player: FantasyPlayerDraftResponse) {
  if (!props.isMyTurn) return
  const ok = await pickPlayer(player)
  if (ok) {
    // Reflect the pick immediately; the realtime `player.selected` echo also
    // cleans the search list, board and drawer (same path as the search pick).
    wishlistStore.remove(props.fantasyLeagueUuid, player.player.uuid)
  }
}
</script>

<style scoped>
.wishlist-card-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.wishlist-card-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
}
.wishlist-card-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
.wishlist-card-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
.wishlist-card-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .wishlist-card-enter-active,
  .wishlist-card-leave-active,
  .wishlist-card-move {
    transition: none;
  }
}
</style>
