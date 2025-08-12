<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <div>
                <router-link to="/user-fantasy-leagues" class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                  <v-icon name="hi-solid-home" class="flex-shrink-0 h-5 w-5" />
                  <span class="sr-only">Fantasy Leagues</span>
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <v-icon name="hi-solid-chevron-right" class="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span class="ml-4 text-sm font-medium text-gray-900 dark:text-white">Create League</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div class="mt-4">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create Fantasy League</h1>
          <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Set up a new fantasy football league and invite your friends to compete.
          </p>
        </div>
      </div>

      <!-- Coming Soon Card -->
      <div class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 md:p-12 text-center border border-gray-200 dark:border-gray-700">
        <div class="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mx-auto mb-6 flex items-center justify-center">
          <v-icon name="hi-solid-plus" class="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Create League Feature
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
          This feature is currently under development. Soon you'll be able to create and customize your own fantasy football leagues.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <ButtonComponent
            variant="primary"
            @click="goBack"
          >
            <v-icon name="hi-solid-arrow-left" class="w-4 h-4 mr-2" />
            Back to My Leagues
          </ButtonComponent>
          
          <ButtonComponent
            variant="secondary"
            @click="notifyWhenReady"
          >
            <v-icon name="hi-solid-bell" class="w-4 h-4 mr-2" />
            Notify When Ready
          </ButtonComponent>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { ButtonComponent } from '@/components/ui'

const router = useRouter()
const toast = useToast()

const goBack = () => {
  router.push('/user-fantasy-leagues')
}

const notifyWhenReady = () => {
  toast.success('Notification Set!', 'We\'ll notify you when the create league feature is available.')
}
</script>
