import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { SubscriptionPlanResponse } from "@/interfaces/user/billing/SubscriptionPlanResponse";
import { SubscriptionStateResponse } from "@/interfaces/user/billing/SubscriptionStateResponse";
import { AxiosError } from "axios";

export class SubscriptionService {
    private readonly api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    // The Premium prices on offer. They come from Stripe rather than from the
    // bundle, so changing a price in the dashboard changes the app.
    async plans(): Promise<SubscriptionPlanResponse[]> {
        const response = await this.api.get<ApiResponse<SubscriptionPlanResponse[]>>('user/subscription/plans');
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch subscription plans');
    }

    async show(): Promise<SubscriptionStateResponse> {
        const response = await this.api.get<ApiResponse<SubscriptionStateResponse>>('user/subscription');
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch subscription');
    }

    /**
     * Start the subscription on `price`, charging `paymentMethod` (or the saved
     * default when omitted).
     *
     * Answers 202 with `requires_action` when the bank wants 3DS: the caller has
     * to confirm the payment intent in the browser before Premium is live.
     */
    async store(price: string, paymentMethod?: string): Promise<SubscriptionStateResponse> {
        const response = await this.api.post<ApiResponse<SubscriptionStateResponse>>('user/subscription', {
            price,
            ...(paymentMethod ? { payment_method: paymentMethod } : {}),
        });
        if (response.data.code === 200 || response.data.code === 201 || response.data.code === 202) {
            return response.data.data;
        }
        throw new AxiosError('Failed to create subscription');
    }

    // Move between monthly and annual. Stripe prorates, so switching mid-cycle
    // credits the time already paid for.
    async swap(price: string): Promise<SubscriptionStateResponse> {
        const response = await this.api.put<ApiResponse<SubscriptionStateResponse>>('user/subscription', { price });
        if (response.data.code === 200 || response.data.code === 202) {
            return response.data.data;
        }
        throw new AxiosError('Failed to swap subscription plan');
    }

    // Cancels at the end of the paid period, not immediately.
    async cancel(): Promise<SubscriptionStateResponse> {
        const response = await this.api.delete<ApiResponse<SubscriptionStateResponse>>('user/subscription');
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to cancel subscription');
    }

    async resume(): Promise<SubscriptionStateResponse> {
        const response = await this.api.post<ApiResponse<SubscriptionStateResponse>>('user/subscription/resume');
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to resume subscription');
    }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
