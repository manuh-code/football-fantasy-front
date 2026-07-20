import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFantasyLeagueDetailStore } from '@/store/fantasy/useFantasyLeagueDetailStore'
import type { BottomNavItem } from '@/components/ui/BottomNavBar.vue'

/**
 * Shared secondary tabs (TopTabsBar) for the fantasy-league screens — league
 * detail, player search and my team. Keeps the items, member/admin gating and
 * cross-screen navigation identical everywhere.
 *
 * "myLeagues" is a neutral shortcut (no accent → never highlighted) back to
 * the leagues list; member-only tabs are appended when allowed.
 */
export function useFantasyLeagueTabs(getLeagueUuid: () => string) {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const leagueDetailStore = useFantasyLeagueDetailStore()

  const canAccessMemberTabs = computed(
    () => leagueDetailStore.isMember || leagueDetailStore.isAdmin,
  )

  const tabItems = computed<BottomNavItem[]>(() => {
    const list: BottomNavItem[] = [
      { key: 'myLeagues', label: t('fantasy.detailTabs.myLeagues'), icon: 'hi-solid-collection' },
      { key: 'overview', label: t('fantasy.detailTabs.overview'), icon: 'hi-solid-information-circle', accent: 'blue' },
      { key: 'standings', label: t('fantasy.detailTabs.standings'), icon: 'bi-trophy-fill', accent: 'amber' },
    ]

    if (canAccessMemberTabs.value) {
      list.push(
        {
          key: 'myteam',
          label: t('fantasy.detailTabs.team'),
          icon: 'hi-solid-user-group',
          accent: 'emerald',
          disabled: leagueDetailStore.isDraftNotStarted,
        },
        { key: 'players', label: t('fantasy.detailTabs.players'), icon: 'hi-solid-user-add', accent: 'orange' },
        { key: 'matches', label: t('fantasy.detailTabs.matches'), icon: 'gi-crossed-swords', accent: 'red' },
        { key: 'trades', label: t('fantasy.detailTabs.trades'), icon: 'hi-solid-switch-horizontal', accent: 'purple' },
      )
    }

    return list
  })

  const onTabSelect = (key: string) => {
    if (key === 'myLeagues') {
      router.push({ name: 'userFantasyLeague' })
      return
    }
    if (key === 'players') {
      if (route.name !== 'searchPlayerFantasy') {
        router.push({ name: 'searchPlayerFantasy', params: { uuid: getLeagueUuid() } })
      }
      return
    }
    // Content tabs (overview / myteam / matches) live in the detail view's
    // query so they survive refresh / can be shared. From any other screen,
    // jump back to the detail view on that tab.
    if (route.name === 'fantasyLeagueDetail') {
      router.replace({ query: { ...route.query, tab: key } })
    } else {
      router.push({
        name: 'fantasyLeagueDetail',
        params: { uuid: getLeagueUuid() },
        query: { tab: key },
      })
    }
  }

  return { tabItems, onTabSelect }
}
