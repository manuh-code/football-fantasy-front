<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('invitation.invite.title')"
    :subtitle="subtitle"
    icon="hi-solid-mail"
    icon-variant="blue"
    size="lg"
    role="dialog"
    autofocus
    @close="close"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label
          for="invite-email"
          class="block text-footnote font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {{ $t("invitation.invite.emailLabel") }}
        </label>
        <input
          id="invite-email"
          ref="emailInput"
          v-model="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          :placeholder="$t('invitation.invite.emailPlaceholder')"
          :aria-invalid="!!emailError"
          :aria-describedby="emailError ? 'invite-email-error' : 'invite-email-hint'"
          class="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-150 focus:outline-none focus:ring-2"
          :class="
            emailError
              ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500/50'
              : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/50'
          "
          :disabled="isSending"
        />

        <!-- El error va pegado al campo, no arriba del formulario -->
        <p
          v-if="emailError"
          id="invite-email-error"
          class="mt-1.5 text-footnote text-red-600 dark:text-red-400"
        >
          {{ emailError }}
        </p>
        <p
          v-else
          id="invite-email-hint"
          class="mt-1.5 text-footnote leading-relaxed text-gray-500 dark:text-gray-400"
        >
          {{ $t("invitation.invite.hint") }}
        </p>
      </div>

      <!-- Enviada: confirmación en el sitio, sin cerrar la hoja, para poder
           invitar a varias personas seguidas. -->
      <p
        v-if="lastSentTo"
        class="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 text-footnote text-emerald-700 dark:text-emerald-400"
      >
        <v-icon name="hi-solid-check-circle" class="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <span>{{ $t("invitation.invite.sent", { email: lastSentTo }) }}</span>
      </p>
    </form>

    <!-- Pendientes -->
    <section class="mt-6">
      <h3 class="text-2xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {{ $t("invitation.invite.pending.title") }}
      </h3>

      <p
        v-if="!isLoadingPending && !pending.length"
        class="mt-2 text-footnote text-gray-500 dark:text-gray-400"
      >
        {{ $t("invitation.invite.pending.empty") }}
      </p>

      <ul v-else class="mt-2 flex flex-col gap-1">
        <li
          v-for="invitation in pending"
          :key="invitation.uuid"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60"
        >
          <div class="flex-1 min-w-0">
            <p class="text-footnote font-medium text-gray-900 dark:text-white truncate">
              {{ invitation.email }}
            </p>
            <p
              v-if="invitation.expires_at"
              class="text-2xs text-gray-500 dark:text-gray-400"
            >
              {{ $t("invitation.invite.pending.expires", { date: formatDate(invitation.expires_at) }) }}
            </p>
          </div>

          <button
            type="button"
            class="w-11 h-11 -mr-2 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-90 transition-all duration-150 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
            :aria-label="$t('invitation.invite.pending.cancel')"
            :title="$t('invitation.invite.pending.cancel')"
            :disabled="cancellingUuid === invitation.uuid"
            @click="cancel(invitation.uuid)"
          >
            <v-icon name="md-cancel" class="w-4 h-4" />
          </button>
        </li>
      </ul>
    </section>

    <template #footer>
      <button
        type="button"
        class="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white text-callout font-semibold transition-all duration-150 disabled:opacity-60 disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        :disabled="isSending || !email.trim()"
        @click="submit"
      >
        {{ isSending ? $t("invitation.invite.sending") : $t("invitation.invite.send") }}
      </button>
    </template>
  </BottomSheet>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import InvitationService from "@/services/invitation/InvitationService";
import { useValidationStore } from "@/store";
import {
  InvitableType,
  Invitation,
} from "@/interfaces/invitation/Invitation";

const props = defineProps<{
  isVisible: boolean;
  invitableType: InvitableType;
  invitableUuid: string;
  /** Lugares libres, para avisar antes de gastar una invitación. */
  spotsLeft?: number;
}>();

const emit = defineEmits<{ close: []; sent: [invitation: Invitation] }>();

const { t, locale } = useI18n();
const validationStore = useValidationStore();

const email = ref("");
const isSending = ref(false);
const lastSentTo = ref("");
const pending = ref<Invitation[]>([]);
const isLoadingPending = ref(false);
const cancellingUuid = ref("");
const emailInput = ref<HTMLInputElement | null>(null);

const subtitle = computed(() => {
  if (typeof props.spotsLeft === "number" && props.spotsLeft <= 0) {
    return t("invitation.invite.noSpots");
  }
  if (typeof props.spotsLeft === "number") {
    return t(
      "invitation.invite.spotsLeft",
      { count: props.spotsLeft },
      props.spotsLeft,
    );
  }
  return props.invitableType === "pool_group"
    ? t("invitation.invite.subtitlePool")
    : t("invitation.invite.subtitleLeague");
});

/**
 * El backend valida sobre `email` o sobre `invitable_uuid` según el motivo
 * (correo ya invitado vs. liga cerrada). Los dos se enseñan bajo el campo: es
 * el único sitio donde el usuario está mirando.
 */
const emailError = computed(
  () =>
    validationStore.getFieldError("email")[0] ||
    validationStore.getFieldError("invitable_uuid")[0] ||
    "",
);

watch(
  () => props.isVisible,
  async (visible) => {
    if (!visible) return;

    email.value = "";
    lastSentTo.value = "";
    validationStore.clearValidatorError();
    await loadPending();
    await nextTick();
    emailInput.value?.focus();
  },
);

async function loadPending(): Promise<void> {
  isLoadingPending.value = true;
  try {
    pending.value = await InvitationService.listPending(
      props.invitableType,
      props.invitableUuid,
    );
  } catch {
    pending.value = [];
  } finally {
    isLoadingPending.value = false;
  }
}

async function submit(): Promise<void> {
  const value = email.value.trim();
  if (!value || isSending.value) return;

  isSending.value = true;
  validationStore.clearValidatorError();

  try {
    const invitation = await InvitationService.invite({
      invitable_type: props.invitableType,
      invitable_uuid: props.invitableUuid,
      email: value,
    });

    lastSentTo.value = invitation.email;
    email.value = "";
    pending.value = [invitation, ...pending.value];
    emit("sent", invitation);
  } catch {
    // El interceptor ya dejó el detalle en el store de validación y mostró el
    // toast; aquí sólo hay que no cerrar la hoja.
  } finally {
    isSending.value = false;
  }
}

async function cancel(uuid: string): Promise<void> {
  cancellingUuid.value = uuid;
  try {
    await InvitationService.cancel(uuid);
    pending.value = pending.value.filter((item) => item.uuid !== uuid);
  } finally {
    cancellingUuid.value = "";
  }
}

function formatDate(raw: string): string {
  const date = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return raw;

  return date.toLocaleDateString(locale.value, {
    day: "numeric",
    month: "short",
  });
}

function close(): void {
  validationStore.clearValidatorError();
  emit("close");
}
</script>
