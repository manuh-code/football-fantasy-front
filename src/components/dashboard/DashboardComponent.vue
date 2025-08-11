<template>
  <div class="dashboard-component">
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">Dashboard</h1>
      </div>
      
      <!-- Content area (ready for future features) -->
      <div class="dashboard-content">
        <!-- Dashboard content will be added here -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Dashboard component logic will be added here as needed
</script>

<style scoped>
.dashboard-component {
  width: 100%;
  background-color: var(--color-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  transition: background-color 0.2s;
}

.dashboard-container {
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-content {
  /* Ready for future content */
  min-height: 200px;
}

/* Responsive design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1.5rem;
  }
  
  .dashboard-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .dashboard-title {
    font-size: 1.75rem;
  }
}

/* Animation */
.dashboard-component {
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
