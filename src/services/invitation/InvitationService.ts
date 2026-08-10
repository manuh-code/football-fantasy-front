import { AxiosError, type AxiosRequestConfig } from "axios";
import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import {
  InvitableType,
  Invitation,
  InvitationCreatePayload,
} from "@/interfaces/invitation/Invitation";

export class InvitationService {
  private readonly api;

  constructor() {
    const { apiFantasyInstance } = useApiFantasy();
    this.api = apiFantasyInstance;
  }

  async invite(payload: InvitationCreatePayload): Promise<Invitation> {
    const response = await this.api.post<ApiResponse<Invitation>>(
      "invitations",
      payload,
    );

    if (response.data.code === 201) {
      return response.data.data;
    }
    throw new AxiosError("Failed to send invitation");
  }

  async listPending(
    invitableType: InvitableType,
    invitableUuid: string,
  ): Promise<Invitation[]> {
    const response = await this.api.get<ApiResponse<Invitation[]>>(
      `invitations/${invitableType}/${invitableUuid}`,
    );

    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new AxiosError("Failed to fetch invitations");
  }

  /**
   * Vista previa del enlace del correo. No requiere sesión, y va silenciosa
   * porque la pantalla dibuja su propio estado de error (un enlace vencido no
   * es un fallo que reportar con un toast).
   */
  async showByToken(token: string): Promise<Invitation> {
    const response = await this.api.post<ApiResponse<Invitation>>(
      "invitations/token",
      { token },
      { _silent: true } as AxiosRequestConfig & { _silent?: boolean },
    );

    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new AxiosError("Failed to fetch invitation");
  }

  async accept(token: string): Promise<Invitation> {
    const response = await this.api.post<ApiResponse<Invitation>>(
      "invitations/accept",
      { token },
    );

    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new AxiosError("Failed to accept invitation");
  }

  async decline(token: string): Promise<void> {
    const response = await this.api.post<ApiResponse<null>>(
      "invitations/decline",
      { token },
    );

    if (response.data.code !== 200) {
      throw new AxiosError("Failed to decline invitation");
    }
  }

  async cancel(invitationUuid: string): Promise<void> {
    const response = await this.api.delete<ApiResponse<null>>(
      `invitations/${invitationUuid}`,
    );

    if (response.data.code !== 200) {
      throw new AxiosError("Failed to cancel invitation");
    }
  }
}

export default new InvitationService();
