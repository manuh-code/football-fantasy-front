<!--
  Aviso de Privacidad Integral (LFPDPPP, México).

  ⚠️ PLANTILLA: revisa este documento con un profesional legal antes de publicarlo
  y reemplaza TODOS los marcadores entre [CORCHETES] con la información real del
  Responsable (razón social, domicilio, correo de contacto, proveedores, fecha, etc.).
  Edita el bloque `company` de abajo: esos valores se interpolan en todo el texto.
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
        Back
      </button>

      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5">
        <div class="flex items-start gap-3">
          <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-document-text" class="w-7 h-7 text-white" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              Aviso de Privacidad
            </h1>
            <p class="text-footnote text-gray-500 dark:text-gray-400 mt-1">
              {{ company.appName }}
            </p>
            <p class="text-2xs text-gray-400 dark:text-gray-500 mt-1">
              Última actualización: {{ company.lastUpdated }}
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <article class="legal bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 sm:p-6">
        <p>
          En cumplimiento de la <strong>Ley Federal de Protección de Datos Personales en
          Posesión de los Particulares</strong> (la “Ley”), su Reglamento y los Lineamientos del
          Aviso de Privacidad, <strong>{{ company.legalName }}</strong> (en lo sucesivo,
          “{{ company.appName }}”, “nosotros” o el “Responsable”) pone a tu disposición el
          presente Aviso de Privacidad, que describe cómo recabamos, usamos, almacenamos y
          protegemos tus datos personales.
        </p>

        <h2>1. Identidad y domicilio del Responsable</h2>
        <ul>
          <li><strong>Responsable:</strong> {{ company.legalName }}</li>
          <li><strong>Nombre comercial:</strong> {{ company.appName }}</li>
          <li><strong>Domicilio:</strong> {{ company.address }}</li>
          <li><strong>Correo de contacto:</strong> {{ company.contactEmail }}</li>
          <li><strong>Sitio web:</strong> {{ company.website }}</li>
        </ul>

        <h2>2. Datos personales que recabamos</h2>
        <p>Para las finalidades descritas en este Aviso podemos recabar las siguientes categorías de datos personales:</p>
        <ul>
          <li><strong>Datos de identificación:</strong> nombre y apellidos.</li>
          <li><strong>Datos de contacto:</strong> correo electrónico y número de teléfono.</li>
          <li>
            <strong>Datos de cuenta y perfil:</strong> nombre de usuario, fotografía o avatar,
            equipo de futbol favorito, liga seleccionada, así como tus preferencias e historial de
            actividad dentro de la aplicación (ligas fantasy, quinielas/pools, predicciones,
            tablas de posiciones y estadísticas).
          </li>
          <li>
            <strong>Datos técnicos y de navegación:</strong> dirección IP, identificadores del
            dispositivo, tipo de navegador, sistema operativo, tokens de notificaciones push,
            cookies e identificadores similares.
          </li>
          <li>
            <strong>Datos obtenidos de terceros (inicio de sesión social):</strong> cuando
            decides registrarte o iniciar sesión mediante un proveedor externo (por ejemplo,
            Google o Facebook), podemos recibir tu nombre, correo electrónico y fotografía de
            perfil, conforme a los permisos que autorices y a las políticas de privacidad de
            dichos terceros.
          </li>
        </ul>
        <p>
          Recabamos tus datos: (i) <strong>directamente</strong>, cuando los proporcionas al
          registrarte o completar tu perfil; (ii) de forma <strong>automática</strong>, cuando
          utilizas la aplicación; y (iii) a través de <strong>fuentes de terceros</strong>, como
          los proveedores de inicio de sesión social.
        </p>

        <h2>3. No recabamos datos personales sensibles</h2>
        <p>
          No solicitamos ni tratamos datos personales sensibles (aquellos que puedan revelar
          origen racial o étnico, estado de salud, información genética, creencias religiosas,
          filosóficas o morales, afiliación sindical, opiniones políticas o preferencia sexual).
          Tampoco recabamos datos financieros o de medios de pago, ya que la aplicación no procesa
          pagos.
        </p>

        <h2>4. Finalidades del tratamiento</h2>
        <h3>4.1 Finalidades primarias (necesarias)</h3>
        <p>Son indispensables para prestarte el servicio y para la relación entre tú y nosotros:</p>
        <ul>
          <li>Crear, identificar, autenticar y administrar tu cuenta.</li>
          <li>
            Prestar los servicios de la aplicación: ligas fantasy, quinielas/pools, predicciones,
            tablas de posiciones y estadísticas.
          </li>
          <li>
            Enviar notificaciones (incluidas notificaciones push) relacionadas con el
            funcionamiento del servicio, partidos, resultados y tu actividad.
          </li>
          <li>Brindar soporte, atención y dar seguimiento a tus solicitudes.</li>
          <li>Prevenir fraudes y usos indebidos, y cumplir obligaciones legales aplicables.</li>
        </ul>

        <h3>4.2 Finalidades secundarias (no necesarias)</h3>
        <p>No son indispensables, pero nos permiten ofrecerte una mejor experiencia:</p>
        <ul>
          <li>Envío de comunicaciones promocionales, novedades y mercadotecnia.</li>
          <li>Realización de encuestas, estadísticas y análisis de uso para mejorar la aplicación.</li>
          <li>Personalización de contenido y publicidad.</li>
        </ul>
        <p>
          Si no deseas que tus datos se utilicen para las finalidades secundarias, puedes
          manifestar tu negativa enviando un correo a
          <strong>{{ company.contactEmail }}</strong> indicando tu nombre y la finalidad a la que
          te opones, o ajustando tus preferencias dentro de la aplicación. Tu negativa no será
          motivo para negarte los servicios que contrataste.
        </p>

        <h2>5. Uso de cookies, web beacons y tecnologías similares</h2>
        <p>
          Utilizamos cookies, almacenamiento local (localStorage), web beacons y tecnologías
          similares para mantener tu sesión, recordar tus preferencias, habilitar funciones de la
          aplicación y obtener métricas de uso mediante herramientas de analítica (por ejemplo,
          {{ company.analyticsProvider }}). Estas tecnologías pueden recabar datos como tu
          dirección IP, las secciones que visitas, el tiempo de navegación y características de tu
          dispositivo. Puedes deshabilitar las cookies desde la configuración de tu navegador,
          considerando que ello podría afectar el correcto funcionamiento de algunas funciones.
        </p>

        <h2>6. Transferencias de datos</h2>
        <p>
          Para operar el servicio podemos compartir o dar acceso a tus datos personales a
          proveedores que actúan como encargados por nuestra cuenta, entre ellos:
        </p>
        <ul>
          <li>Proveedores de infraestructura, hospedaje y almacenamiento en la nube.</li>
          <li>Proveedor de notificaciones push ({{ company.pushProvider }}).</li>
          <li>Proveedor de analítica web ({{ company.analyticsProvider }}).</li>
          <li>Proveedores de autenticación / inicio de sesión social (Google, Facebook).</li>
        </ul>
        <p>
          Algunos de estos proveedores pueden ubicarse fuera de México; en todos los casos exigimos
          el tratamiento confidencial de tus datos y la adopción de medidas de seguridad. <strong>No
          vendemos tus datos personales.</strong> Conforme al artículo 37 de la Ley, podremos
          realizar transferencias sin requerir tu consentimiento únicamente en los supuestos
          previstos por dicha disposición (por ejemplo, cuando sea necesario por virtud de una ley o
          tratado, para el cumplimiento de un contrato, o por requerimiento de autoridad competente).
        </p>

        <h2>7. Medios para ejercer tus Derechos ARCO</h2>
        <p>
          Tienes derecho a <strong>Acceder</strong> a tus datos personales, a
          <strong>Rectificar</strong>los cuando sean inexactos o incompletos, a
          <strong>Cancelar</strong>los cuando consideres que no se requieren para alguna de las
          finalidades, y a <strong>Oponerte</strong> a su tratamiento para fines específicos
          (Derechos ARCO).
        </p>
        <p>
          Para ejercerlos, envía tu solicitud al correo <strong>{{ company.contactEmail }}</strong>,
          la cual deberá contener al menos:
        </p>
        <ul>
          <li>Tu nombre y un medio para comunicarte la respuesta.</li>
          <li>Los documentos que acrediten tu identidad o la representación legal, en su caso.</li>
          <li>La descripción clara y precisa de los datos y del derecho que deseas ejercer.</li>
          <li>Cualquier elemento que facilite la localización de tus datos personales.</li>
        </ul>
        <p>
          Te responderemos sobre la procedencia de tu solicitud en un plazo máximo de
          <strong>20 días hábiles</strong>; de resultar procedente, se hará efectiva dentro de los
          <strong>15 días hábiles</strong> siguientes. El ejercicio de estos derechos es gratuito,
          salvo los gastos justificados de envío o reproducción que correspondan conforme a la Ley.
        </p>

        <h2>8. Revocación del consentimiento</h2>
        <p>
          Puedes revocar en cualquier momento el consentimiento que nos has otorgado para el
          tratamiento de tus datos, enviando tu solicitud a {{ company.contactEmail }}. Considera
          que, por motivos legales o por la naturaleza del servicio, en algunos casos la revocación
          podría implicar que no podamos seguir prestándote ciertos servicios o que la relación
          concluya.
        </p>

        <h2>9. Limitación del uso o divulgación de tus datos</h2>
        <p>
          Puedes limitar el uso o divulgación de tus datos personales ajustando las preferencias de
          tu cuenta dentro de la aplicación o solicitándolo al correo {{ company.contactEmail }}.
          Asimismo, podrás darte de baja de nuestras comunicaciones promocionales en cualquier
          momento a través del enlace incluido en dichas comunicaciones.
        </p>

        <h2>10. Medidas de seguridad</h2>
        <p>
          Implementamos medidas de seguridad administrativas, técnicas y físicas razonables para
          proteger tus datos personales contra daño, pérdida, alteración, destrucción o uso, acceso
          o tratamiento no autorizados.
        </p>

        <h2>11. Menores de edad</h2>
        <p>
          La aplicación está dirigida a personas mayores de <strong>{{ company.minAge }}</strong>
          años. No recabamos intencionalmente datos de menores de edad sin el consentimiento de
          quien ejerza la patria potestad o tutela. Si consideras que un menor nos ha proporcionado
          datos personales, contáctanos a {{ company.contactEmail }} para eliminarlos.
        </p>

        <h2>12. Cambios al Aviso de Privacidad</h2>
        <p>
          Nos reservamos el derecho de modificar o actualizar el presente Aviso de Privacidad en
          cualquier momento. Cualquier cambio será publicado en {{ company.website }} y/o dentro de
          la aplicación, indicando la fecha de la última actualización.
        </p>

        <h2>13. Autoridad</h2>
        <p>
          Si consideras que tu derecho a la protección de datos personales ha sido vulnerado, puedes
          acudir al Instituto Nacional de Transparencia, Acceso a la Información y Protección de
          Datos Personales (INAI):
          <a href="https://home.inai.org.mx" target="_blank" rel="noopener noreferrer">home.inai.org.mx</a>.
        </p>

        <h2>14. Consentimiento</h2>
        <p>
          Al registrarte y/o utilizar {{ company.appName }}, manifiestas que has leído, entendido y
          aceptado los términos del presente Aviso de Privacidad, y otorgas tu consentimiento para
          el tratamiento de tus datos personales conforme a lo aquí descrito.
        </p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

