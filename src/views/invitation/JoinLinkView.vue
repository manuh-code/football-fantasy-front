<template>
  <!--
    Destino del enlace de "Compartir invitación" (`/join/{modo}/{código}`) cuando
    el sistema NO abrió la app: no está instalada, o el enlace se abrió dentro de
    un navegador que no respeta los Universal Links / App Links.

    Solo se pinta en un teléfono: en un ordenador (o en la web instalada como PWA)
    la ruta ya redirigió a la hoja de unirse de esta web (`beforeEnter`, en el
    router). Aquí se manda a la tienda al llegar, y lo que queda debajo —el código
    para copiar y los botones— es lo que se ve al volver de ella.
  -->
  <div v-if="mode && platform" class="min-h-[70vh] flex items-start justify-center px-4 pt-12 sm:pt-20 pb-12">
    <div class="w-full max-w-md">
      <div class="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/15 dark:to-blue-500/10">
          <p class="text-2xs font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
            {{ eyebrow }}
          </p>
          <h1 class="mt-2 text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {{ $t("invitation.join.title") }}
          </h1>
          <p class="mt-2 text-footnote leading-relaxed text-gray-600 dark:text-gray-400">
            {{ $t("invitation.join.bodyMobile") }}
          </p>
        </div>

        <div class="px-6 pt-5 pb-6">
          <p class="text-2xs font-bold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
            {{ $t("invitation.join.codeLabel") }}
          </p>
          <div class="mt-2 flex items-center justify-between gap-3 rounded-2xl bg-gray-50 dark:bg-gray-800 pl-4 pr-2 py-2">
            <!-- `translate="no"`: el traductor del navegador no debe tocar un código que distingue mayúsculas. -->
            <span
              class="min-w-0 break-all font-mono text-2xl font-bold tracking-[0.18em] text-gray-900 dark:text-white"
              translate="no"
            >{{ code }}</span>
            <button
              type="button"
              class="flex-shrink-0 inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-footnote font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/10 active:scale-[0.97] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              @click="copyCode"
            >
              <v-icon :name="copied ? 'hi-solid-check' : 'hi-solid-duplicate'" class="w-4 h-4" aria-hidden="true" />
              <span aria-live="polite">{{ copied ? $t("invitation.join.copied") : $t("invitation.join.copy") }}</span>
            </button>
          </div>

          <a
            :href="storeUrl"
            class="mt-5 flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-footnote font-semibold active:scale-[0.98] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <svg v-if="platform === 'ios'" viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" aria-hidden="true">
              <path d="M16.37 1.43c0 1.14-.49 2.27-1.18 3.08-.74.9-1.99 1.57-2.99 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.57-2.27 1.21-2.98.8-.94 2.14-1.64 3.25-1.68.03.13.05.28.05.43zm4.56 15.71c-.03.07-.46 1.58-1.52 3.12-.94 1.34-1.94 2.71-3.43 2.71-1.52 0-1.9-.88-3.63-.88-1.7 0-2.3.91-3.67.91-1.38 0-2.33-1.26-3.43-2.8-1.29-1.82-2.32-4.63-2.32-7.28 0-4.28 2.8-6.55 5.55-6.55 1.45 0 2.68.95 3.6.95.87 0 2.22-1.01 3.9-1.01.61 0 2.89.06 4.37 2.19-.13.09-2.38 1.37-2.38 4.19 0 3.26 2.85 4.42 2.96 4.45z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" aria-hidden="true">
              <path d="M4.2 2.3a1.4 1.4 0 0 0-.5 1.1v17.2c0 .45.2.85.5 1.1L14 12 4.2 2.3zm11 8.5 2.8-2.8L6.6 1.5l8.6 9.3zm0 2.4-8.6 9.3L18 16l-2.8-2.8zm4.1-4.4L16.3 12l3 3.2 2.3-1.3c.9-.5.9-1.8 0-2.3l-2.3-1.3z" />
            </svg>
            {{ platform === "ios" ? $t("invitation.join.appStore") : $t("invitation.join.googlePlay") }}
          </a>

          <a
            :href="openAppUrl"
            class="mt-3 flex items-center justify-center w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-footnote font-semibold text-gray-700 dark:text-gray-200 active:scale-[0.98] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            {{ $t("invitation.join.openApp") }}
          </a>

          <p class="mt-4 text-footnote leading-relaxed text-center text-gray-500 dark:text-gray-400">
            {{ $t("invitation.join.steps", { mode: modeLabel }) }}
          </p>
        </div>
      </div>

      <router-link
        :to="webLocation"
        class="mt-5 block text-center text-footnote font-semibold text-blue-600 dark:text-blue-400 focus:outline-none focus-visible:underline"
      >
        {{ $t("invitation.join.continueWeb") }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/config/appStores";
import {
  androidAppIntent,
  detectMobilePlatform,
  iosAppUrl,
  isJoinMode,
  webJoinLocation,
  type JoinMode,
  type MobilePlatform,
} from "@/utils/joinLink";

const route = useRoute();
const { t } = useI18n();

// El router ya validó el modo y el código (`beforeEnter`): aquí solo se leen.
const rawMode = String(route.params.mode ?? "").toLowerCase();
const mode: JoinMode | null = isJoinMode(rawMode) ? rawMode : null;
const code = String(route.params.code ?? "").trim();

const platform = ref<MobilePlatform>(detectMobilePlatform());

const storeUrl = computed(() => (platform.value === "ios" ? APP_STORE_URL : PLAY_STORE_URL));

const openAppUrl = computed(() => {
  if (!mode) return "";
  return platform.value === "ios" ? iosAppUrl(mode, code) : androidAppIntent(mode, code);
});

const webLocation = computed(() => (mode ? webJoinLocation(mode, code) : { name: "home" }));

const eyebrow = computed(() => {
  switch (mode) {
    case "pool":
      return t("invitation.join.eyebrowPool");
    case "survivor":
      return t("invitation.join.eyebrowSurvivor");
    default:
      return t("invitation.join.eyebrowFantasy");
  }
});

const modeLabel = computed(() => {
  switch (mode) {
    case "pool":
      return t("invitation.join.modePool");
    case "survivor":
      return t("invitation.join.modeSurvivor");
    default:
      return t("invitation.join.modeFantasy");
  }
});

const copied = ref(false);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Copiar el código es el puente que tiene iOS para después de instalar: la App
 * Store no le pasa nada a la app, y el cajón de unirse tiene botón de pegar.
 */
async function copyCode(): Promise<void> {
  // Sin portapapeles el código sigue a la vista para escribirlo a mano: no se
  // dice "Copiado" si no se copió.
  if (!(await writeClipboard(code))) return;
  copied.value = true;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => (copied.value = false), 2000);
}

/**
 * La API asíncrona y, si no existe **o la rechaza** (navegadores internos de
 * apps, contextos sin permiso), el `textarea` oculto de siempre.
 */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * A la tienda al llegar, **una vez por enlace y pestaña**: al volver de la tienda
 * la página sigue aquí (o se recarga), y mandar otra vez sería un bucle.
 *
 * A la ficha `https` y no al `intent:` en Android a propósito: si esta página se
 * abrió es casi siempre porque la app no está (con ella, el App Link la abre sin
 * pasar por el navegador), y Chrome puede bloquear un `intent:` lanzado sin un
 * toque. El `intent:` va en "Ya tengo la app", que sí lleva toque.
 */
onMounted(() => {
  if (!mode || !platform.value) return;
  const key = `join-store-redirect:${mode}:${code}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // Sin almacenamiento (navegación privada estricta): se manda igual.
  }
  window.location.href = storeUrl.value;
});

onBeforeUnmount(() => clearTimeout(copiedTimer));
</script>
