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
    // True whenever the user has Premium, **whatever paid for it** — Stripe,
    // the App Store, Google Play or an admin grant. Deliberately NOT the same
    // thing as `subscription !== null`: a subscription bought on a phone gives
    // Premium here with no Stripe row to describe it.
    is_premium: boolean;
    // Who grants it: stripe | app_store | google_play | admin_grant. Null when
    // there is no Premium.
    source: string | null;
    // Where the user can cancel or change it: web | app_store | google_play.
    // Null when there is nothing to manage. NOT interchangeable with `source`:
    // this is the only field that says whether *this* client can do anything
    // about the subscription.
    manage_in: string | null;
    // The Stripe row, and only the Stripe row. Null when Premium came from a
    // store — there is no Stripe subscription to show, and inventing one would
    // lie about where the money is charged.
    subscription: SubscriptionResponse | null;
    // Publishable key of the Stripe account and mode that owns these
    // subscriptions. Needed to run a 3DS challenge with a Stripe.js instance
    // that can actually see the payment intent.
    publishable_key?: string;
    // Present only when the bank asked for 3DS: the browser has to confirm the
    // payment intent before the subscription becomes active.
    requires_action?: boolean;
    payment_intent_client_secret?: string;
}

// POST /user/subscription/checkout — lo que hace falta para montar el pago.
export interface CheckoutSessionResponse {
    // Id de la Checkout Session (`cs_...`). Se devuelve al servidor al terminar
    // para que escriba la suscripción sin esperar al webhook.
    session_id: string;
    // Con esto arranca el Checkout en el navegador.
    client_secret: string;
    publishable_key: string;
}
