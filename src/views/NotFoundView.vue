<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goBack() {
  router.go(-1)
}
</script>

<template>
  <div class="not-found min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full text-center px-4">
      <!-- 404 Illustration -->
      <div class="mb-8">
        <div class="text-8xl font-bold text-primary-600 dark:text-primary-400 mb-4">
          404
        </div>
        <div class="w-24 h-24 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
          <v-icon name="hi-solid-question-mark-circle" class="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </div>
      </div>

      <!-- Error Message -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Página no encontrada
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-4">
        <button
          @click="goHome"
          class="w-full btn bg-primary-600 hover:bg-primary-700 text-white py-3"
        >
          <v-icon name="hi-solid-home" class="w-5 h-5 mr-2" />
          Ir al inicio
        </button>
        
        <button
          @click="goBack"
          class="w-full btn btn-outline border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 py-3"
        >
          <v-icon name="hi-solid-arrow-left" class="w-5 h-5 mr-2" />
          Volver atrás
        </button>
      </div>

      <!-- Additional Help -->
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          ¿Necesitas ayuda? Contáctanos
        </p>
        <div class="flex justify-center space-x-4">
          <button class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
            <v-icon name="hi-solid-mail" class="w-4 h-4 inline mr-1" />
            Soporte
          </button>
          <button class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
            <v-icon name="hi-solid-chat-alt" class="w-4 h-4 inline mr-1" />
            Chat
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
