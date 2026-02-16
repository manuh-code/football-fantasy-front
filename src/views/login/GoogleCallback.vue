<script setup>
import { useAuthStore } from '@/store';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
    try {
        // Usamos solo los query params sin la ruta
        const queryString = window.location.search;
        console.log(queryString);
        await authStore.loginWithGoogle(queryString);
        
        
        // Si todo sale bien, al dashboard
        router.push('/dashboard');
    } catch (error) {
        console.error("Falló el login", error);
        // router.push('/login?error=social_auth_failed');
    }
});
</script>

<template>
    <div class="loading-screen">
        <p>Autenticando con Google, por favor espera...</p>
    </div>
</template>