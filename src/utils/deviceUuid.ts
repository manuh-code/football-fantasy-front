import { v4 as uuidv4 } from 'uuid'

const DEVICE_UUID_KEY = 'ff_device_uuid'

/**
 * Obtiene o genera un UUID único para este dispositivo/navegador.
 * Se persiste en localStorage para que sobreviva entre sesiones.
 */
export function getDeviceUuid(): string {
  let uuid = localStorage.getItem(DEVICE_UUID_KEY)

  if (!uuid) {
    uuid = uuidv4()
    localStorage.setItem(DEVICE_UUID_KEY, uuid)
  }

  return uuid
}