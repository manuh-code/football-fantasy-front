import type { PaymentMethodResponse } from '@/interfaces/user/billing/PaymentMethodResponse'

// Stripe returns lowercase brand codes; only the ones that are not a plain
// capitalization need an entry here.
const BRAND_LABELS: Record<string, string> = {
    amex: 'American Express',
    cartes_bancaires: 'Cartes Bancaires',
    diners: 'Diners Club',
    eftpos_au: 'Eftpos',
    jcb: 'JCB',
    mastercard: 'Mastercard',
    unionpay: 'UnionPay',
    visa: 'Visa',
}

const WALLET_LABELS: Record<string, string> = {
    apple_pay: 'Apple Pay',
    google_pay: 'Google Pay',
    link: 'Link',
    samsung_pay: 'Samsung Pay',
}

function humanize(value: string): string {
    return value
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function paymentMethodBrandLabel(paymentMethod: PaymentMethodResponse): string {
    if (paymentMethod.brand) {
        return BRAND_LABELS[paymentMethod.brand] ?? humanize(paymentMethod.brand)
    }
    return humanize(paymentMethod.type)
}

export function paymentMethodWalletLabel(paymentMethod: PaymentMethodResponse): string | null {
    if (!paymentMethod.wallet) {
        return null
    }
    return WALLET_LABELS[paymentMethod.wallet] ?? humanize(paymentMethod.wallet)
}

// "Visa •••• 4242" — used in toasts and confirmation copy.
export function paymentMethodLabel(paymentMethod: PaymentMethodResponse): string {
    const brand = paymentMethodBrandLabel(paymentMethod)
    return paymentMethod.last_four ? `${brand} •••• ${paymentMethod.last_four}` : brand
}

export function paymentMethodExpiry(paymentMethod: PaymentMethodResponse): string | null {
    if (!paymentMethod.exp_month || !paymentMethod.exp_year) {
        return null
    }
    return `${String(paymentMethod.exp_month).padStart(2, '0')}/${String(paymentMethod.exp_year).slice(-2)}`
}

// When a card needs 3DS, Stripe navigates away from the app and back to the
// callback route, so the in-memory "make this my default" choice is lost. It is
// parked in sessionStorage instead (per-tab, cleared once consumed).
const PENDING_DEFAULT_KEY = 'billing.pendingSetupDefault'

export function rememberPendingDefault(makeDefault: boolean): void {
    try {
        sessionStorage.setItem(PENDING_DEFAULT_KEY, makeDefault ? '1' : '0')
    } catch {
        // Private-mode Safari can throw on write; defaulting is a preference, not
        // a requirement, so losing it must never break the setup flow.
    }
}

export function consumePendingDefault(): boolean {
    try {
        const value = sessionStorage.getItem(PENDING_DEFAULT_KEY)
        sessionStorage.removeItem(PENDING_DEFAULT_KEY)
        return value === '1'
    } catch {
        return false
    }
}

export type PaymentMethodExpiryState = 'valid' | 'expiringSoon' | 'expired'

// A card is flagged as expiring soon within the next two months so the user can
// replace it before an off-session charge (a league fee, a renewal) fails.
export function paymentMethodExpiryState(
    paymentMethod: PaymentMethodResponse,
    now: Date = new Date(),
): PaymentMethodExpiryState {
    if (!paymentMethod.exp_month || !paymentMethod.exp_year) {
        return 'valid'
    }

    // Stripe's expiry is inclusive: a 07/2026 card is valid until 2026-07-31.
    const expiresAt = new Date(paymentMethod.exp_year, paymentMethod.exp_month, 1)
    if (expiresAt.getTime() <= now.getTime()) {
        return 'expired'
    }

    const soonThreshold = new Date(now.getFullYear(), now.getMonth() + 2, 1)
    return expiresAt.getTime() <= soonThreshold.getTime() ? 'expiringSoon' : 'valid'
}
