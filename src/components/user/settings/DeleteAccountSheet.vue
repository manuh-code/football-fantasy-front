<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('user.settings.deleteAccount.title')"
    :subtitle="$t('user.settings.deleteAccount.subtitle')"
    icon="hi-solid-exclamation"
    icon-variant="red"
    size="auto"
    :dismissible="!isLoading"
    @close="close"
  >
    <div class="space-y-4">
      <!-- Qué pasa exactamente al borrar. Va antes del campo, no después: el
           usuario tiene que poder echarse atrás ANTES de escribir nada. -->
      <div class="rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3">
        <p class="text-sm text-red-700 dark:text-red-300">
          {{ $t('user.settings.deleteAccount.warning') }}
        </p>
      </div>

      <ul class="space-y-2">
        <li
          v-for="item in consequences"
          :key="item"
          class="flex gap-2 text-xs text-gray-600 dark:text-gray-400"
        >
          <v-icon name="hi-solid-minus-sm" class="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{{ item }}</span>
        </li>
      </ul>

      <FormInput
        id="delete-account-password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        :label="$t('user.settings.deleteAccount.passwordLabel')"
        icon="hi-solid-lock-closed"
        :placeholder="$t('user.settings.deleteAccount.passwordPlaceholder')"
        :error="passwordError"
        :disabled="isLoading"
        @keyup.enter="handleDelete"
      />

      <!-- Escribir la palabra es el segundo cerrojo. La contraseña demuestra
           quién eres; esto demuestra que has leído lo de arriba. -->
      <FormInput
        id="delete-account-confirmation"
        v-model="confirmation"
        type="text"
        :label="$t('user.settings.deleteAccount.confirmLabel', { word: confirmWord })"
        icon="hi-solid-pencil"
        :placeholder="confirmWord"
        :disabled="isLoading"
        @keyup.enter="handleDelete"
      />

      <p v-if="generalError" class="text-sm text-red-600 dark:text-red-400">
        {{ generalError }}
      </p>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button
          @click="close"
          :disabled="isLoading"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {{ $t('common.actions.cancel') }}
        </button>
        <button
          @click="handleDelete"
          :disabled="!canDelete"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 active:scale-[0.98] shadow-sm shadow-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <div v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <v-icon v-else name="hi-solid-trash" class="w-4 h-4" />
          {{ $t('user.settings.deleteAccount.confirmAction') }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
/**
 * Confirmación para borrar la cuenta.
 *
 * Dos cerrojos, y hacen cosas distintas: la **contraseña** la exige el API y
 * demuestra quién pide el borrado; escribir la **palabra** no la exige nadie y
 * demuestra que has leído lo que va a pasar. La segunda es la que evita el
 * borrado por accidente, que es el error frecuente aquí — nadie se equivoca
 * escribiendo su contraseña, pero sí tocando un botón rojo sin leer.
 *
 * Al terminar no navega ni cierra sesión por su cuenta: emite `deleted` y lo
 * decide quien lo abrió, porque el token ya no vale y hay que limpiar la sesión
 * en un solo sitio.
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AxiosError } from 'axios'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { FormInput } from '@/components/ui'
import { UserService } from '@/services/user/UserService'

const props = withDefaults(
  defineProps<{
    isVisible?: boolean
  }>(),
  { isVisible: false }
)

const emit = defineEmits<{
  close: []
  deleted: []
}>()

const { t } = useI18n()
const userService = new UserService()

const password = ref('')
const confirmation = ref('')
const isLoading = ref(false)
const passwordError = ref('')
const generalError = ref('')

/**
 * La palabra a escribir viene de las traducciones, no del código: en inglés es
 * "DELETE" y en español "BORRAR", y pedir una palabra inglesa a quien tiene la
 * app en español convierte la comprobación en un acertijo.
 */
const confirmWord = computed(() => t('user.settings.deleteAccount.confirmWord'))

const consequences = computed<string[]>(() => [
  t('user.settings.deleteAccount.consequences.profile'),
  t('user.settings.deleteAccount.consequences.subscription'),
  t('user.settings.deleteAccount.consequences.leagues'),
  t('user.settings.deleteAccount.consequences.irreversible'),
])

const canDelete = computed(
  () =>
    !isLoading.value &&
    password.value.trim().length > 0 &&
    confirmation.value.trim().toUpperCase() === confirmWord.value.toUpperCase()
)

// Al cerrar y volver a abrir no se arrastra lo escrito antes: una contraseña
// medio tecleada esperando en un formulario de borrado no debe sobrevivir.
watch(
  () => props.isVisible,
  (visible) => {
    if (!visible) reset()
  }
)

function reset() {
  password.value = ''
  confirmation.value = ''
  passwordError.value = ''
  generalError.value = ''
}

function close() {
  if (isLoading.value) return
  emit('close')
}

async function handleDelete() {
  if (!canDelete.value) return

  isLoading.value = true
  passwordError.value = ''
  generalError.value = ''

  try {
    await userService.deleteAccount({ current_password: password.value })
    emit('deleted')
  } catch (error) {
    // El 422 de Laravel se salta el sobre del API y llega como
    // `{ message, errors: { campo: [...] } }`.
    const response = (error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>).response
    const fieldError = response?.data?.errors?.current_password?.[0]

    if (fieldError) {
      passwordError.value = fieldError
    } else {
      generalError.value = response?.data?.message ?? t('user.settings.deleteAccount.genericError')
    }
  } finally {
    isLoading.value = false
  }
}
</script>
