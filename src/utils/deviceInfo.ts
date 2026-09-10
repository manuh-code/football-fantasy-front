/**
 * Qué aparato es este, para el registro de avisos push.
 *
 * El backend guarda `platform` + `device_model` + `os_version` desde que
 * `fcm_tokens` dejó de tener una sola columna de texto libre (`device_name`) que
 * mezclaba la plataforma con el nombre del aparato. Este archivo es el lado web
 * de ese contrato.
 */

/** Los tres valores que acepta el backend (`App\Enums\DevicePlatform`). */
export type DevicePlatform = 'android' | 'ios' | 'web'

export interface DeviceInfo {
  platform: DevicePlatform
  /** Etiqueta legible: "Chrome en Android". */
  device_name: string
  /** El modelo cuando el navegador lo suelta, si no el navegador y el sistema. */
  device_model: string | null
  /** Versión del sistema operativo, cuando se puede saber. */
  os_version: string | null
}

/**
 * Aquí `platform` es **siempre** `'web'`, aunque el teléfono sea un Android.
 *
 * No es un descuido. `platform` dice de qué cliente salió el token, no en qué
 * aparato corre, y de eso depende cómo se entrega el aviso: esto es Web Push con
 * VAPID a través del service worker, no el SDK nativo. Un envío segmentado a
 * "Android" tiene que llegar a la app de la tienda; si la PWA instalada en un
 * Android se contase como `android`, ese envío incluiría navegadores y el
 * recuento dejaría de significar nada.
 *
 * Que debajo haya un Android no se pierde: va en `device_model` y `os_version`,
 * que es donde se puede leer sin romper la segmentación.
 */
const PLATFORM: DevicePlatform = 'web'

/**
 * La API moderna de Chromium. No existe en Safari ni en Firefox, y en Chromium
 * el modelo sólo llega si se pide explícitamente y sólo en Android.
 */
interface UserAgentData {
  platform: string
  getHighEntropyValues?: (hints: string[]) => Promise<{
    platform?: string
    platformVersion?: string
    model?: string
  }>
}

/**
 * Recoge lo que se pueda de este navegador.
 *
 * Es `async` por `getHighEntropyValues`, que es lo único que da el modelo real
 * ("Pixel 7") en lugar de adivinarlo del user agent. Si no está disponible o
 * falla —y falla, por ejemplo, cuando la página no es un contexto seguro— se cae
 * al user agent, que siempre está.
 *
 * **Nada de esto puede tirar el registro del push.** Un modelo mal detectado es
 * una etiqueta fea en un panel de administración; una excepción aquí sería un
 * usuario sin notificaciones. De ahí el `try` que envuelve todo.
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  try {
    const uaData = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData
    const highEntropy = uaData?.getHighEntropyValues
      ? await uaData.getHighEntropyValues(['platform', 'platformVersion', 'model']).catch(() => null)
      : null

    const os = highEntropy?.platform || detectOs()
    const version = highEntropy?.platformVersion || detectOsVersion()
    const browser = detectBrowser()
    const model = highEntropy?.model || null

    return {
      platform: PLATFORM,
      device_name: `${browser} en ${os}`,
      device_model: model || `${browser} · ${os}`,
      // El nombre del sistema va dentro del valor, no solo la versión: el móvil
      // manda "Android 14" y "iOS 17.4", y un "14" suelto en la misma columna
      // no se puede leer ni comparar. Sin versión conocida queda el nombre, que
      // ya dice algo.
      os_version: version ? `${os} ${version}` : os,
    }
  } catch {
    return {
      platform: PLATFORM,
      device_name: 'web',
      device_model: null,
      os_version: null,
    }
  }
}

/** Qué navegador es. El orden importa: casi todos mienten diciendo ser Chrome. */
function detectBrowser(): string {
  const ua = navigator.userAgent

  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\/|Opera/.test(ua)) return 'Opera'
  if (/SamsungBrowser/.test(ua)) return 'Samsung Internet'
  if (/Firefox\/|FxiOS/.test(ua)) return 'Firefox'
  if (/Chrome\/|CriOS/.test(ua)) return 'Chrome'
  if (/Safari\//.test(ua)) return 'Safari'

  return 'Navegador'
}

/**
 * Qué sistema operativo hay debajo.
 *
 * El iPad es el caso raro: desde iPadOS 13 su user agent dice "Macintosh", así
 * que la única forma de distinguirlo de un Mac es que un Mac no tiene pantalla
 * táctil. Sin esa comprobación, todos los iPad se guardarían como macOS.
 */
function detectOs(): string {
  const ua = navigator.userAgent

  if (/Android/.test(ua)) return 'Android'
  if (/iPhone|iPod/.test(ua)) return 'iOS'
  if (/iPad/.test(ua)) return 'iPadOS'
  if (/Macintosh/.test(ua)) {
    return navigator.maxTouchPoints > 1 ? 'iPadOS' : 'macOS'
  }
  if (/Windows/.test(ua)) return 'Windows'
  if (/CrOS/.test(ua)) return 'ChromeOS'
  if (/Linux/.test(ua)) return 'Linux'

  return 'Escritorio'
}

/** La versión del sistema, cuando el user agent la lleva. */
function detectOsVersion(): string | null {
  const ua = navigator.userAgent

  const android = ua.match(/Android (\d+(?:\.\d+)?)/)
  if (android) return android[1]

  // iOS la separa con guiones bajos: "OS 17_4_1".
  const ios = ua.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/)
  if (ios) return ios[1].replace(/_/g, '.')

  const windows = ua.match(/Windows NT (\d+(?:\.\d+)?)/)
  if (windows) return windows[1]

  const mac = ua.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/)
  if (mac) return mac[1].replace(/_/g, '.')

  return null
}
