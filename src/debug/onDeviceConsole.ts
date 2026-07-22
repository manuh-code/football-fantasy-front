/**
 * On-device console for devices where remote debugging isn't available
 * (e.g. an iOS PWA on a phone with no Mac to run Safari's Web Inspector).
 *
 * Opt-in only, persisted per-origin in localStorage so it survives relaunching
 * the installed PWA from the home screen icon (which always opens the
 * manifest's start_url, ignoring query strings):
 *
 *   1. Open the site in mobile Safari (not the installed icon) once, at
 *      https://<host>/?debug=1 — this sets the flag and reloads.
 *   2. From then on, opening the installed PWA icon shows a floating button
 *      (bottom-right) that expands into a console/network/elements panel.
 *   3. Visit .../?debug=0 to turn it back off.
 */
const STORAGE_KEY = 'fmx_debug'

function readFlagFromUrlAndPersist(): boolean | null {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('debug')) return null

  const enabled = params.get('debug') === '1'
  if (enabled) {
    localStorage.setItem(STORAGE_KEY, '1')
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }

  // Strip the query param so it doesn't linger in the address bar/history.
  params.delete('debug')
  const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`
  window.history.replaceState({}, '', cleanUrl)

  return enabled
}

export async function initOnDeviceConsole(): Promise<void> {
  const fromUrl = readFlagFromUrlAndPersist()
  const enabled = fromUrl ?? localStorage.getItem(STORAGE_KEY) === '1'
  if (!enabled) return

  const eruda = (await import('eruda')).default
  eruda.init()
}
