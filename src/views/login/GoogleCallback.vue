<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store';
import { ButtonComponent } from '@/components/ui';

const router = useRouter();
const authStore = useAuthStore();

const hasError = ref(false);

const authenticate = async () => {
  hasError.value = false;
  try {
    // Only the query params Google appended (the OAuth code + state) are needed.
    const queryString = window.location.search;
    await authStore.loginWithGoogle(queryString);

    // Restore the page the user was headed to before the OAuth round-trip
    // (e.g. a shared invite link /pools?join=CODE). Falls back to the gaming hub.
    const redirect = sessionStorage.getItem('post_auth_redirect');
    sessionStorage.removeItem('post_auth_redirect');
    router.push(redirect || '/gaming');
  } catch (error) {
    console.error('Falló el login', error);
    hasError.value = true;
  }
};

const goToLogin = () => {
  router.push('/login');
};

onMounted(authenticate);
</script>

<template>
  <div class="callback-page">
    <!-- Decorative emerald glow backdrop (matches the login screen) -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div class="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
    </div>

    <div
      class="callback-card relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10"
    >
      <!-- Loading state -->
      <div v-if="!hasError" class="flex flex-col items-center text-center">
        <!-- Google badge wrapped in a spinning emerald ring -->
        <div class="relative w-20 h-20 mb-7 flex items-center justify-center">
          <div
            class="loader-ring absolute inset-0 rounded-full border-[3px] border-emerald-500/15 dark:border-emerald-400/10 border-t-emerald-500 dark:border-t-emerald-400"
          />
          <div
            class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            <v-icon name="bi-google" class="w-6 h-6 text-white" />
          </div>
        </div>

        <h1 class="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {{ $t('auth.googleCallback.title') }}
        </h1>
        <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          {{ $t('auth.googleCallback.subtitle') }}
        </p>

        <!-- Bouncing dots -->
        <div class="mt-7 flex items-center justify-center gap-1.5" aria-hidden="true">
          <span class="dot" />
          <span class="dot" />
          <span class="dot" />
        </div>
      </div>

      <!-- Error state -->
      <div v-else class="flex flex-col items-center text-center">
        <div
          class="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5"
        >
          <v-icon
            name="hi-solid-exclamation-circle"
            class="w-8 h-8 text-red-500 dark:text-red-400"
          />
        </div>

        <h1 class="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {{ $t('auth.googleCallback.errorTitle') }}
        </h1>
        <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          {{ $t('auth.googleCallback.errorSubtitle') }}
        </p>

        <div class="mt-7 w-full">
          <ButtonComponent
            variant="primary"
            size="md"
            icon="hi-solid-arrow-left"
            :always-full-width="true"
            :text="$t('auth.googleCallback.backToLogin')"
            @click="goToLogin"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh; /* respects mobile browser chrome */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Subtle entrance: fade + lift (matches the login card) */
.callback-card {
  animation: callback-enter 0.4s cubic-bezier(0.32, 0.72, 0, 1) both;
}

@keyframes callback-enter {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.loader-ring {
  animation: loader-spin 0.9s linear infinite;
}

@keyframes loader-spin {
  to {
    transform: rotate(360deg);
  }
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: rgb(16 185 129); /* emerald-500 */
  animation: dot-bounce 1.4s ease-in-out infinite both;
}
.dot:nth-child(1) {
  animation-delay: -0.32s;
}
.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.35;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .callback-card {
    animation: none;
  }
  .loader-ring,
  .dot {
    animation: none;
  }
}
</style>
