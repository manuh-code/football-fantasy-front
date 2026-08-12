<template>
  <div class="min-h-[70vh] flex items-start justify-center px-4 pt-16 sm:pt-24 pb-12">
    <div class="w-full max-w-md">
      <!-- Cargando -->
      <div
        v-if="isLoading"
        class="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 animate-pulse"
        aria-hidden="true"
      >
        <div class="h-3 w-28 rounded bg-gray-200 dark:bg-gray-800" />
        <div class="mt-4 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
        <div class="mt-3 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
        <div class="mt-8 h-11 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>

      <!-- Enlace muerto: vencido, cancelado o inventado -->
      <div
        v-else-if="!invitation"
        class="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 text-center"
      >
        <div
          class="mx-auto w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          aria-hidden="true"
        >
          <v-icon name="hi-solid-exclamation-circle" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
        </div>
        <h1 class="mt-4 text-lg font-bold text-gray-900 dark:text-white">
          {{ $t("invitation.accept.invalidTitle") }}
        </h1>
        <p class="mt-2 text-footnote leading-relaxed text-gray-600 dark:text-gray-400">
          {{ $t("invitation.accept.invalidBody") }}
        </p>
        <button
          type="button"
          class="mt-6 w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-footnote font-semibold text-gray-700 dark:text-gray-200 active:scale-[0.98] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          @click="router.push({ name: 'home' })"
        >
          {{ $t("invitation.accept.goHome") }}
        </button>
      </div>

      <!-- Invitación -->
      <div
        v-else
        class="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <!-- Encabezado con la identidad de la liga/quiniela -->
        <div class="px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/15 dark:to-blue-500/10">
          <p class="text-2xs font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
            {{ eyebrow }}
          </p>

          <div class="mt-3 flex items-center gap-3">
            <img
              v-if="invitable?.image"
              :src="invitable.image"
              :alt="invitable.name"
              class="w-12 h-12 rounded-2xl object-cover ring-1 ring-black/5 dark:ring-white/10 flex-shrink-0"
            />
            <div
              v-else
              class="w-12 h-12 rounded-2xl bg-white/70 dark:bg-gray-800 flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <v-icon
                :name="isPool ? 'hi-solid-users' : 'bi-trophy-fill'"
                class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div class="min-w-0">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">
                {{ invitable?.name }}
              </h1>
              <p v-if="invitation.inviter.name" class="mt-0.5 text-footnote text-gray-600 dark:text-gray-400 truncate">
                {{ $t("invitation.accept.invitedBy", { name: invitation.inviter.name }) }}
              </p>
            </div>
          </div>

          <p
            v-if="invitable?.description"
            class="mt-4 text-footnote leading-relaxed text-gray-700 dark:text-gray-300"
          >
            {{ invitable.description }}
          </p>

          <!-- El momento en que el producto se explica solo: alguien sin
               suscripción está a punto de entrar a contenido de pago porque
               quien le invitó sí paga. Va en la cabecera para que se lea en
               todos los estados (registrarse, iniciar sesión, aceptar). -->
          <p
            v-if="showsGuestPass"
            class="mt-4 flex items-start gap-2 rounded-xl bg-white/70 dark:bg-gray-900/40 px-3 py-2.5 text-2xs leading-relaxed text-gray-700 dark:text-gray-300"
          >
            <v-icon
              name="hi-solid-badge-check"
              class="w-4 h-4 mt-px shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <span>{{ $t("premium.invitation.guestPass", { inviter: inviterName }) }}</span>
          </p>
        </div>

        <div class="px-6 py-5">
          <!-- Ya aceptada -->
          <template v-if="acceptedName">
            <div class="flex items-start gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <v-icon name="hi-solid-check" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p class="flex-1 text-footnote font-semibold leading-snug text-gray-900 dark:text-white pt-1.5">
                {{ $t("invitation.accept.accepted", { name: acceptedName }) }}
              </p>
            </div>

            <button
              type="button"
              class="mt-5 w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-callout font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              @click="goToInvitable"
            >
              {{ isPool ? $t("invitation.accept.goToPool") : $t("invitation.accept.goToLeague") }}
            </button>
          </template>

          <!-- Rechazada -->
          <template v-else-if="isDeclined">
            <p class="text-footnote text-gray-600 dark:text-gray-400">
              {{ $t("invitation.accept.declined") }}
            </p>
            <button
              type="button"
              class="mt-5 w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-footnote font-semibold text-gray-700 dark:text-gray-200 active:scale-[0.98] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              @click="router.push({ name: 'home' })"
            >
              {{ $t("invitation.accept.goHome") }}
            </button>
          </template>

          <!-- Hay que crear cuenta -->
          <template v-else-if="needsAccount">
            <h2 class="text-callout font-bold text-gray-900 dark:text-white">
              {{ $t("invitation.accept.registerTitle") }}
            </h2>
            <p class="mt-1.5 text-footnote leading-relaxed text-gray-600 dark:text-gray-400">
              {{ $t("invitation.accept.registerBody", { email: invitation.email }) }}
            </p>
            <button
              type="button"
              class="mt-5 w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white text-callout font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              @click="goToRegister"
            >
              {{ $t("invitation.accept.register") }}
            </button>
          </template>

          <!-- Tiene cuenta pero no ha entrado -->
          <template v-else-if="!isAuthenticated">
            <h2 class="text-callout font-bold text-gray-900 dark:text-white">
              {{ $t("invitation.accept.signInTitle") }}
            </h2>
            <p class="mt-1.5 text-footnote leading-relaxed text-gray-600 dark:text-gray-400">
              {{ $t("invitation.accept.signInBody", { email: invitation.email }) }}
            </p>
            <button
              type="button"
              class="mt-5 w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white text-callout font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              @click="goToLogin"
            >
              {{ $t("invitation.accept.signIn") }}
            </button>
          </template>

          <!-- Entró con otra cuenta -->
          <template v-else-if="isWrongAccount">
            <h2 class="text-callout font-bold text-gray-900 dark:text-white">
              {{ $t("invitation.accept.wrongAccountTitle") }}
            </h2>
            <p class="mt-1.5 text-footnote leading-relaxed text-gray-600 dark:text-gray-400">
              {{
                $t("invitation.accept.wrongAccountBody", {
                  email: invitation.email,
                  current: currentEmail,
                })
              }}
            </p>
            <button
              type="button"
              class="mt-5 w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white text-callout font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              @click="switchAccount"
            >
              {{ $t("invitation.accept.switchAccount") }}
            </button>
          </template>

          <!-- Todo listo para responder -->
          <template v-else>
            <p class="text-footnote text-gray-600 dark:text-gray-400">
              {{ $t("invitation.accept.forEmail", { email: invitation.email }) }}
            </p>

            <!-- La liga arrancó o se llenó entre el envío y ahora. Se avisa en
                 vez de esconder el botón: el error del backend explica el
                 motivo exacto si aun así se intenta. -->
            <p
              v-if="invitable && (!invitable.is_open || invitable.is_full)"
              class="mt-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 px-3 py-2.5 text-footnote text-amber-700 dark:text-amber-400"
            >
              {{ invitable.is_full ? $t("invitation.invite.noSpots") : $t("invitation.accept.closed") }}
            </p>

            <div class="mt-5 flex flex-col gap-2">
              <button
                type="button"
                class="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-callout font-semibold transition-all duration-150 disabled:opacity-60 disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                :disabled="isSubmitting"
                @click="accept"
              >
                {{ isSubmitting ? $t("invitation.accept.accepting") : $t("invitation.accept.accept") }}
              </button>

              <button
                type="button"
                class="w-full h-11 rounded-xl text-footnote font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/50"
                :disabled="isSubmitting"
                @click="decline"
              >
                {{ $t("invitation.accept.decline") }}
              </button>
            </div>

            <p
              v-if="expiresLabel"
              class="mt-4 text-2xs text-center text-gray-400 dark:text-gray-500"
            >
              {{ $t("invitation.accept.expiresOn", { date: expiresLabel }) }}
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import InvitationService from "@/services/invitation/InvitationService";
import { useAuthStore } from "@/store/auth/useAuthStore";
import { useUserStore } from "@/store";
import { useNoticeStore } from "@/store/notice/useNoticeStore";
import { usePremiumStore } from "@/store/billing/usePremiumStore";
import { Invitation } from "@/interfaces/invitation/Invitation";

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();

