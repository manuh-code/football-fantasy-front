import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { PaymentMethodResponse } from "@/interfaces/user/billing/PaymentMethodResponse";
import { SetupIntentResponse } from "@/interfaces/user/billing/SetupIntentResponse";
import { AxiosError } from "axios";

export class PaymentMethodService {
    private readonly api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    // Opens a Stripe SetupIntent so the browser can collect and confirm a card.
    // Nothing is charged; it only authorizes Stripe to store the method for later.
    async createSetupIntent(): Promise<SetupIntentResponse> {
        const response = await this.api.post<ApiResponse<SetupIntentResponse>>('user/payment-methods/setup-intent');
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to create setup intent');
    }

    async index(): Promise<PaymentMethodResponse[]> {
        const response = await this.api.get<ApiResponse<PaymentMethodResponse[]>>('user/payment-methods');
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch payment methods');
    }

    // Attaches the method to the user *after* Stripe.js confirmed the setup.
    // We deliberately send the SetupIntent id and not the `pm_...` id: the API
    // re-reads the intent from Stripe to verify it succeeded and belongs to this
    // customer, instead of trusting an id posted by the client.
    async store(setupIntent: string, makeDefault = false): Promise<PaymentMethodResponse> {
        const response = await this.api.post<ApiResponse<PaymentMethodResponse>>('user/payment-methods', {
            setup_intent: setupIntent,
            default: makeDefault,
        });
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to store payment method');
    }

    async setDefault(paymentMethodId: string): Promise<PaymentMethodResponse> {
        const response = await this.api.put<ApiResponse<PaymentMethodResponse>>(
            `user/payment-methods/${paymentMethodId}/default`,
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to set default payment method');
    }

    async destroy(paymentMethodId: string): Promise<void> {
        const response = await this.api.delete<ApiResponse<null>>(`user/payment-methods/${paymentMethodId}`);
        if (response.data.code !== 200) {
            throw new AxiosError('Failed to delete payment method');
        }
    }
}

export const paymentMethodService = new PaymentMethodService();
export default paymentMethodService;
