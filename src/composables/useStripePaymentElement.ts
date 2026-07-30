import { ref, shallowRef, watch } from 'vue'
import {
    loadStripe,
    type Appearance,
    type Stripe,
    type StripeElements,
    type StripePaymentElement,
} from '@stripe/stripe-js'
import { useThemeStore } from '@/store/theme'
import { useLocaleStore } from '@/store/locale'
import paymentMethodService from '@/services/user/billing/PaymentMethodService'

// Publishable keys are meant to ship in the bundle, and having it at build time
// is what lets us load Stripe.js before the API answers. When it is not set we
// fall back to the key the SetupIntent endpoint returns.
const configuredPublishableKey = import.meta.env.VITE_STRIPE_KEY

// `loadStripe` injects Stripe.js on first call. The resulting promise is cached
// per publishable key so reopening the form reuses the already-loaded script.
const stripePromises = new Map<string, Promise<Stripe | null>>()

function getStripe(publishableKey: string): Promise<Stripe | null> {
    let promise = stripePromises.get(publishableKey)
    if (!promise) {
        // Uncached on failure: `loadStripe` re-injects the script on the next
        // attempt, so a network blip must not leave a rejection cached forever.
        promise = loadStripe(publishableKey).catch((error) => {
            stripePromises.delete(publishableKey)
            throw error
        })
        stripePromises.set(publishableKey, promise)
    }
    return promise
}

/**
 * Downloads Stripe.js and builds the constructor before the user asks for the
 * card form. Stripe recommends doing this at the start of the session: the form
 * then opens with no script fetch in the way, and the injected script never
 * competes with the first paint. No-op without a build-time publishable key.
 */
export function preloadStripe(): void {
    if (!configuredPublishableKey) {
        return
    }

    // Failures are ignored here on purpose — `mount()` retries and reports them.
    void getStripe(configuredPublishableKey).catch(() => {})
}

// The publishable key the API reported, which always belongs to the account and
// mode whose secret key created the intents we are confirming.
let serverPublishableKey: string | null = null
let warnedAboutKeyMismatch = false

/**
 * Records the publishable key the API reports. The server is the authority here:
 * it created the SetupIntent (or the subscription) with its own secret key, so
 * only its account can see them.
 *
 * A build-time `VITE_STRIPE_KEY` that disagrees is stale or points at another
 * account — the case Stripe reports as "The client_secret provided does not
 * match any associated SetupIntent on this account".
 */
export function rememberPublishableKey(key: string | null | undefined): void {
    if (!key) {
        return
    }

    if (configuredPublishableKey && key !== configuredPublishableKey && !warnedAboutKeyMismatch) {
        warnedAboutKeyMismatch = true
        console.warn(
            '[stripe] VITE_STRIPE_KEY does not match the publishable key the API reports. ' +
                'They must come from the same Stripe account and the same mode. ' +
                'Using the key from the API.',
        )
    }

    serverPublishableKey = key
}

/** The key to load Stripe.js with: the API's when known, the build-time one otherwise. */
function activePublishableKey(): string | null {
    return serverPublishableKey ?? configuredPublishableKey ?? null
}

/**
 * The shared Stripe instance, for flows that need Stripe.js without an Element
 * of their own — confirming a 3DS challenge on a subscription, for one.
 *
 * Resolves null when no publishable key is known from either source.
 */
export function loadConfiguredStripe(): Promise<Stripe | null> {
    const key = activePublishableKey()

    if (!key) {
        return Promise.resolve(null)
    }

    return getStripe(key)
}

function buildAppearance(isDark: boolean): Appearance {
    return {
        theme: isDark ? 'night' : 'stripe',
        variables: {
            // Mirrors the app's emerald-600 primary and gray-900 dark surface.
            colorPrimary: '#059669',
            colorBackground: isDark ? '#111827' : '#ffffff',
            colorText: isDark ? '#f9fafb' : '#111827',
            colorDanger: '#ef4444',
            borderRadius: '10px',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        },
    }
}

// Stripe fires `ready` within a few hundred ms on a healthy connection. If it
// has not fired by now something is wedged (a blocked frame, a dead network),
// and showing a retry beats leaving the user on a skeleton forever.
const READY_TIMEOUT_MS = 20_000

/**
 * Drives Stripe's Payment Element for the "save a card" flow: it opens a
 * SetupIntent on the API, mounts the element, and confirms it. Card data goes
 * from the browser straight to Stripe — it never touches our API.
 */
