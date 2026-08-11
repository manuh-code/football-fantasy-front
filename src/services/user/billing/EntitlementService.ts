import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { EntitlementsResponse } from "@/interfaces/user/billing/EntitlementsResponse";
import { AxiosError } from "axios";

export class EntitlementService {
    private readonly api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    /**
     * Qué tiene desbloqueado el usuario.
     *
     * Silenciosa: la piden pantallas que sólo quieren saber si pintan un
     * candado, y un fallo ahí no debe sacarle un aviso de error a alguien que
     * no pidió nada. Sin respuesta se asume "sin premium", que es el estado
     * seguro — el servidor vuelve a comprobarlo en cada acción de todos modos.
     */
    async show(): Promise<EntitlementsResponse> {
        const response = await this.api.get<ApiResponse<EntitlementsResponse>>(
            "user/entitlements",
            { _silent: true } as never,
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError("Failed to fetch entitlements");
    }
}

// Factoría perezosa, no singleton eager: este servicio lo consume un store que
// puede resolverse durante el arranque, y construirlo en la carga del módulo
// dispararía useApiFantasy antes de que `import.meta.env` esté listo.
let instance: EntitlementService | null = null;

export const getEntitlementService = (): EntitlementService => {
    if (!instance) {
        instance = new EntitlementService();
    }
    return instance;
};
