<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-lg">
      <div class="animate-page-enter">
        <PaymentMethodsComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PaymentMethodsComponent from '@/components/user/billing/PaymentMethodsComponent.vue'
import { preloadStripe } from '@/composables/useStripePaymentElement'

document.title = 'Payment Methods - Football Fantasy'

// The card form is one tap away from here, and this also covers users who signed
// in during this session (the boot-time preload only sees a restored token).
preloadStripe()
</script>
