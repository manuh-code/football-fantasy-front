import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAl3be7iO35vuAW_Hi2RL3ODAeSrWguQbc",
  authDomain: "fantasymx-3c6de.firebaseapp.com",
  projectId: "fantasymx-3c6de",
  storageBucket: "fantasymx-3c6de.firebasestorage.app",
  messagingSenderId: "681526312308",
  appId: "1:681526312308:web:c2d7e7f735ce69e6068021",
  measurementId: "G-5EZKWCYGVJ"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);

// Obtener instancia de messaging
export const messaging = getMessaging(app);

// Clave VAPID válida - necesitas obtener esta clave desde tu consola de Firebase
// Ve a: Configuración del proyecto > Cloud Messaging > Configuración web > Certificados web push
export const VAPID_KEY = "BKqQZ0-gy3gIuGFRzZMmCeQM2UH8HZOnvaTSbIN134I_ejemplo"; // Esta es una clave de ejemplo