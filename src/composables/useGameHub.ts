import { computed, ref, shallowRef } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { getUserService } from '@/services/user/UserService'
import poolService from '@/services/pool/poolService'
import survivorService from '@/services/survivor/SurvivorServive'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'
import type { PoolResponse } from '@/interfaces/pool/PoolResponse'
import type { SurvivorResponse } from '@/interfaces/survivor/SurvivorResponse'

export type GameMode = 'fantasy' | 'pools' | 'survivor'

/**
 * Una partida en curso del usuario, ya normalizada: los tres modos tienen
 * formas de respuesta distintas y el hub necesita pintarlas en una sola lista.
 */
export interface ActiveGame {
  /** `${mode}:${uuid}` — estable entre recargas, sirve de `key` en el v-for. */
  id: string
  mode: GameMode
  name: string
  /** Línea secundaria: participantes, vidas restantes… Puede ir vacía. */
  meta: string
  to: RouteLocationRaw
  /** Escudo/imagen de la liga cuando existe. */
  image?: string
  /**
   * Fecha límite real y verificable (hoy solo el día del draft de fantasy).
   * NUNCA se rellena por estimación: una cuenta atrás inventada es peor que
   * ninguna. El resto de modos lo dejan en `undefined` hasta que la API
   * exponga el cierre de la jornada.
   */
  deadline?: Date
}

/** Sufijo de ruta por modo, para no repetir los nombres por todo el hub. */
const ROUTE_BY_MODE: Record<GameMode, string> = {
  fantasy: 'userFantasyLeague',
  pools: 'pools',
  survivor: 'survivor',
}

/** Prioridad de orden: primero lo que tiene fecha, luego por modo. */
const MODE_WEIGHT: Record<GameMode, number> = { fantasy: 0, pools: 1, survivor: 2 }

const toDate = (value: string | null | undefined): Date | undefined => {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/**
 * Carga las partidas en curso del usuario en los tres modos y las expone
 * normalizadas para el hub de inicio.
 *
 * Las tres peticiones van en paralelo y en modo silencioso: si una falla, sus
 * partidas simplemente no aparecen y las otras dos sí. El hub nunca debe
 * quedarse en blanco ni lanzar un toast de error porque una de las tres
 * llamadas de fondo se cayó — el usuario solo abrió la app.
 */
export function useGameHub() {
  const isLoading = ref(false)
  /** `true` si alguna de las tres fuentes falló: el hub lo usa para ofrecer reintentar. */
  const hasPartialFailure = ref(false)
  // shallowRef: la lista se reemplaza entera en cada carga y sus elementos son
  // inmutables, así que la reactividad profunda solo costaría trabajo.
  const games = shallowRef<ActiveGame[]>([])
  /** Marca si ya se completó una carga, para no pintar el estado vacío antes de tiempo. */
  const hasLoaded = ref(false)

  const fromFantasy = (leagues: FantasyLeaguesResponse[]): ActiveGame[] =>
    leagues.map((league) => ({
      id: `fantasy:${league.uuid}`,
      mode: 'fantasy' as const,
      name: league.name,
      meta: String(league.members_count ?? league.participants_count ?? ''),
      to: { name: 'fantasyLeagueDetail', params: { uuid: league.uuid } },
      image: league.image_path || undefined,
      deadline: toDate(league.draft?.draft_day),
    }))

  const fromPools = (pools: PoolResponse[]): ActiveGame[] =>
    pools.map((pool) => ({
      id: `pools:${pool.uuid}`,
      mode: 'pools' as const,
      name: pool.name,
      meta: String(pool.memberships?.length ?? ''),
      to: { name: 'poolGroup', params: { uuid: pool.uuid } },
    }))

  const fromSurvivors = (survivors: SurvivorResponse[]): ActiveGame[] =>
    survivors.map((survivor) => ({
      id: `survivor:${survivor.uuid}`,
      mode: 'survivor' as const,
      name: survivor.name,
      meta: String(survivor.max_lives ?? ''),
      to: { name: 'survivorDetail', params: { uuid: survivor.uuid } },
    }))

  async function load(): Promise<void> {
    isLoading.value = true
    hasPartialFailure.value = false

    const [fantasy, pools, survivors] = await Promise.allSettled([
      getUserService().getUserFantasyLeagues(true),
      poolService.getMyPools(true),
      survivorService.getMySurvivors(true),
    ])

    const collected: ActiveGame[] = []

    if (fantasy.status === 'fulfilled') collected.push(...fromFantasy(fantasy.value))
    else hasPartialFailure.value = true

    if (pools.status === 'fulfilled') collected.push(...fromPools(pools.value))
    else hasPartialFailure.value = true

    if (survivors.status === 'fulfilled') collected.push(...fromSurvivors(survivors.value))
    else hasPartialFailure.value = true

    // Lo que tiene fecha límite va primero y de más urgente a menos: es la
    // información accionable. El resto cae detrás agrupado por modo.
    collected.sort((a, b) => {
      if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime()
      if (a.deadline) return -1
      if (b.deadline) return 1
      return MODE_WEIGHT[a.mode] - MODE_WEIGHT[b.mode]
    })

    games.value = collected
    hasLoaded.value = true
    isLoading.value = false
  }

  const hasGames = computed(() => games.value.length > 0)

  /** Modos en los que el usuario todavía no juega nada: el hub los ofrece como siguiente paso. */
  const untouchedModes = computed<GameMode[]>(() => {
    const played = new Set(games.value.map((game) => game.mode))
    return (Object.keys(ROUTE_BY_MODE) as GameMode[]).filter((mode) => !played.has(mode))
  })

  return { isLoading, hasLoaded, hasPartialFailure, games, hasGames, untouchedModes, load }
}

export { ROUTE_BY_MODE }
