<template>
  <!--
    Destino de `/open/{ruta}` (el botón de los correos que abren la app) cuando
    el sistema NO abrió la app: no está instalada, o el enlace se abrió dentro de
    un navegador que no respeta los Universal Links / App Links.

    Solo se pinta en un teléfono: en un ordenador (o en la web instalada como PWA)
    la ruta ya redirigió a la misma ruta de esta web (`beforeEnter`, en el router).
    Aquí se manda a la tienda al llegar, y lo que queda debajo es lo que se ve al
    volver de ella, o si el navegador no dejó redirigir.
  -->
  <div v-if="target && platform" class="min-h-[70vh] flex items-start justify-center px-4 pt-12 sm:pt-20 pb-12">
    <div class="w-full max-w-md">
      <div class="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/15 dark:to-blue-500/10">
          <p class="text-2xs font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
            {{ eyebrow }}
          </p>
          <h1 class="mt-2 text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {{ $t("invitation.open.title") }}
          </h1>
          <p class="mt-2 text-footnote leading-relaxed text-gray-600 dark:text-gray-400">
            {{ $t("invitation.open.bodyMobile") }}
          </p>
        </div>

        <div class="px-6 pt-5 pb-6">
          <a
            :href="storeUrl"
            class="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-footnote font-semibold active:scale-[0.98] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
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
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/config/appStores";
import { detectMobilePlatform, type MobilePlatform } from "@/utils/joinLink";
import {
  androidOpenIntent,
  iosOpenUrl,
  openableRoute,
  openRootOf,
  searchOf,
  webOpenLocation,
} from "@/utils/openInApp";

const route = useRoute();
const { t } = useI18n();

// El router ya validó la ruta (`beforeEnter`): aquí solo se lee.
const target = openableRoute(String(route.params.rest ?? ""));
const search = searchOf(route.query);

const platform = ref<MobilePlatform>(detectMobilePlatform());

const storeUrl = computed(() => (platform.value === "ios" ? APP_STORE_URL : PLAY_STORE_URL));

const openAppUrl = computed(() => {
  if (!target) return "";
  return platform.value === "ios" ? iosOpenUrl(target, search) : androidOpenIntent(target, search);
});

const webLocation = computed(() => (target ? webOpenLocation(target, route.query) : { name: "home" }));

const eyebrow = computed(() => {
  switch (target ? openRootOf(target) : "fantasy") {
    case "pool":
      return t("invitation.open.eyebrowPool");
    case "survivor":
      return t("invitation.open.eyebrowSurvivor");
    default:
      return t("invitation.open.eyebrowFantasy");
  }
});

/**
 * A la tienda al llegar, **una vez por enlace y pestaña**: al volver de la tienda
 * la página sigue aquí (o se recarga), y mandar otra vez sería un bucle.
 *
 * A la ficha `https` y no al `intent:` en Android a propósito, igual que
 * `JoinLinkView`: si esta página se abrió es casi siempre porque la app no está
 * (con ella, el App Link la abre sin pasar por el navegador), y Chrome puede
 * bloquear un `intent:` lanzado sin un toque. El `intent:` va en "Ya tengo la
 * app", que sí lleva toque.
 */
onMounted(() => {
  if (!target || !platform.value) return;
  const key = `open-store-redirect:${target}${search}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // Sin almacenamiento (navegación privada estricta): se manda igual.
  }
  window.location.href = storeUrl.value;
});
</script>
