// One purchasable Premium price, as returned by GET /user/subscription/plans.
// Amounts come from Stripe already converted out of minor units, so the client
// renders what the account actually charges and never hardcodes a price.
export interface SubscriptionPlanResponse {
    // Stripe Price id (`price_...`) — what the subscribe/swap endpoints expect.
    id: string;
    amount: number;
    // ISO 4217, uppercase (e.g. "MXN").
    currency: string;
    interval: 'day' | 'week' | 'month' | 'year' | null;
    interval_count: number;
    // What the plan works out to per month, so a yearly price can be compared
    // against a monthly one. Null for intervals shorter than a month.
    amount_per_month: number | null;
    // Whole percent saved against paying monthly for the same span. Null on the
    // monthly plan itself, which is the baseline.
    savings_percent: number | null;
    // Whether this is the price the user is currently subscribed to.
    is_current: boolean;
}