document.title = "Aviso de Privacidad - Football Fantasy";

const router = useRouter();

// ⚠️ Reemplaza estos valores con la información real del Responsable antes de publicar.
const company = {
  legalName: "[Razón social o nombre del Responsable]",
  appName: "Football Fantasy",
  address: "[Calle, número, colonia, municipio/alcaldía, estado, C.P., México]",
  contactEmail: "[privacidad@tudominio.com]",
  website: "[https://tudominio.com]",
  pushProvider: "[p. ej. Firebase Cloud Messaging]",
  analyticsProvider: "[p. ej. Google Analytics]",
  minAge: "18",
  lastUpdated: "[DD de mes de AAAA]",
};

const goBack = () => {
  if (window.history.length > 1) router.back();
  else router.push({ name: "home" });
};
</script>

<style scoped>
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

.legal p {
  font-size: 0.8125rem; /* footnote / 13px */
  line-height: 1.65;
  margin-bottom: 0.75rem;
}

.legal ul {
  list-style: disc;
  padding-left: 1.25rem;
  margin-bottom: 0.75rem;
}

.legal li {
  font-size: 0.8125rem; /* footnote / 13px */
  line-height: 1.6;
  margin-bottom: 0.375rem;
}

.legal strong {
  font-weight: 600;
  color: rgb(17 24 39); /* gray-900 */
}
.dark .legal strong {
  color: #fff;
}

.legal a {
  color: rgb(5 150 105); /* emerald-600 */
  font-weight: 600;
  text-decoration: underline;
}
.dark .legal a {
  color: rgb(52 211 153); /* emerald-400 */
}

.legal p:first-child {
  margin-top: 0;
}
</style>
