<template>
  <div
    v-show="draftActive"
    class="space-y-4 transition-[margin] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
    :style="{ marginLeft: !isMobile ? `${drawerWidth}px` : undefined }"
  >
    <DraftOrderCarousel
      v-if="league?.draft?.draft_order?.length"
      :draft-order="league.draft.draft_order"
      :current-turn="currentTurn"
      :is-draft-complete="isDraftComplete"
      :is-my-turn="isMyTurn"
      :pick-time="currentTurn?.pick_timer ?? 0"
      :time-remaining="timeRemaining"
      :timer-expired="timerExpired"
      :timer-progress="timerProgress"
      :formatted-time="formattedTime"
      :timer-urgency="timerUrgency"
      :online-user-uuids="onlineUserUuids"
      :participants="league.participants ?? []"
    />

    <!-- <SearchPlayerFantasy
      ref="searchPlayerRef"
      v-if="league"
      :fantasy-league-uuid="fantasyLeagueUuid"
      mode="draft"
      :disabled="!isMyTurn"
    /> -->

    <!-- <DraftTeamDrawer
      v-model="showDrawer"
      :fantasy-league-uuid="fantasyLeagueUuid"
      :refresh-key="drawerRefreshKey"
      @width-change="(w: number) => drawerWidth = w"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useBreakpoints } from '@/composables/useMediaQuery'
import { useUserStore } from '@/store'
import { useDraft } from '@/composables/useDraft'
import DraftOrderCarousel from '@/components/fantasy/draft/DraftOrderCarousel.vue'
import DraftTeamDrawer from '@/components/fantasy/draft/DraftTeamDrawer.vue'
import SearchPlayerFantasy from '@/components/user/fantasy/SearchPlayerFantasy.vue'
import type { PlayerPickedPayload } from '@/composables/useDraftChannel'

const props = defineProps<{
  fantasyLeagueUuid: string
  draftActive?: boolean
}>()

const { isMobile } = useBreakpoints()
const userData = useUserStore().userData

const searchPlayerRef = ref<InstanceType<typeof SearchPlayerFantasy> | null>(null)
const showDrawer = ref(true)
const drawerRefreshKey = ref(0)
const drawerWidth = ref(360)

// ── Central draft composable ────────────────────────────────────
const {
  league,
  currentTurn,
  onlineUserUuids,
  isDraftComplete,
  isMyTurn,
  timeRemaining,
  timerExpired,
  timerProgress,
  formattedTime,
  timerUrgency,
  init,
  onDraftActivated,
} = useDraft(props.fantasyLeagueUuid, !!props.draftActive)

// ── Player picked callback (UI-specific) ────────────────────────
function handlePlayerPicked(payload: PlayerPickedPayload) {
  if (payload.player_uuid) {
    searchPlayerRef.value?.removePlayerByUuid(payload.player_uuid)
  }
  if (payload.picked_by_user_uuid === userData?.uuid) {
    drawerRefreshKey.value++
  }
}

// ── Lifecycle ───────────────────────────────────────────────────
onMounted(() => {
  init({ onPlayerPicked: handlePlayerPicked })
})

// When draftActive changes to true, reload league + turn
watch(() => props.draftActive, async (isActive, wasActive) => {
  if (isActive && !wasActive) {
    await onDraftActivated()
  }
})
</script>
