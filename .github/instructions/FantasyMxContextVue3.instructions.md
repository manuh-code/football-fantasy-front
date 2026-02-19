---
applyTo: "**"
---

---

## applyTo: '\*\*'

# 📌 Instrucciones para GitHub Copilot

## 🌍 Idioma

- Todas las respuestas y sugerencias deben estar **en español**.
- Evitar respuestas en inglés salvo que sea estrictamente necesario (ejemplo: nombres de librerías, clases, APIs o palabras reservadas de programación).

## 🖼️ Contexto del Proyecto

- El proyecto está desarrollado en **Vue 3** con **Composition API**.
- Se utilizan **TailwindCSS** y, cuando aplique, componentes compatibles con **dark mode**.
- Backend en **Laravel 12** (API REST), pero el enfoque principal aquí es el frontend en Vue 3.
- Diseño: estilo **moderno, limpio, minimalista** y **orientado al fútbol (fantasy football)**.
- Compatibilidad: debe funcionar tanto en escritorio como en dispositivos móviles (diseño responsive).

## 📐 Lineamientos de Código

1. **Sintaxis Vue 3**
   - Usar `script setup` siempre que sea posible.
   - Preferir `ref` y `computed` en lugar de `data` y `methods` tradicionales.
   - Evitar el uso de `this` en componentes, utilizar la **Composition API**.

2. **Estilo**
   - Usar **TailwindCSS** para la maquetación y estilos.
   - Seguir un diseño limpio, con espaciados consistentes.
   - Considerar **dark mode** en todos los componentes.

3. **Buenas prácticas**
   - Código legible y bien indentado.
   - Nombres de variables y funciones descriptivos en **español o inglés consistente**, nunca mezclar.
   - Separar la lógica de negocio (services, composables) de los componentes visuales.
   - Manejo de estado preferentemente con **Pinia** en lugar de Vuex.

4. **Documentación**
   - Comentar cuando sea necesario para explicar lógica compleja.
   - Usar JSDoc en funciones utilitarias o composables importantes.

5. **Codigo**
   - Todo el codigo debe estar en ingles
   - Evitar el uso de palabras reservadas en español, como "contador", "incrementar", etc. En su lugar, usar términos en inglés como "counter", "increment", etc.

## ✅ Ejemplo de Estructura de Componente

```vue
<script setup>
import { ref, computed } from "vue";

const contador = ref(0);
const doble = computed(() => contador.value * 2);

function incrementar() {
  contador.value++;
}
</script>

<template>
  <div class="p-4 text-center">
    <p class="text-lg font-bold">Contador: {{ contador }}</p>
    <p class="text-gray-500">Doble: {{ doble }}</p>
    <button
      @click="incrementar"
      class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      Incrementar
    </button>
  </div>
</template>
```
