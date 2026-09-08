<!--
  Página pública de solicitud de borrado de cuenta.

  Existe por un requisito de tienda, no por diseño: Google Play (Política de
  Datos del Usuario) obliga a declarar en la ficha una **URL accesible sin
  iniciar sesión** donde el usuario pueda pedir que se borren su cuenta y sus
  datos, y donde se explique qué se elimina, qué se conserva y por cuánto
  tiempo. El borrado dentro de la app —Ajustes → Borrar mi cuenta— ya existía y
  sigue siendo la vía rápida; esta página es la puerta para quien ya no puede
  entrar (perdió la contraseña, borró la app, cambió de teléfono).

  El bloque del documento legal es HTML plano con interpolaciones de `company` y
  NADA de directivas de Vue, porque scripts/prerender.mjs lo extrae tal cual para
  generar /eliminar-cuenta/index.html. Lo interactivo (botones, mailto) vive
  fuera de él; el HTML estático repite esa información como texto.

  No escribas la etiqueta de ese bloque en este comentario: el prerender la
  localiza con una expresión regular sobre el archivo entero y engancharía la
  primera aparición, arrastrando medio template dentro del documento.

  ⚠️ PLANTILLA: revisa los valores entre [CORCHETES] del bloque `company` antes
  de publicar — son los mismos marcadores que PrivacyView.vue.
