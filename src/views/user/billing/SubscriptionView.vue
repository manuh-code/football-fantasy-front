<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-lg">
      <div class="animate-page-enter">
        <!-- Which of the two screens this is depends on server state, so nothing
             is shown until it is known — flashing the pricing page at someone
             who already pays would be the worst possible first frame. -->
        <div v-if="!subscriptionStore.isStateLoaded" class="space-y-4">
          <div class="h-8 w-40 mx-auto rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div class="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>

        <ManageSubscriptionComponent v-else-if="subscriptionStore.isPremium" />

        <SubscriptionPlansComponent v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import SubscriptionPlansComponent from '@/components/user/billing/SubscriptionPlansComponent.vue'
import ManageSubscriptionComponent from '@/components/user/billing/ManageSubscriptionComponent.vue'
import { useSubscriptionStore } from '@/store/billing/useSubscriptionStore'
import { preloadStripe } from '@/composables/useStripePaymentElement'

document.title = 'Premium - Football Fantasy'

const subscriptionStore = useSubscriptionStore()

// Subscribing can open the add-card sheet one tap from here, so Stripe.js is
// fetched now rather than while the user waits on a skeleton.
preloadStripe()

onMounted(async () => {
  // The manage screen reads plan amounts out of the catalog, so both are needed
  // whichever branch renders.
  await Promise.all([
    subscriptionStore.fetchState().catch(() => {}),
    subscriptionStore.fetchPlans().catch(() => {}),
  ])
})
</script>
