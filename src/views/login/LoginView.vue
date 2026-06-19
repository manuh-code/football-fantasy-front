<script lang="ts" setup>
import LoginComponent from '@/components/login/LoginComponent.vue'
import HomeMenu from '@/components/home/HomeMenu.vue'
</script>

<template>
  <div class="login-view">
    <LoginComponent />
  </div>
  <HomeMenu />
</template>

<style lang="scss" scoped>
.login-view {
  @apply min-h-screen;
}
</style>
