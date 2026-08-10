import { AxiosError, type AxiosRequestConfig } from "axios";
import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { ApiPagination } from "@/interfaces/api/ApiPagination";
import { Notice, NoticeUnreadCount } from "@/interfaces/notice/Notice";

export interface NoticePage {
  items: Notice[];
  pagination: ApiPagination | null;
}

export class NoticeService {
  private readonly api;

  constructor() {
    const { apiFantasyInstance } = useApiFantasy();
    this.api = apiFantasyInstance;
  }

  async list(page = 1, perPage = 20): Promise<NoticePage> {
    const response = await this.api.get<ApiResponse<Notice[]>>("notices", {
      params: { page, per_page: perPage },
    });

    if (response.data.code === 200) {
      return {
        items: response.data.data ?? [],
        // El endpoint siempre pagina con `paginate()`, así que la forma es
        // ApiPagination; el tipo del sobre admite además la simple.
        pagination: (response.data.pagination as ApiPagination) ?? null,
      };
    }
    throw new AxiosError("Failed to fetch notices");
  }

  /**
   * Sólo el número del globito. Va silencioso: se pide al arrancar la app y un
   * fallo de red aquí no merece un toast delante de lo que el usuario esté
   * haciendo.
   */
  async unreadCount(): Promise<number> {
    const response = await this.api.get<ApiResponse<NoticeUnreadCount>>(
      "notices/unread-count",
      { _silent: true } as AxiosRequestConfig & { _silent?: boolean },
    );

    if (response.data.code === 200) {
      return response.data.data.unread_count;
    }
    throw new AxiosError("Failed to fetch unread notices count");
  }

  async markAsRead(uuid: string): Promise<Notice> {
    const response = await this.api.put<ApiResponse<Notice>>(
      `notices/${uuid}/read`,
    );

    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new AxiosError("Failed to mark notice as read");
  }

  async markAllAsRead(): Promise<void> {
    const response = await this.api.put<ApiResponse<null>>("notices/read-all");

    if (response.data.code !== 200) {
      throw new AxiosError("Failed to mark all notices as read");
    }
  }

  async remove(uuid: string): Promise<void> {
    const response = await this.api.delete<ApiResponse<null>>(
      `notices/${uuid}`,
    );

    if (response.data.code !== 200) {
      throw new AxiosError("Failed to delete notice");
    }
  }
}

export default new NoticeService();
