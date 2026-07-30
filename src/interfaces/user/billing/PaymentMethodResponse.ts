// One saved payment method, as returned by GET /user/payment-methods.
export interface PaymentMethodResponse {
    // Stripe PaymentMethod id (`pm_...`). It is the identifier every other
    // payment-method endpoint expects in its path.
    id: string;
    // Stripe payment method type: "card", "link", "oxxo", ...
    type: string;
    // Whether this is the method charged by default for off-session payments.
    is_default: boolean;
    // Card-only details; null for the non-card types.
    brand: string | null;
    last_four: string | null;
    exp_month: number | null;
    exp_year: number | null;
    funding: string | null;
    country: string | null;
    // Set when the card comes from a wallet (apple_pay, google_pay, link).
    wallet: string | null;
    billing_name: string | null;
    created_at: string;
}
