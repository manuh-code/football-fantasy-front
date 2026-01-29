<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Global Menu -->
    <MenuGlobal />

    <!-- Global Football League Selection Modal -->
    <FootballLeagueSelectionModal :isVisible="showLeagueModal" @close="showLeagueModal = false" />

    <main class="flex-1 pt-14 sm:pt-16">
      <router-view />
    </main>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import MenuGlobal from '@/components/MenuGlobal.vue'
import { ToastContainer } from '@/components/ui'
import FootballLeagueSelectionModal from '@/components/football/leagues/FootballLeagueSelectionModal.vue'
import { useThemeStore } from './store/theme'
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'
import FootballFixtureService from "@/services/football/fixture/FootballFixtureService";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAl3be7iO35vuAW_Hi2RL3ODAeSrWguQbc",
  authDomain: "fantasymx-3c6de.firebaseapp.com",
  projectId: "fantasymx-3c6de",
  storageBucket: "fantasymx-3c6de.firebasestorage.app",
  messagingSenderId: "681526312308",
  appId: "1:681526312308:web:c2d7e7f735ce69e6068021",
  measurementId: "G-5EZKWCYGVJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);




// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
const messaging = getMessaging();

onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // ...
});

getToken(messaging, { vapidKey: 'BL0hrW6dbGIyY-RqclFlBT0DiP6WPl7Zzy4pNrl_IfeFmjIM4IBYmkhECBKGSTh8wrLpczYLRLhsC0kcC-9-yzE' }).then((currentToken) => {
  if (currentToken) {
    // Send the token to your server and update the UI if necessary
    console.log('current token for client: ', currentToken);
  } else {
    // Show permission request UI
    console.log('No registration token available. Request permission to generate one.');
    // ...
  }
}).catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
  // ...
});




const themeStore = useThemeStore();
const store = useFootballLeagueStore()
const router = useRouter()
const showLeagueModal = ref(false)

// Función para verificar y mostrar modal si no hay liga seleccionada
const checkLeagueSelection = () => {
  if (!store.existLeague()) {
    showLeagueModal.value = true
  }
}

onMounted(() => {
  FootballFixtureService.getCurrentFixtures(); // Fetch current fixtures on app mount
  // Initialize theme on app mount
  themeStore.initTheme()
  // Show league selection modal when no league is selected
  checkLeagueSelection()
})

// Watcher para cuando se selecciona una liga
watch(
  () => store.getLeague,
  (newLeague) => {
    if (newLeague) showLeagueModal.value = false
  }
)

// Watcher para cambios de ruta - verificar liga seleccionada
watch(
  () => router.currentRoute.value.path,
  () => {
    // Verificar si hay liga seleccionada cada vez que cambie de ruta
    checkLeagueSelection()
  }
)
</script>


<style lang="scss">
// Import Inter font from Google Fonts
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

#app {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'rlig' 1, 'calt' 1;
}

// Ensure the app takes full height
html,
body,
#app {
  height: 100%;
}

// Custom scrollbar for webkit browsers
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-hover);
  border-radius: 4px;

  &:hover {
    background: var(--color-text-muted);
  }
}
</style>
