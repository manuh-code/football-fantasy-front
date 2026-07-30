// Everything the browser needs to mount Stripe's Payment Element, as returned by
// POST /user/payment-methods/setup-intent. The publishable key travels with the
// intent so the key lives in a single place (the API) instead of a VITE_ var.
export interface SetupIntentResponse {
    client_secret: string;
    publishable_key: string;
}
