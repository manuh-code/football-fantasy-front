<script lang="ts" setup>
import UserStoreComponent from "@/components/user/store/UserStoreComponent.vue";
import HomeMenu from "@/components/home/HomeMenu.vue";
</script>

<template>
  <div class="register-view">
    <UserStoreComponent />
  </div>
  <HomeMenu />
</template>

<style lang="scss" scoped>
.register-view {
  @apply min-h-screen;
}
</style>
