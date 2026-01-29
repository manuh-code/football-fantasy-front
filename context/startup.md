# Instrucciones para el modo agente de Copilot

## Objetivo

Crear una web app moderna y responsiva, siguiendo los lineamientos de UX/UI y desarrollo especificados a continuación.

---

## Stack Tecnológico

- **Frontend Framework:** Vue.js (utilizando Composition API con `setup` y TypeScript en todos los componentes, composables y vistas).
- **Estilos:** SASS + TailwindCSS.
- **Store:** usar Pinia 
- **Iconografía:** Librería [Oh My Vue Icons](npm install oh-vue-icons).
- **Compatibilidad:** Diseño PWA (Progressive Web App), responsivo y optimizado para dark mode y light mode.
- **UX/UI:** Inspirado en un dashboard.
- **Estructura de código:** Limpia, modular y escalable. Separar componentes, vistas y composables por funcionalidad.

---

## Requerimientos de diseño

- **Colores:** Utilizar una paleta similar a la de Laravel Cloud Dashboard. Debe adaptarse automáticamente a modo claro y oscuro.
- **SASS:** El diseño debe estar escrito en SASS, aprovechando variables, mixins y anidamiento de estilos para facilitar la personalización y mantenimiento.
- **Tailwind:** Usar utilidades de Tailwind para layout, espaciados, tipografías y colores personalizados.
- **Modo oscuro y claro:** Toda la app debe detectar y adaptarse al modo de color del sistema o permitir el cambio manual desde la interfaz.
- **PWA:** Configurar el proyecto como Progressive Web App: manifest, service worker, y optimización offline.
- **Responsividad:** El diseño debe adaptarse perfectamente a móviles, tablets y escritorio.
- **UX:** Priorizar la facilidad de uso, navegación intuitiva, accesibilidad y feedback visual.

---

## Convenciones de desarrollo

1. **Vue + TypeScript + Composition API:**  
   Todos los componentes, vistas y composables deben estar escritos usando la API de composición (`setup()`) y tipados con TypeScript.

2. **Estructura de carpetas sugerida:**
   ```
   src/
     assets/
       styles/
         variables.scss
         mixins.scss
         tailwind.scss
     components/
     composables/
     views/
     icons/
     router/
     store/
     main.ts
     App.vue
   ```

3. **Iconos:**
   - Usa Oh My Vue Icons para todos los iconos.
   - Importa solo los iconos necesarios en cada componente.

4. **Estilos globales:**
   - Configura variables SASS para colores principales, secundarios, fondos, textos y estados (éxito, error, advertencia).
   - Integra Tailwind con configuración personalizada de colores y breakpoints.

5. **Dark/Light mode:**
   - Implementa la detección automática del modo de color del sistema.
   - Añade un switch manual en la UI para cambiar entre modos.

6. **PWA:**
   - Incluye `manifest.json` y `service-worker.js`.
   - Configura meta etiquetas para iOS y Android.
   - Asegura que la app funcione offline y pueda instalarse en dispositivos.

---

## Reglas de UX/UI

- Navegación clara y visible.
- Botones e iconos accesibles y con feedback visual.
- Formularios amigables y validados.
- Mensajes de ayuda y error claros.
- Animaciones suaves y no intrusivas.
- Layout flexible pero coherente en todas las vistas.

---

## Ejemplo de componente Vue con Composition API y TypeScript

```typescript
<script lang="ts" setup>
import { ref } from 'vue'
import { MoonIcon, SunIcon } from 'ohmyicons/vue'

const isDark = ref(false)

function toggleMode() {
  isDark.value = !isDark.value
}
</script>

<template>
  <button @click="toggleMode">
    <MoonIcon v-if="isDark" />
    <SunIcon v-else />
    Cambiar modo
  </button>
</template>

<style lang="scss" scoped>
button {
  @apply px-4 py-2 rounded transition-colors;
  background-color: var(--color-bg);
  color: var(--color-text);

  &:hover {
    background-color: var(--color-bg-hover);
  }
}
</style>
```

---

## Recursos útiles

- [Documentación TailwindCSS](https://tailwindcss.com/docs)
- [Guía de PWA con Vue](https://vuejs.org/guide/best-practices/pwa.html)
- [Oh My Vue Icons](https://oh-vue-icons.js.org/docs)
- [Vue + TypeScript](https://vuejs.org/guide/typescript/overview.html)

---

**Sigue estos lineamientos para todo el proyecto. Mantén siempre una estructura ordenada, prioriza la experiencia de usuario y documenta cualquier decisión técnica relevante.**