import type { AxiosRequestConfig } from 'axios'
import { useApiFantasy } from '@/composables/useApiFantasy'
import { ApiResponse } from '@/interfaces/api/ApiResponse'
import { FantasyPlayerDraftPayload } from '@/interfaces/fantasy/draft/FantasyPlayerDraftPayload'
import { FantasyPlayerDraftResponse } from '@/interfaces/fantasy/draft/FantasyPlayerDraftResponse'
import {
  MockDraftCreatePayload,
  MockDraftOptions,
  MockDraftPickResponse,
  MockDraftResponse,
  MockDraftSummary,
} from '@/interfaces/fantasy/mockDraft/MockDraftResponse'
import { DraftResults } from '@/interfaces/fantasy/draft/DraftResults'

/**
 * Mock draft — el draft de práctica contra bots.
 *
 * A diferencia del draft real, aquí NO hay Ably: no hay rivales humanos a los
 * que sincronizar. Cada pick devuelve en la misma respuesta los fichajes de los
 * bots que vienen detrás y la instantánea resultante, así que la sala se
 * mantiene al día sin canal de realtime ni polling.
 */
export class MockDraftService {
  private readonly api

  constructor() {
    const { apiFantasyInstance } = useApiFantasy()
    this.api = apiFantasyInstance
  }

  /** Rangos y valores por defecto del formulario de configuración. */
  async getOptions(): Promise<MockDraftOptions> {
    const response = await this.api.get<ApiResponse<MockDraftOptions>>('fantasy/mock-drafts/options')
    if (response.data.code === 200) {
      return response.data.data
    }
    throw new Error('Failed to fetch mock draft options')
  }

  /**
   * Mocks recientes. "Reciente" es literal: el backend los guarda en Redis con
   * TTL, así que esta lista no es un historial permanente.
   */
  async getRecent(): Promise<MockDraftSummary[]> {
    const response = await this.api.get<ApiResponse<MockDraftSummary[]>>('fantasy/mock-drafts')
    if (response.data.code === 200) {
      return response.data.data
    }
    throw new Error('Failed to fetch recent mock drafts')
  }

  async create(payload: MockDraftCreatePayload): Promise<MockDraftResponse> {
    const response = await this.api.post<ApiResponse<MockDraftResponse>>('fantasy/mock-drafts', payload)
    if (response.data.code === 200) {
      return response.data.data
    }
    throw new Error('Failed to create mock draft')
  }

  /**
   * Instantánea del mock. `silent` para el arranque de la sala: un mock que ya
   * expiró es un estado esperado que la vista explica mejor que un toast.
   */
  async show(uuid: string, options?: { silent?: boolean }): Promise<MockDraftResponse> {
    const config = options?.silent
      ? ({ _silent: true } as AxiosRequestConfig & { _silent?: boolean })
      : undefined
    const response = await this.api.get<ApiResponse<MockDraftResponse>>(`fantasy/mock-drafts/${uuid}`, config)
    if (response.data.code === 200) {
      return response.data.data
    }
    throw new Error('Failed to fetch mock draft')
  }

  /**
   * Pool de jugadores disponibles. Mismo contrato que el buscador del draft
   * real, para poder reutilizar sus componentes de lista.
   */
  async getPlayers(uuid: string, payload: FantasyPlayerDraftPayload): Promise<FantasyPlayerDraftResponse[]> {
    const response = await this.api.post<ApiResponse<FantasyPlayerDraftResponse[]>>(
      `fantasy/mock-drafts/${uuid}/players`,
      payload,
    )
    if (response.data.code === 200) {
      return response.data.data
    }
    throw new Error('Failed to fetch mock draft players')
  }

  async pick(uuid: string, playerUuid: string): Promise<MockDraftPickResponse> {
    const response = await this.api.post<ApiResponse<MockDraftPickResponse>>(`fantasy/mock-drafts/${uuid}/pick`, {
      player_uuid: playerUuid,
    })
    if (response.data.code === 200) {
      return response.data.data
    }
    throw new Error('Failed to pick player')
  }

  /**
   * Autopick del usuario (se acabó el tiempo o lo pidió a mano). La wishlist
   * vive solo en el cliente, así que se manda aquí para que el backend respete
   * ese orden de preferencia.
   */
  async autoPick(uuid: string, wishlistPlayerUuids: string[] = []): Promise<MockDraftPickResponse> {
    const response = await this.api.post<ApiResponse<MockDraftPickResponse>>(`fantasy/mock-drafts/${uuid}/auto-pick`, {
      wishlist_player_uuids: wishlistPlayerUuids,
    })
    if (response.data.code === 200) {
      return response.data.data
    }
    throw new Error('Failed to auto pick')
  }

  /** Resuelve de golpe todos los picks que faltan, incluidos los tuyos. */
  async simulate(uuid: string, wishlistPlayerUuids: string[] = []): Promise<MockDraftPickResponse> {
    const response = await this.api.post<ApiResponse<MockDraftPickResponse>>(`fantasy/mock-drafts/${uuid}/simulate`, {
      wishlist_player_uuids: wishlistPlayerUuids,
    })
    if (response.data.code === 200) {
      return response.data.data
    }
    throw new Error('Failed to simulate mock draft')
  }

  async getResults(uuid: string): Promise<DraftResults> {
    const response = await this.api.get<ApiResponse<DraftResults>>(`fantasy/mock-drafts/${uuid}/results`)
    if (response.data.code === 200) {
      return response.data.data
    }
    throw new Error('Failed to fetch mock draft results')
  }

  async destroy(uuid: string): Promise<void> {
    const response = await this.api.delete<ApiResponse<null>>(`fantasy/mock-drafts/${uuid}`)
    if (response.data.code !== 200) {
      throw new Error('Failed to delete mock draft')
    }
  }
}

export const mockDraftService = new MockDraftService()
export default mockDraftService
