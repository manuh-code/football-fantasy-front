<template>
  <div class="dashboard-view animate-fade-in">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Dashboard
        </h1>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Dashboard component logic will be added here as needed
</script>

<style scoped>
.dashboard-view {
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
  transition: background-color 0.2s;
}

.container {
  max-width: 1200px;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive typography */
@media (max-width: 768px) {
  .text-4xl {
    font-size: 2rem;
  }
}
</style>
