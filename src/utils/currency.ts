// Money formatting for the billing screens.
//
// Amounts arrive from the API already out of Stripe's minor units, so these
// helpers only decide how to present them.

const formatterCache = new Map<string, Intl.NumberFormat>()

function formatter(locale: string, currency: string, fractionDigits: number): Intl.NumberFormat {
    const cacheKey = `${locale}:${currency}:${fractionDigits}`

    let instance = formatterCache.get(cacheKey)
    if (!instance) {
        instance = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        })
        formatterCache.set(cacheKey, instance)
    }

    return instance
}

/**
 * "$79" for a round amount, "$58.25" when there are cents.
 *
 * Trailing ".00" is dropped because a price list reads better without it, but
 * cents are never rounded away — $58.25 must not be shown as $58.
 */
export function formatMoney(amount: number, currency: string, locale = 'es-MX'): string {
    const hasCents = Math.round(amount * 100) % 100 !== 0

    return formatter(locale, currency, hasCents ? 2 : 0).format(amount)
}

/** The currency symbol on its own, for setting apart from the digits. */
export function currencySymbol(currency: string, locale = 'es-MX'): string {
    const parts = formatter(locale, currency, 0).formatToParts(0)

    return parts.find((part) => part.type === 'currency')?.value ?? ''
}

/**
 * The digits without the symbol, so a price can be typeset with the amount
 * large and the currency small beside it.
 */
export function formatAmount(amount: number, currency: string, locale = 'es-MX'): string {
    const hasCents = Math.round(amount * 100) % 100 !== 0

    return formatter(locale, currency, hasCents ? 2 : 0)
        .formatToParts(amount)
        .filter((part) => part.type !== 'currency' && part.type !== 'literal')
        .map((part) => part.value)
        .join('')
}