-->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-16">
    <div class="container mx-auto px-4 max-w-3xl space-y-4">
      <!-- Back -->
      <button
        type="button"
        @click="goBack"
        class="inline-flex items-center gap-1.5 text-footnote font-medium text-gray-500 dark:text-gray-400 active:text-emerald-500 transition-colors"
      >
        <v-icon name="hi-solid-chevron-left" class="w-4 h-4" />
        {{ $t('common.actions.back') }}
      </button>

      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5">
        <div class="flex items-start gap-3">
          <div class="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-trash" class="w-7 h-7 text-white" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {{ $t('legal.deleteAccount.title') }}
            </h1>
            <p class="text-footnote text-gray-500 dark:text-gray-400 mt-1">
              {{ company.appName }} · {{ company.website }}
            </p>
            <p class="text-2xs text-gray-400 dark:text-gray-500 mt-1">
              {{ $t('legal.deleteAccount.lastUpdated', { date: company.lastUpdated }) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Vía 1: desde la app (inmediata) -->
      <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5">
        <div class="flex items-center gap-2">
          <v-icon name="hi-solid-lock-closed" class="w-4 h-4 text-emerald-500" />
          <h2 class="text-callout font-bold text-gray-900 dark:text-white">
            Opción 1 · Bórrala tú mismo (inmediato)
          </h2>
        </div>
        <p class="mt-2 text-footnote text-gray-600 dark:text-gray-300">
          Si puedes iniciar sesión, el borrado es instantáneo y no hace falta que nos escribas.
        </p>
        <ol class="mt-3 space-y-2">
          <li v-for="(step, i) in steps" :key="i" class="flex gap-2.5 text-footnote text-gray-700 dark:text-gray-300">
            <span
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
            >{{ i + 1 }}</span>
            <span>{{ step }}</span>
          </li>
        </ol>
        <router-link
          :to="settingsTarget"
          class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-footnote font-semibold text-white transition-colors hover:bg-emerald-700 sm:w-auto"
        >
          <v-icon name="hi-solid-user" class="h-4 w-4" />
          {{ hasSession ? 'Ir a Ajustes' : 'Inicia sesión para borrar tu cuenta' }}
        </router-link>
      </section>

      <!-- Vía 2: por correo (sin acceso) -->
      <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5">
        <div class="flex items-center gap-2">
          <v-icon name="hi-solid-mail" class="w-4 h-4 text-emerald-500" />
          <h2 class="text-callout font-bold text-gray-900 dark:text-white">
            Opción 2 · Pídelo por correo
          </h2>
        </div>
        <p class="mt-2 text-footnote text-gray-600 dark:text-gray-300">
          ¿Ya no puedes entrar a tu cuenta? Escríbenos desde el correo con el que te registraste —es
          la forma de comprobar que la cuenta es tuya— y nosotros la borramos.
        </p>
        <a
          :href="mailtoHref"
          class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-footnote font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700/50 sm:w-auto"
        >
          <v-icon name="hi-solid-mail" class="h-4 w-4" />
          Solicitar el borrado por correo
        </a>
        <p class="mt-2 text-2xs text-gray-400 dark:text-gray-500">
          {{ company.contactEmail }}
        </p>
      </section>

      <!-- Content -->
      <article class="legal bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 sm:p-6">
        <p>
          Esta página explica cómo pedir que se eliminen tu cuenta de
          <strong>{{ company.appName }}</strong> y los datos personales asociados a ella, qué se
          borra, qué se conserva y en qué plazos. El responsable del tratamiento es
          <strong>{{ company.legalName }}</strong>, cuyo domicilio y datos completos de
          identificación figuran en el Aviso de Privacidad; el correo de contacto es
          <strong>{{ company.contactEmail }}</strong>.
        </p>

        <h2 id="borrado-1">1. Cómo solicitar el borrado</h2>
        <h3>Desde la aplicación (recomendado)</h3>
        <ol>
          <li>Inicia sesión en {{ company.appName }} ({{ company.website }} o la app móvil).</li>
          <li>Entra en <strong>Ajustes</strong> desde tu perfil.</li>
          <li>Baja hasta la tarjeta <strong>Borrar mi cuenta</strong> y ábrela.</li>
          <li>
            Confirma con tu <strong>contraseña actual</strong> y escribiendo la palabra
            <strong>BORRAR</strong>.
          </li>
        </ol>
        <p>
          Si creaste la cuenta con <strong>Google</strong> o con <strong>Apple</strong> no tienes
          contraseña que confirmar: hazlo desde la <strong>app móvil</strong>, que te vuelve a
          identificar con ese mismo proveedor, o pídelo por correo como se explica más abajo.
        </p>
        <p>
          El borrado se ejecuta <strong>en ese momento</strong>: la sesión se cierra y la cuenta deja
          de existir. No hay periodo de gracia ni forma de recuperarla.
        </p>

        <h3>Por correo electrónico</h3>
        <p>
          Si ya no puedes acceder a la cuenta, envía un correo a
          <strong>{{ company.contactEmail }}</strong> con el asunto
          <strong>“Solicitud de borrado de cuenta”</strong> desde la dirección con la que te
          registraste, indicando el correo o el nombre de usuario de la cuenta que quieres eliminar.
          Podemos pedirte información adicional para acreditar tu identidad antes de borrar nada.
        </p>

        <h2 id="borrado-2">2. Datos que se eliminan</h2>
        <p>Al completarse la solicitud se eliminan de forma permanente:</p>
        <ul>
          <li>Tu nombre, apellidos, correo electrónico, teléfono y fotografía o avatar.</li>
          <li>Tu contraseña y las identidades vinculadas de Google y de Apple.</li>
          <li>Todas las sesiones y tokens de acceso abiertos en cualquier dispositivo.</li>
          <li>
            Los tokens de notificaciones push y las suscripciones a avisos de equipos y partidos.
          </li>
          <li>
            Tus preferencias: equipos favoritos, ligas de futbol que sigues y ajustes de
            notificaciones.
          </li>
          <li>
            El nombre, las iniciales y el escudo o imagen de tus equipos fantasy (los subes tú y a
            menudo identifican a la persona).
          </li>
          <li>
            Las invitaciones que enviaste y las que recibiste, junto con los correos que contenían;
            los enlaces de invitación que siguieran pendientes quedan cancelados e inservibles.
          </li>
          <li>
            Tu ficha de cliente en la pasarela de pago {{ company.paymentProvider }}, con el
            historial de pagos que guardaba, así como los métodos de pago registrados.
          </li>
          <li>El historial de compras dentro de la app de App Store y de Google Play.</li>
        </ul>

        <h2 id="borrado-3">3. Datos que se conservan y por qué</h2>
        <p>
          {{ company.appName }} es un producto de partidas compartidas: tus ligas fantasy, quinielas
          y Survivor se juegan contra otras personas. Por eso el registro de la partida
          <strong>se conserva sin ningún dato que te identifique</strong> —tu equipo aparece con un
          nombre genérico y sin imagen—, en lugar de borrarse:
        </p>
        <ul>
          <li>
            Enfrentamientos, alineaciones, puntuaciones, predicciones y tablas de posiciones de las
            partidas en las que participaste. Borrarlos dejaría a los demás participantes con
            jornadas sin rival y clasificaciones que no cuadran.
          </li>
          <li>
            Si administrabas una liga, quiniela o Survivor, la administración pasa automáticamente
            al miembro más antiguo que quede. Si no queda ningún otro miembro, esa partida se
            elimina contigo.
          </li>
          <li>
            Los registros técnicos y contables que la legislación aplicable nos obliga a conservar
            (por ejemplo, comprobantes fiscales de pagos), durante el plazo legal que corresponda y
            bloqueados para cualquier otro uso.
          </li>
        </ul>
        <p>
          Ninguno de estos registros permite volver a asociarte con la cuenta borrada: la dirección
          de correo se sustituye por un valor aleatorio en un dominio reservado que no corresponde a
          ningún buzón real.
        </p>

        <h2 id="borrado-4">4. Plazos</h2>
        <ul>
          <li>
            <strong>Desde la app:</strong> el borrado es inmediato, en el momento de confirmarlo.
          </li>
          <li>
            <strong>Por correo:</strong> te responderemos en un máximo de <strong>20 días
            hábiles</strong> y, de resultar procedente, la eliminación se hará efectiva dentro de los
            <strong>15 días hábiles</strong> siguientes, conforme a la LFPDPPP.
          </li>
          <li>
            <strong>Copias de seguridad:</strong> los datos ya eliminados pueden permanecer en
            respaldos cifrados hasta {{ company.backupRetention }}, tras lo cual esos respaldos se
            sobrescriben. Durante ese tiempo no se usan para ninguna otra finalidad y solo se
            restaurarían ante un incidente de pérdida de información.
          </li>
        </ul>

        <h2 id="borrado-5">5. Suscripciones Premium</h2>
        <p>
          Si contrataste Premium con tarjeta a través de {{ company.paymentProvider }}, la
          suscripción se <strong>cancela automáticamente</strong> al borrar la cuenta y no se te
          vuelve a cobrar.
        </p>
        <p>
          Si la contrataste desde la <strong>App Store</strong> o desde <strong>Google Play</strong>,
          la suscripción vive en tu cuenta de Apple o de Google y nosotros no podemos cancelarla:
          borrar la cuenta de {{ company.appName }} elimina nuestro registro de la compra, pero la
          renovación seguiría cobrándose. <strong>Cancélala primero en la tienda</strong> —en iOS,
          Ajustes → tu nombre → Suscripciones; en Android, Google Play → Pagos y suscripciones →
          Suscripciones— y borra la cuenta después.
        </p>

        <h2 id="borrado-6">6. Volver a registrarte</h2>
        <p>
          El borrado libera tu dirección de correo, así que puedes crear una cuenta nueva con ella
          más adelante. Será una cuenta desde cero: no conserva historial, ligas, puntos ni Premium
          de la anterior.
        </p>

        <h2 id="borrado-7">7. Contacto</h2>
        <p>
          Para cualquier duda sobre esta solicitud o sobre el tratamiento de tus datos personales,
          incluido el ejercicio de tus Derechos ARCO, escríbenos a
          <strong>{{ company.contactEmail }}</strong>. Puedes consultar el detalle completo en
          nuestro Aviso de Privacidad, en {{ company.website }}/privacy.
        </p>
      </article>

      <!-- Enlace al aviso de privacidad -->
      <router-link
        :to="{ name: 'privacy' }"
        class="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:bg-gray-700/50"
      >
        <span class="flex items-center gap-3">
          <v-icon name="hi-solid-document-text" class="h-5 w-5 text-gray-400" />
          <span class="text-footnote font-medium text-gray-700 dark:text-gray-200">
            {{ $t('legal.privacy.title') }}
          </span>
        </span>
        <v-icon name="hi-solid-chevron-right" class="h-4 w-4 text-gray-400" />
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/store/auth/useAuthStore";

const { t } = useI18n();
document.title = t("legal.deleteAccount.docTitle");

const router = useRouter();
const authStore = useAuthStore();

// Basta con saber si hay token guardado: esto solo decide a qué pantalla apunta
// el botón. La validación real la hace el guard de la ruta /settings.
const hasSession = computed(() => Boolean(authStore.token));

// Sin sesión no se manda al usuario a /settings a chocar con el guard: se le
// manda a login con el redirect ya puesto, para que aterrice en Ajustes.
const settingsTarget = computed(() =>
  hasSession.value
    ? { name: "userSettings" }
    : { name: "login", query: { redirect: "/settings" } }
);

// A diferencia de PrivacyView.vue, aquí los valores van sin corchetes: esta URL
// se declara en Google Play y la abre un revisor, así que no puede enseñar
// marcadores de plantilla. Solo `legalName` sigue pendiente — es el único dato
// que no está ya en el código ni en producción.
//
// ⚠️ `backupRetention` es el plazo real de rotación de los respaldos: confírmalo
// con tu proveedor de hosting y ajústalo si no son 30 días. Aquí se está
// afirmando un compromiso ante la tienda y ante el usuario.
const company = {
  legalName: "[Razón social o nombre del Responsable]",
  appName: "Pro Fantasy",
  contactEmail: "hola@fantasymx.cloud",
  website: "https://fantasymx.cloud",
  paymentProvider: "Stripe",
  backupRetention: "30 días",
  lastUpdated: "8 de septiembre de 2026",
};

// Los pasos se repiten dentro del <article> como texto plano: aquí son la guía
// rápida de la tarjeta, allí forman parte del documento que lee el revisor de
// la tienda (y el HTML prerenderizado).
const steps = [
  "Inicia sesión en tu cuenta.",
  "Abre Ajustes desde tu perfil.",
  "Busca la tarjeta “Borrar mi cuenta”.",
  "Confirma con tu contraseña y escribiendo BORRAR.",
] as const;

const mailtoHref = computed(() => {
  const subject = "Solicitud de borrado de cuenta";
  const body = [
    "Hola,",
    "",
    "Solicito el borrado de mi cuenta de Pro Fantasy y de los datos personales asociados.",
    "",
    "Correo de la cuenta: ",
    "Nombre de usuario: ",
    "",
    "Entiendo que la acción es permanente y no se puede deshacer.",
  ].join("\n");
  return `mailto:${company.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const goBack = () => {
  if (window.history.length > 1) router.back();
  else router.push({ name: "home" });
};
</script>

<style scoped>
/* Mismo tratamiento tipográfico que el Aviso de Privacidad: los dos son
   documentos legales y deben leerse igual. */
.legal {
  color: rgb(55 65 81); /* gray-700 */
}
.dark .legal {
  color: rgb(209 213 219); /* gray-300 */
}

.legal h2 {
  font-size: 0.9375rem; /* callout / 15px */
  font-weight: 700;
  color: rgb(17 24 39); /* gray-900 */
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  scroll-margin-top: 1rem;
}
.dark .legal h2 {
  color: #fff;
}

.legal h3 {
  font-size: 0.8125rem; /* footnote / 13px */
  font-weight: 700;
  color: rgb(31 41 55); /* gray-800 */
  margin-top: 1rem;
  margin-bottom: 0.375rem;
}
.dark .legal h3 {
  color: rgb(229 231 235); /* gray-200 */
}

.legal p,
.legal li {
  font-size: 0.8125rem; /* footnote / 13px */
  line-height: 1.6;
}

.legal p {
  margin-bottom: 0.625rem;
}

.legal ul,
.legal ol {
  margin: 0.375rem 0 0.75rem 1.125rem;
  display: grid;
  gap: 0.25rem;
}

.legal ul {
  list-style: disc;
}

.legal ol {
  list-style: decimal;
}

.legal strong {
  font-weight: 600;
  color: rgb(17 24 39);
}
.dark .legal strong {
  color: rgb(243 244 246);
}
</style>
