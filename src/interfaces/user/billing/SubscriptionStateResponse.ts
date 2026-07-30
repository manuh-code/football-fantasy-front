// The user's Premium subscription. Null inside SubscriptionStateResponse when
// they have never subscribed.
export interface SubscriptionResponse {
    // Stripe Subscription id (`sub_...`).
    id: string;
    // Stripe status: active, past_due, canceled, incomplete, unpaid, ...
    status: string;
    // The Price the subscription is currently billed on.
    price: string;
    // True whenever the user should get Premium — including the paid-for
    // remainder after they cancel.
    is_active: boolean;
    // Cancelled, but still inside the period they already paid for.
    is_canceled: boolean;
    on_grace_period: boolean;
    // Stripe could not collect: prompt for a different card.
    is_past_due: boolean;
    // When the card gets charged again. Null once cancelled.
    renews_at: string | null;
    // When access actually stops after a cancellation. Null while renewing.
    ends_at: string | null;
    created_at: string | null;
}

// GET /user/subscription, and the payload every mutating subscription endpoint
// answers with, so a caller never has to re-fetch to learn what it just did.
export interface SubscriptionStateResponse {
    is_premium: boolean;
    subscription: SubscriptionResponse | null;
    // Present only when the bank asked for 3DS: the browser has to confirm the
    // payment intent before the subscription becomes active.
    requires_action?: boolean;
    payment_intent_client_secret?: string;
}
