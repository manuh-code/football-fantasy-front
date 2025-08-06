<script lang="ts" setup>
import { ref } from 'vue'
import HelloWorld from '@/components/HelloWorld.vue'

const appTitle = ref('Football Fantasy')
const appDescription = ref('Tu aplicación de fantasy football moderna y responsiva')
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in">
            {{ appTitle }}
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up">
            {{ appDescription }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <button class="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg">
              <VIcon name="hi-solid-play" class="w-5 h-5 mr-2" />
              Comenzar
            </button>
            <button class="btn btn-outline border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-3 text-lg">
              <VIcon name="hi-solid-information-circle" class="w-5 h-5 mr-2" />
              Más información
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Características principales
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Descubre todas las funcionalidades que hacen de Football Fantasy la mejor experiencia
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="card p-8 text-center hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <VIcon name="hi-solid-chart-bar" class="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Estadísticas Avanzadas
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Análisis detallado de rendimiento de jugadores y equipos con datos en tiempo real
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="card p-8 text-center hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <VIcon name="hi-solid-users" class="w-8 h-8 text-success-600 dark:text-success-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Ligas Privadas
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Crea ligas personalizadas con tus amigos y compite por la gloria
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="card p-8 text-center hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <VIcon name="hi-solid-device-mobile" class="w-8 h-8 text-warning-600 dark:text-warning-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aplicación Móvil
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Experiencia optimizada para dispositivos móviles con instalación PWA
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Component -->
    <section class="py-20 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HelloWorld msg="¡Bienvenido a Football Fantasy!" />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home {
  min-height: calc(100vh - 4rem); // Subtract nav height
}

// Custom animations
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out 0.2s both;
}
</style>
