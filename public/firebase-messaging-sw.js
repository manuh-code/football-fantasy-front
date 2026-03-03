// Firebase Messaging Service Worker
// Este archivo maneja las notificaciones push cuando la app está en background
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

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload)

  const notificationTitle = payload.notification?.title || '🏈 Football Fantasy'
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: payload.notification?.icon || '/img/icons/android-chrome-192x192.png',
    badge: '/img/icons/badge-72x72.png',
    tag: payload.data?.type || 'general',
    data: payload.data || {},
    actions: [],
    vibrate: [200, 100, 200],
    requireInteraction: true,
  }

  // Agregar acciones según el tipo de notificación
  if (payload.data?.type === 'draft_activated') {
    notificationOptions.actions = [
      { action: 'enter_draft', title: '🎯 Entrar al Draft' },
      { action: 'dismiss', title: 'Después' },
    ]
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data || {}
  let url = '/'

  if (event.action === 'enter_draft' && data.league_uuid) {
    url = `/fantasy/league/${data.league_uuid}/draft`
  } else if (data.url) {
    url = data.url
  }

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