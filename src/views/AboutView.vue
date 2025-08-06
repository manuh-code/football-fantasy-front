<script lang="ts" setup>
import { ref } from 'vue'

const teamInfo = ref([
  {
    name: 'Vue.js 3',
    description: 'Framework progresivo para construir interfaces de usuario',
    icon: 'hi-solid-code',
    color: 'text-green-600 dark:text-green-400'
  },
  {
    name: 'TypeScript',
    description: 'JavaScript tipado para mejor desarrollo',
    icon: 'hi-solid-shield-check',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    name: 'Tailwind CSS',
    description: 'Framework CSS utilitario para diseño rápido',
    icon: 'hi-solid-sparkles',
    color: 'text-cyan-600 dark:text-cyan-400'
  },
  {
    name: 'Pinia',
    description: 'Store intuitivo y tipado para Vue',
    icon: 'hi-solid-database',
    color: 'text-yellow-600 dark:text-yellow-400'
  },
  {
    name: 'PWA',
    description: 'Aplicación web progresiva para mejor experiencia',
    icon: 'hi-solid-device-mobile',
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    name: 'SASS',
    description: 'Preprocesador CSS para estilos avanzados',
    icon: 'hi-solid-color-swatch',
    color: 'text-pink-600 dark:text-pink-400'
  }
])

const features = ref([
  'Diseño responsivo y accesible',
  'Modo oscuro y claro automático',
  'Optimizado para rendimiento',
  'Instalable como aplicación nativa',
  'Componentes modulares y reutilizables',
  'Tipado completo con TypeScript'
])
</script>

<template>
  <div class="about">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Acerca de Football Fantasy
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Una aplicación web moderna construida con las mejores tecnologías para ofrecerte 
          la mejor experiencia en fantasy football.
        </p>
        <div class="flex justify-center">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div class="flex items-center space-x-4">
              <v-icon name="hi-solid-star" class="w-8 h-8 text-yellow-500" />
              <div class="text-left">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">v1.0.0</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Versión actual</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Technology Stack -->
    <section class="py-20 bg-white dark:bg-gray-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Stack Tecnológico
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Construido con tecnologías modernas y probadas
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="tech in teamInfo"
            :key="tech.name"
            class="card p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <v-icon :name="tech.icon" :class="`w-8 h-8 ${tech.color}`" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {{ tech.name }}
                </h3>
                <p class="text-gray-600 dark:text-gray-300 text-sm">
                  {{ tech.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-20 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Características Destacadas
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Todo lo que necesitas para una experiencia excepcional
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="feature in features"
            :key="feature"
            class="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
          >
            <v-icon name="hi-solid-check-circle" class="w-6 h-6 text-green-500 flex-shrink-0" />
            <span class="text-gray-700 dark:text-gray-300">{{ feature }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact/Info Section -->
    <section class="py-20 bg-primary-600 dark:bg-primary-800">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          ¿Tienes alguna pregunta?
        </h2>
        <p class="text-xl text-primary-100 mb-8">
          Estamos aquí para ayudarte con cualquier duda sobre la aplicación
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button class="btn bg-white text-primary-600 hover:bg-gray-100 px-6 py-3">
            <v-icon name="hi-solid-mail" class="w-5 h-5 mr-2" />
            Contactar Soporte
          </button>
          <button class="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-6 py-3">
            <v-icon name="hi-solid-book-open" class="w-5 h-5 mr-2" />
            Ver Documentación
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.about {
  min-height: calc(100vh - 4rem); // Subtract nav height
}

// Hover animations
.card:hover {
  transform: translateY(-4px);
}
</style>
