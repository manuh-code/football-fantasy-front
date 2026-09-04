// Firebase Messaging Service Worker
// Este archivo maneja el click de las notificaciones push y registra el SDK,
// que es quien las pinta cuando la app está en background.
// NOTA: Los Service Workers NO tienen acceso a import.meta.env de Vite,
// por eso la config de Firebase se hardcodea aquí (son valores públicos).

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAEjs3gv6dWz7MIQLuTCFSdlg6dsGxVESU',
  authDomain: 'fantasymx-c3536.firebaseapp.com',
  projectId: 'fantasymx-c3536',
  storageBucket: 'fantasymx-c3536.firebasestorage.app',
  messagingSenderId: '1029023891951',
  appId: '1:1029023891951:web:359e674a8d4a413315f61a',
})

// Clave bajo la que el SDK guarda el mensaje original dentro de
// `notification.data` cuando es él quien pinta el aviso.
const FCM_MSG = 'FCM_MSG'

/**
 * El `data` que mandó el backend, venga como venga.
 *
 * Si el aviso lo pintó el SDK, lo que hay en `notification.data` es el mensaje
 * entero envuelto bajo `FCM_MSG`; si lo pintó alguien más, es el `data` a
 * secas. Se leen los dos para no depender de quién lo haya creado.
 */
function readNotificationData(notification) {
  const raw = notification?.data ?? {}

  return raw[FCM_MSG]?.data ?? raw
}

/**
 * OJO AL ORDEN: este listener se registra ANTES de `firebase.messaging()`.
 *
 * El SDK registra el suyo propio al crear la instancia, y lo primero que hace
 * al recibir un click es `stopImmediatePropagation()` — o sea, mata a todos los
 * listeners registrados después del suyo. Poniéndolo antes, corremos primero y
 * somos nosotros quienes cortamos: si dejáramos actuar también al del SDK,
 * abriría o enfocaría la ventana por su cuenta y mandaría al cliente un mensaje
 * con otra forma, que `App.vue` no entiende.
 */
self.addEventListener('notificationclick', (event) => {
  event.stopImmediatePropagation()
  event.notification.close()

  const data = readNotificationData(event.notification)
  const url = data.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, navegar en ella
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus()
          client.postMessage({ type: 'NOTIFICATION_CLICK', url, data })
          return
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      return clients.openWindow(url)
    })
  )
})

/**
 * Y aquí se registra el listener de `push` del SDK, que es quien pinta el aviso
 * en background a partir del bloque `webpush.notification` que manda el backend
 * (título, cuerpo, icono, badge, tag, vibración).
 *
 * NO se registra `onBackgroundMessage`. El SDK pinta el aviso Y ADEMÁS llama a
 * ese handler, así que pintar también ahí —como se hacía antes— daba dos
 * notificaciones por cada push: la del SDK, sin tag, apilándose, y la nuestra.
 * Lo que el service worker añadía a mano vive ahora en `FirebasePushService`
 * del backend, que es el único sitio desde el que se puede controlar.
 */
firebase.messaging()
