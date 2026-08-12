import { ref, shallowRef } from 'vue'
import type {
    StripeCheckoutElementsSdk,
    StripePaymentElement,
} from '@stripe/stripe-js'
import {
    loadConfiguredStripe,
    rememberPublishableKey,
    resolveAppearance,
} from '@/composables/useStripePaymentElement'

/**
 * El pago de la suscripción sobre la API de Checkout Sessions.
 *
 * Sustituye al camino anterior (SetupIntent + PaymentIntent confirmados a mano),
 * que es el que Stripe marca como antiguo. Aquí el `client_secret` de la sesión
 * arranca el propio Checkout: él monta el formulario, resuelve el 3DS y crea la
 * suscripción, así que del lado del cliente no queda ni una rama de
 * `requires_action`.
 *
 * Detalle de versiones que cuesta encontrar: `@stripe/stripe-js` 9 ya retiró el
 * `initCheckout` del modo `custom`, y sólo expone `initCheckoutElementsSdk`
 * (modo `elements`). Por eso el servidor pide una versión de API más nueva que
 * la que fija Cashier al crear la sesión — ver `subscription.checkout_api_version`.
 */
export function useStripeCheckout() {
    const checkout = shallowRef<StripeCheckoutElementsSdk | null>(null)
    const paymentElement = shallowRef<StripePaymentElement | null>(null)

    const isReady = ref(false)
    const isMounting = ref(false)
    const mountError = ref<string | null>(null)

    /**
     * Monta el formulario de pago dentro de `selector`.
     *
     * `clientSecret` se pasa tal cual llega del servidor. Se admite una promesa
     * porque Stripe recomienda arrancar el SDK antes de tener la respuesta: así
     * el iframe se va cargando mientras el backend abre la sesión.
     */
    async function mount(
        clientSecret: string | Promise<string>,
        selector: string,
        publishableKey?: string | null,
    ): Promise<boolean> {
        isMounting.value = true
        mountError.value = null

        try {
            // La clave que manda el servidor es la buena: es la de la cuenta y
            // el modo que crearon la sesión, y sólo ésa puede verla.
            rememberPublishableKey(publishableKey)

            const stripe = await loadConfiguredStripe()

            if (!stripe) {
                mountError.value = 'stripe-unavailable'

                return false
            }

            const sdk = stripe.initCheckoutElementsSdk({
                clientSecret,
                elementsOptions: {
                    appearance: resolveAppearance(),
                    // Deja que Checkout ofrezca las tarjetas ya guardadas del
                    // cliente en vez de obligar a teclearlas otra vez.
                    savedPaymentMethod: { enableSave: 'auto', enableRedisplay: 'auto' },
                },
            })

            checkout.value = sdk

            const element = sdk.createPaymentElement()
            element.mount(selector)
            paymentElement.value = element

            isReady.value = true

            return true
        } catch (error) {
            console.error('[stripe] no se pudo montar el Checkout:', error)
            mountError.value = 'mount-failed'

            return false
        } finally {
            isMounting.value = false
        }
    }

    /**
     * Cobra. Devuelve el error de Stripe listo para enseñar, o null si pasó.
     *
     * Los errores de tarjeta (fondos, rechazo del banco) vuelven aquí como
     * valor, no como excepción: son parte normal de un cobro y el usuario tiene
     * que poder reintentar con otra tarjeta sin salir de la hoja.
     */
    async function confirm(): Promise<string | null> {
        const sdk = checkout.value

        if (!sdk) {
            return 'not-ready'
        }

        const { actions } = await sdk.loadActions()

        // `if_required` y no el `always` de fábrica: con tarjeta el cobro se
        // resuelve sin moverse de la hoja, que es lo que permite enseñar el
        // panel de éxito y activar Premium al momento. Con `always` Stripe se
        // lleva al usuario a `return_url` incluso pagando con tarjeta, y la app
        // se recarga como si no hubiera pasado nada.
        //
        // Los métodos que sí exigen salir (transferencia, OXXO) siguen saliendo:
        // eso lo recoge el manejador de vuelta de la vista de Premium.
        const { error } = await actions.confirm({ redirect: 'if_required' })

        return error?.message ?? null
    }

    function destroy(): void {
        paymentElement.value?.unmount()
        paymentElement.value = null
        checkout.value = null
        isReady.value = false
        mountError.value = null
    }

    return { isReady, isMounting, mountError, mount, confirm, destroy }
}
