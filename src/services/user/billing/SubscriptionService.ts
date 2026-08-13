import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { SubscriptionPlanResponse } from "@/interfaces/user/billing/SubscriptionPlanResponse";
import { CheckoutSessionResponse, SubscriptionStateResponse } from "@/interfaces/user/billing/SubscriptionStateResponse";
import { AxiosError, type AxiosRequestConfig } from "axios";

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

    /**
     * Los mismos precios, sin sesión: es lo que consume la landing pública de
     * Premium, que tiene que decir cuánto cuesta antes de pedirle una cuenta a
     * nadie.
     *
     * `is_current` vuelve siempre en false porque sin sesión no hay suscripción
     * con la que comparar; la pantalla de gestión sigue usando `plans()`.
     *
     * Va silenciosa: la página dibuja su propio estado de error con un botón de
     * reintentar, y un toast encima sólo estorbaría.
     */
    async publicPlans(): Promise<SubscriptionPlanResponse[]> {
        const response = await this.api.get<ApiResponse<SubscriptionPlanResponse[]>>(
            'catalog/subscription/plans',
            { _silent: true } as AxiosRequestConfig & { _silent?: boolean },
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch public subscription plans');
    }

    async show(): Promise<SubscriptionStateResponse> {
        const response = await this.api.get<ApiResponse<SubscriptionStateResponse>>('user/subscription');
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch subscription');
    }

    /**
     * Abre el pago de la suscripción como una Checkout Session.
     *
     * Es la vía que Stripe recomienda y la que sustituye a `store()`: la sesión
     * cobra, resuelve el 3DS y crea la suscripción, así que el navegador ya no
     * tiene que encadenar intents a mano.
     */
    async checkout(price: string): Promise<CheckoutSessionResponse> {
        const response = await this.api.post<ApiResponse<CheckoutSessionResponse>>(
            'user/subscription/checkout',
            { price },
        );
        if (response.data.code === 200 || response.data.code === 201) {
            return response.data.data;
        }
        throw new AxiosError('Failed to open the checkout session');
    }

    /**
     * Cuenta al servidor que el pago terminó para que escriba la suscripción sin
     * esperar al webhook.
     *
     * Contesta 202 cuando el cobro sigue en proceso (métodos de pago asíncronos):
     * en ese caso Premium se activa solo al llegar el webhook, y no hay nada que
     * reintentar desde aquí.
     */
    async syncCheckout(sessionId: string): Promise<SubscriptionStateResponse> {
        const response = await this.api.post<ApiResponse<SubscriptionStateResponse>>(
            'user/subscription/checkout/sync',
            { session_id: sessionId },
        );
        if (response.data.code === 200 || response.data.code === 202) {
            return response.data.data;
        }
        throw new AxiosError('Failed to sync the checkout session');
    }

    /**
     * Camino anterior (tarjeta guardada + PaymentIntent). Sigue vivo en el API
     * como red de seguridad, pero el flujo de pago ya no pasa por aquí.
     *
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
