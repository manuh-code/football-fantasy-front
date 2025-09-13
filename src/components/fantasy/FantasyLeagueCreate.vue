<template>
    <div class="animate-page-enter grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Main Form -->
        <div class="lg:col-span-2">
            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- League Information Section -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <!-- Section Header -->
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                <v-icon name="hi-solid-trophy" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Crear Liga Fantasy</h2>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Configuración rápida para tu liga fantasy</p>
                            </div>
                        </div>
                    </div>

                    <!-- Form Fields -->
                    <div class="p-6 space-y-6">
                        <!-- League Name -->
                        <div>
                            <FormInput
                                v-model="formData.name"
                                label="Nombre de la Liga *"
                                placeholder="Ingresa el nombre de tu liga"
                                :error="getFieldError('name')"
                                :disabled="isLoading"
                            />
                        </div>

                        <!-- Football League Selection -->
                        <div>
                            <SelectComponent
                                v-model="formData.league_uuid"
                                :options="footballLeagueOptions"
                                value-key="uuid"
                                label-key="name"
                                label="Liga de Fútbol *"
                                placeholder="Selecciona una liga de fútbol"
                                :error="getFieldError('league_uuid')"
                                :disabled="isLoading || isLoadingLeagues"
                            />
                            <p v-if="isLoadingLeagues" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <v-icon name="pr-spinner" class="w-4 h-4 inline mr-1" animation="spin" />
                                Cargando ligas de fútbol...
                            </p>
                        </div>

                        <!-- Password Field -->
                        <div>
                            <FormInput
                                v-model="formData.password"
                                type="password"
                                label="Contraseña de la Liga *"
                                placeholder="Ingresa una contraseña segura"
                                :error="getFieldError('password')"
                                :disabled="isLoading"
                            />
                            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Esta contraseña será requerida para que otros se unan a tu liga
                            </p>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <ButtonComponent
                                type="submit"
                                :loading="isLoading"
                                :disabled="!isFormValid"
                                class="flex-1 sm:flex-none"
                            >
                                <v-icon name="hi-solid-plus" class="w-4 h-4 mr-2" />
                                Crear Liga
                            </ButtonComponent>
                            <ButtonComponent
                                @click="handleCancel"
                                variant="outline"
                                :disabled="isLoading"
                                class="flex-1 sm:flex-none"
                            >
                                Cancelar
                            </ButtonComponent>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <!-- League Creation Sidebar -->
        <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Sidebar Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-information-circle" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Configuración Rápida</h3>
                    </div>
                </div>

                <!-- Sidebar Content -->
                <div class="p-6 space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-check" class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Creación Simplificada</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Solo 3 campos para comenzar tu liga rápidamente</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-lock-closed" class="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Privada por Defecto</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Tu liga será privada y requerirá contraseña para unirse</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-cog" class="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Configuración Automática</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Se aplicarán configuraciones estándar de fantasy automáticamente</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-users" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Lista para Invitar</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Comparte la contraseña de tu liga con amigos para comenzar</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Progress -->
            <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-chart-bar" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Progreso del Formulario</h3>
                    </div>
                </div>

                <div class="p-6">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Nombre de Liga</span>
                            <span class="text-xs font-medium" :class="formData.name.trim() ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'">
                                {{ formData.name.trim() ? 'Completo' : 'Pendiente' }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Liga de Fútbol</span>
                            <span class="text-xs font-medium" :class="formData.league_uuid ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'">
                                {{ formData.league_uuid ? 'Completo' : 'Pendiente' }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Contraseña</span>
                            <span class="text-xs font-medium" :class="formData.password.trim() ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'">
                                {{ formData.password.trim() ? 'Completo' : 'Pendiente' }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-900 dark:text-white">Progreso General</span>
                            <span class="text-sm font-medium" :class="isFormValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'">
                                {{ Math.round((completedFields / 3) * 100) }}%
                            </span>
                        </div>
                        <div class="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                class="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                :style="{ width: `${Math.round((completedFields / 3) * 100)}%` }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useValidationStore } from '@/store/validation/useValidationStore'
import { ButtonComponent, FormInput, SelectComponent } from '@/components/ui'
import { catalogService } from '@/services/catalog/CatalogService'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { FantasyLeagueCreatePayload } from '@/interfaces/fantasy/leagues/FantasyLeagueCreatePayload'
import type { FootballLeagueResponse } from '@/interfaces/football/league/FootballLeagueResponse'

// Composables
const router = useRouter()
const toast = useToast()
const validationStore = useValidationStore()

// State
const isLoading = ref(false)
const isLoadingLeagues = ref(false)
const footballLeagues = ref<FootballLeagueResponse[]>([])

// Simplified form data - only required fields
const formData = reactive<FantasyLeagueCreatePayload>({
    name: '',
    league_uuid: '',
    password: ''
})

// Computed properties
const footballLeagueOptions = computed(() => {
    return footballLeagues.value.map(league => ({
        uuid: league.uuid,
        name: league.name,
        image_path: league.image_path
    }))
})

const isFormValid = computed(() => {
    return formData.name.trim() &&
           formData.league_uuid.trim() &&
           formData.password.trim()
})

const completedFields = computed(() => {
    let count = 0
    if (formData.name.trim()) count++
    if (formData.league_uuid.trim()) count++
    if (formData.password.trim()) count++
    return count
})

// Validation helpers
const getFieldError = (fieldName: string) => {
    const errors = validationStore.getFieldError(fieldName)
    return Array.isArray(errors) ? errors.join(', ') : errors || ''
}

// Methods
const loadFootballLeagues = async () => {
    isLoadingLeagues.value = true
    try {
        footballLeagues.value = await catalogService.getFootballLeagues()
    } catch (error) {
        console.error('Error loading football leagues:', error)
        toast.error('Error', 'No se pudieron cargar las ligas de fútbol. Por favor intenta de nuevo.')
    } finally {
        isLoadingLeagues.value = false
    }
}

const handleSubmit = async () => {
    validationStore.clearValidatorError()
    isLoading.value = true

    try {
        // Create the payload with only the required fields
        const payload: FantasyLeagueCreatePayload = {
            name: formData.name.trim(),
            league_uuid: formData.league_uuid,
            password: formData.password.trim()
        }

        const response = await fantasyLeagueService.storeFantasyLeague(payload)
        
        toast.success('¡Éxito!', `Liga "${response.name}" ha sido creada exitosamente!`)
        
        // Redirect to the league details or user leagues page
        router.push({ name: 'userFantasyLeague' })
    
    } catch (error) {
        console.error('Error creating fantasy league:', error)
        // Los errores 422 ya son manejados por el interceptor en useApiFantasy
        // y almacenados en el validationStore, por lo que no necesitamos hacer nada más aquí
    } finally {
        isLoading.value = false
    }
}

const handleCancel = () => {
    router.push({ name: 'userFantasyLeague' })
}

// Lifecycle
onMounted(async () => {
    await loadFootballLeagues()
})
</script>

<style scoped>
/* Custom styles for better UX */
.animate-page-enter {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>