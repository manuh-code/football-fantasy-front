import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFantasyLeagueDetailStore } from '@/store/fantasy/useFantasyLeagueDetailStore'
import type { BottomNavItem } from '@/components/ui/BottomNavBar.vue'

/**
 * Navegación de las pantallas de liga fantasy — detalle, búsqueda de jugadores
 * y mi equipo. Mantiene idénticos los destinos, el control de permisos y el
 * salto entre pantallas en las tres.
 *
 * Los destinos se reparten en dos grupos porque no todos pesan lo mismo:
 *
 * - `primaryTabs`  — lo que se consulta durante la jornada. Va en la tira, con
 *                    tope de 5 (`bottom-nav-limit` de Material Design). Todos
 *                    llevan el mismo acento: el resaltado ya lo hace el chip
 *                    deslizante, así que un color por pestaña solo era ruido.
 * - `overflowItems` — lo que se mira de vez en cuando o una sola vez. Vive tras
 *                    el botón "Más", en una hoja inferior.
 *
 * "Mis ligas" ya no es una pestaña: salir de la liga es subir de nivel, no
 * moverse entre paneles, y mezclarlo con el resto era lo que hacía que la tira
 * costara de leer (regla `nav-hierarchy`). Ahora es la flecha atrás de la
 * cabecera — ver `goToLeagues`.
 */
export function useFantasyLeagueTabs(getLeagueUuid: () => string) {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const leagueDetailStore = useFantasyLeagueDetailStore()

  const canAccessMemberTabs = computed(
    () => leagueDetailStore.isMember || leagueDetailStore.isAdmin,
  )

  const primaryTabs = computed<BottomNavItem[]>(() => {
    const list: BottomNavItem[] = [
      {
        key: 'overview',
        label: t('fantasy.detailTabs.overview'),
        icon: 'hi-solid-information-circle',
        accent: 'emerald',
      },
    ]

    // Orden por frecuencia de uso de un manager activo: primero lo que se toca
    // cada semana (alinear, ver el duelo), después lo que se consulta.
    if (canAccessMemberTabs.value) {
      list.push(
        {
          key: 'myteam',
          label: t('fantasy.detailTabs.team'),
          icon: 'hi-solid-user-group',
          accent: 'emerald',
          disabled: leagueDetailStore.isDraftNotStarted,
        },
        {
          key: 'matches',
          label: t('fantasy.detailTabs.matches'),
          icon: 'gi-crossed-swords',
          accent: 'emerald',
        },
      )
    }

    list.push({
      key: 'standings',
      label: t('fantasy.detailTabs.standings'),
      icon: 'hi-solid-table',
      accent: 'emerald',
    })

    if (canAccessMemberTabs.value) {
      list.push({
        key: 'players',
        label: t('fantasy.detailTabs.players'),
        icon: 'hi-solid-user-add',
        accent: 'emerald',
      })
    }

    return list
  })

  const overflowItems = computed<BottomNavItem[]>(() => {
    const list: BottomNavItem[] = []

    if (canAccessMemberTabs.value) {
      list.push({
        key: 'trades',
        label: t('fantasy.detailTabs.trades'),
        icon: 'hi-solid-switch-horizontal',
        accent: 'emerald',
      })
    }

    // Solo las ligas que juegan cuadro tienen la pestaña — en modo tabla solo
    // mostraría un "esta liga no tiene eliminatorias".
    if (leagueDetailStore.playsPlayoffs) {
      list.push({
        key: 'playoffs',
        label: t('fantasy.detailTabs.playoffs'),
        icon: 'bi-trophy-fill',
        accent: 'emerald',
      })
    }

    list.push({
      key: 'rules',
      label: t('fantasy.detailTabs.rules'),
      icon: 'hi-solid-clipboard-list',
      accent: 'emerald',
    })

    // Configuración de la liga: se toca una vez antes de que arranque el draft,
    // así que nunca debió competir por sitio con lo de cada jornada.
    if (leagueDetailStore.isAdmin) {
      list.push({
        key: 'management',
        label: t('fantasy.detailTabs.management'),
        icon: 'hi-solid-adjustments',
        accent: 'emerald',
      })
    }

    return list
  })

  /** Nombre de la liga para la cabecera; vacío mientras no haya cargado. */
  const leagueName = computed(() => leagueDetailStore.currentLeague?.name ?? '')

  const goToLeagues = () => {
    router.push({ name: 'userFantasyLeague' })
  }

  const onTabSelect = (key: string) => {
    if (key === 'players') {
      if (route.name !== 'searchPlayerFantasy') {
        router.push({ name: 'searchPlayerFantasy', params: { uuid: getLeagueUuid() } })
      }
      return
    }
    // Las pestañas de contenido viven en la query de la vista de detalle, así
    // que sobreviven a una recarga y se pueden compartir. Desde cualquier otra
    // pantalla se vuelve al detalle en esa pestaña.
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

  return { primaryTabs, overflowItems, leagueName, goToLeagues, onTabSelect }
}
