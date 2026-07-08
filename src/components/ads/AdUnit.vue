<!--
  Manual AdSense display unit.

  Render this ONLY inside components that show real publisher content, and gate it
  on that content being present (e.g. v-if="items.length"). Never place it on
  login, registration, league selection, navigation, 404, "coming soon" or
  empty/loading screens — that breaks AdSense policy.

  It self-disables unless: we're in a production build AND a real numeric slot id
  has been configured (a value still wrapped in "[...]" keeps it dormant).
-->
<template>
  <div v-if="enabled" class="ad-unit" role="complementary" :aria-label="$t('ui.ads.label')">
    <span class="ad-label">{{ $t('ui.ads.label') }}</span>
    <ins
      ref="insEl"
      class="adsbygoogle"
      style="display: block"
      :data-ad-client="client"
      :data-ad-slot="adSlot"
      :data-ad-format="format"
      :data-full-width-responsive="responsive ? 'true' : 'false'"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, useTemplateRef } from "vue";
import { ADSENSE_CLIENT } from "@/config/ads";

const props = withDefaults(
  defineProps<{
    /** Numeric ad-unit slot id from the AdSense dashboard. */
    adSlot: string;
    format?: string;
    responsive?: boolean;
  }>(),
  { format: "auto", responsive: true }
);

const client = ADSENSE_CLIENT;
const insEl = useTemplateRef<HTMLElement>("insEl");

// Only render real ads in production once a genuine slot id is set. This keeps
// dev/preview clean and avoids "blank" units while slots are still placeholders.
const enabled =
  import.meta.env.PROD && !!props.adSlot && !props.adSlot.startsWith("[");

type AdsByGoogle = Record<string, unknown>[];

onMounted(async () => {
  if (!enabled) return;
  await nextTick();
  try {
    const w = window as unknown as { adsbygoogle?: AdsByGoogle };
    w.adsbygoogle = w.adsbygoogle || [];
    w.adsbygoogle.push({});
  } catch (e) {
    console.error("AdSense push failed:", e);
  }
});
</script>

<style scoped>
.ad-unit {
  margin: 1rem 0;
  text-align: center;
  overflow: hidden;
}
.ad-label {
  display: block;
  font-size: 0.6875rem; /* 11px */
  line-height: 1;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgb(156 163 175); /* gray-400 */
  margin-bottom: 0.375rem;
}
</style>