export function useStripePaymentElement() {
    const themeStore = useThemeStore()
    const localeStore = useLocaleStore()

    const isLoading = ref(false)
    const isReady = ref(false)
    const isConfirming = ref(false)
    const errorMessage = ref<string | null>(null)
    // Set when the element itself fails to render — which happens after `mount()`
    // has already returned, so it cannot be reported through its return value.
    const loadFailed = ref(false)

    const stripe = shallowRef<Stripe | null>(null)
    const elements = shallowRef<StripeElements | null>(null)
    let paymentElement: StripePaymentElement | null = null
    let readyTimeout: ReturnType<typeof setTimeout> | null = null

    function clearReadyTimeout(): void {
        if (readyTimeout !== null) {
            clearTimeout(readyTimeout)
            readyTimeout = null
        }
    }

    // Toggling the app theme with the form open would otherwise leave a light
    // card field sitting on a dark sheet until it is reopened.
    watch(
        () => themeStore.currentTheme,
        (theme) => elements.value?.update({ appearance: buildAppearance(theme === 'dark') }),
    )

    /**
     * Creates the SetupIntent and mounts the Payment Element into `target`.
     * Returns false when the form could not be prepared.
     *
     * `target` must be laid out (visible, with a real width) before this runs:
     * Stripe sizes the element from the container it is mounted into, and a
     * `display: none` parent makes it render at zero width and re-flow later.
     */
    async function mount(target: HTMLElement): Promise<boolean> {
        destroy()

        isLoading.value = true
        errorMessage.value = null

        try {
            // Started before the API call, not after it: the script fetch and the
            // SetupIntent then overlap (and it is already done when preloaded).
            const stripeLoad = configuredPublishableKey ? getStripe(configuredPublishableKey) : null
            // Marks it handled so a load failure while the API call is in flight
            // doesn't surface as an unhandled rejection; awaiting still throws.
            stripeLoad?.catch(() => {})

            const { client_secret, publishable_key } = await paymentMethodService.createSetupIntent()

            rememberPublishableKey(publishable_key)

            // The preloaded instance is only reusable when it was built with the
            // same key the API just reported. Loading a mismatched key's Stripe.js
            // would produce an Element that cannot see this SetupIntent at all.
            const stripeInstance = await (publishable_key && publishable_key !== configuredPublishableKey
                ? getStripe(publishable_key)
                : (stripeLoad ?? getStripe(publishable_key)))

            if (!stripeInstance) {
                return false
            }

            stripe.value = stripeInstance
            elements.value = stripeInstance.elements({
                clientSecret: client_secret,
                appearance: buildAppearance(themeStore.currentTheme === 'dark'),
                locale: localeStore.locale === 'en' ? 'en' : 'es',
            })

            paymentElement = elements.value.create('payment', { layout: 'tabs' })

            paymentElement.on('ready', () => {
                clearReadyTimeout()
                isReady.value = true
            })

            // Raised when the element cannot render at all (a blocked iframe, an
            // intent that Stripe rejects). Without this the skeleton never ends.
            paymentElement.on('loaderror', (event) => {
                clearReadyTimeout()
                errorMessage.value = event.error?.message ?? null
                loadFailed.value = true
            })

            paymentElement.mount(target)

            readyTimeout = setTimeout(() => {
                if (!isReady.value) {
                    loadFailed.value = true
                }
            }, READY_TIMEOUT_MS)

            return true
        } catch {
            // API failures already surfaced a toast through the axios interceptor.
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Confirms the setup. Returns the SetupIntent id to hand to the API, or null
     * when it failed — or when Stripe redirected the browser for 3DS, in which
     * case the callback route finishes the job.
     */
    async function confirm(returnUrl: string): Promise<string | null> {
        if (!stripe.value || !elements.value) {
            return null
        }

        isConfirming.value = true
        errorMessage.value = null

        try {
            const { error, setupIntent } = await stripe.value.confirmSetup({
                elements: elements.value,
                confirmParams: { return_url: returnUrl },
                redirect: 'if_required',
            })

            if (error) {
                errorMessage.value = error.message ?? null
                return null
            }

            return setupIntent?.id ?? null
        } finally {
            isConfirming.value = false
        }
    }

    function destroy(): void {
        clearReadyTimeout()
        paymentElement?.destroy()
        paymentElement = null
        elements.value = null
        stripe.value = null
        isReady.value = false
        isConfirming.value = false
        errorMessage.value = null
        loadFailed.value = false
    }

    return {
        isLoading,
        isReady,
        isConfirming,
        errorMessage,
        loadFailed,
        mount,
        confirm,
        destroy,
    }
}
