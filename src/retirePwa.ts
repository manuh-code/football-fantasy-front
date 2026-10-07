/**
 * fantasymx.cloud ya no es la PWA: es la landing y las páginas de lectura, y la
 * app vive en game.fantasymx.cloud (src/config/site.ts). Por eso main.ts no
 * registra aquí el service worker: hacerlo haría que cada visitante nuevo de la
 * landing precargara en segundo plano toda la app (varios MB) para una página
 * que no la usa.
 *
 * Quien ya la tenía instalada de antes sí conserva un SW en este origen, con el
 * build viejo en su caché y sin nadie que lo actualice (ese registro ya no
 * existe): se quedaría para siempre en una landing vieja. Así que aquí se
 * retira — se da de baja el SW de la PWA y se borran sus cachés — y desde la
 * siguiente visita todo llega de la red.
 *
 * Solo se toca el registro con scope `/`: el de Firebase Messaging vive en su
 * propio scope (/firebase-cloud-messaging-push-scope) y los avisos push que ya
 * estaban activados deben seguir llegando.
 */
export async function retirePwa(): Promise<void> {
  try {
    const registrations = (await navigator.serviceWorker?.getRegistrations()) ?? []
    await Promise.all(
      registrations
        .filter((registration) => new URL(registration.scope).pathname === '/')
        .map((registration) => registration.unregister())
    )
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
  } catch (e) {
    console.warn('No se pudo retirar el service worker de la PWA:', e)
  }
}