const authStore = useAuthStore();
const userStore = useUserStore();
const noticeStore = useNoticeStore();
const premiumStore = usePremiumStore();

const token = String(route.params.token ?? "");

const invitation = ref<Invitation | null>(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const isAuthenticated = ref(false);
const acceptedName = ref("");
const isDeclined = ref(false);

const invitable = computed(() => invitation.value?.invitable ?? null);
const isPool = computed(() => invitable.value?.type === "pool_group");

const eyebrow = computed(() =>
  isPool.value
    ? t("invitation.accept.eyebrowPool")
    : t("invitation.accept.eyebrowLeague"),
);

const currentEmail = computed(() => userStore.getUserData?.email ?? "");

/**
 * Contenido de pago al que se entra sin pagarlo. No se le enseña a quien ya
 * tiene Premium: para esa persona la liga no tiene nada de excepcional, y el
 * mensaje sonaría a que le están haciendo un favor que no necesita.
 *
 * Sin sesión el store dice "no premium", que es justo lo que hay que asumir de
 * alguien a quien están invitando.
 */
const showsGuestPass = computed(
  () => invitable.value?.requires_premium === true && !premiumStore.isPremium,
);

// `trim` porque el nombre llega concatenado del API y arrastra un espacio
// cuando falta el apellido: sin esto la frase sale con un hueco antes del
// signo de puntuación que la sigue.
const inviterName = computed(
  () =>
    invitation.value?.inviter.name?.trim() || t("invitation.accept.someone"),
);

/** Sólo se puede crear cuenta si nadie ocupa ese correo todavía. */
const needsAccount = computed(
  () => !isAuthenticated.value && (invitation.value?.requires_account ?? false),
);

const isWrongAccount = computed(
  () =>
    isAuthenticated.value &&
    !!currentEmail.value &&
    currentEmail.value.trim().toLowerCase() !==
      (invitation.value?.email ?? "").trim().toLowerCase(),
);

const expiresLabel = computed(() => {
  const raw = invitation.value?.expires_at;
  if (!raw) return "";

  const date = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(locale.value, {
    day: "numeric",
    month: "long",
  });
});

onMounted(async () => {
  mountedAt.value = Date.now();
  isAuthenticated.value = await authStore.isAuthenticated();

  try {
    const found = await InvitationService.showByToken(token);
    // Vencida, cancelada o ya respondida: el enlace no tiene nada que ofrecer,
    // así que se trata igual que uno inválido.
    invitation.value = found.status === "pending" ? found : null;
  } catch {
    invitation.value = null;
  } finally {
    isLoading.value = false;
  }
});

/**
 * Los avisos se abren desde una hoja inferior que se cierra al navegar aquí, y
 * el botón de aceptar queda justo donde estaba el aviso que se tocó. Sin esta
 * guarda, ese mismo toque puede caer sobre "Aceptar" al montarse la vista y
 * meter a alguien en una liga sin haberlo decidido.
 */
const ARM_DELAY_MS = 400;
const mountedAt = ref(0);
const isArmed = (): boolean => Date.now() - mountedAt.value >= ARM_DELAY_MS;

async function accept(): Promise<void> {
  if (!invitation.value || !isArmed()) return;

  isSubmitting.value = true;
  try {
    const accepted = await InvitationService.accept(token);
    acceptedName.value = accepted.invitable?.name ?? "";
    invitation.value = accepted;
    // El aviso de esta invitación ya quedó resuelto en el backend; se refresca
    // el contador para que la campanita no siga marcando lo que ya se atendió.
    noticeStore.fetchUnreadCount();
  } finally {
    isSubmitting.value = false;
  }
}

async function decline(): Promise<void> {
  if (!isArmed()) return;

  isSubmitting.value = true;
  try {
    await InvitationService.decline(token);
    isDeclined.value = true;
    noticeStore.fetchUnreadCount();
  } finally {
    isSubmitting.value = false;
  }
}

function goToRegister(): void {
  router.push({
    name: "register",
    query: { redirect: route.fullPath, email: invitation.value?.email },
  });
}

function goToLogin(): void {
  router.push({ name: "login", query: { redirect: route.fullPath } });
}

function switchAccount(): void {
  authStore.clearAuth();
  goToLogin();
}

function goToInvitable(): void {
  const path = invitable.value?.path;
  router.push(path ?? { name: "home" });
}
</script>
