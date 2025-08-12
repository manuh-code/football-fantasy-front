# Instrucciones para agregar la ruta "Favorite Football Team" y su funcionalidad en el proyecto Vue 3

## 1. Crear la ruta

- **Ruta:** `/favorite-football-team`
- **Meta:** `{ requiresAuth: true }`
- **Vista:** `FavoriteTeamView` ubicada en `src/views/user/favoriteTeam/FavoriteTeamView.vue`

Ejemplo en tu archivo de rutas (`src/router/index.js` o equivalente):

```js
{
  path: '/favorite-football-team',
  name: 'FavoriteFootballTeam',
  component: () => import('@/views/user/favoriteTeam/FavoriteTeamView.vue'),
  meta: { requiresAuth: true }
}
```

---

## 2. Crear la vista

- **Ubicación:** `src/views/user/favoriteTeam/FavoriteTeamView.vue`
- **Contenido:** Debe incluir el componente `<FavoriteTeamComponent />` y manejar la lógica de página.

```vue
<template>
  <FavoriteTeamComponent />
</template>

<script setup>
import FavoriteTeamComponent from '@/components/user/favoriteTeam/FavoriteTeamComponent.vue'
</script>
```

---

## 3. Crear el componente `FavoriteTeamComponent`

- **Ubicación:** `src/components/user/favoriteTeam/FavoriteTeamComponent.vue`
- **Funcionalidad:**  
  - Formulario con un select para elegir el equipo favorito.
  - El select debe usar el componente reutilizable `SelectComponent` (ver punto 4).
  - Debe ser responsive, con buena experiencia UX y estilos Tailwind.

#### Ejemplo básico:

```vue
<template>
  <form class="max-w-md mx-auto p-4 rounded shadow bg-white">
    <label for="footballTeam" class="block mb-2 text-sm font-medium text-gray-700">
      Selecciona tu equipo favorito
    </label>
    <SelectComponent
      v-model="selectedTeam"
      :options="teams"
      value-key="id"
      label-key="name"
      placeholder="Elige un equipo"
    />
    <button
      type="submit"
      class="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Guardar
    </button>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SelectComponent from '@/components/ui/SelectComponent.vue'
import catalogService from '@/services/catalog/catalogService'

const teams = ref([])
const selectedTeam = ref(null)

onMounted(async () => {
  teams.value = await catalogService.getFootballTeams()
})
</script>
```

---

## 4. Verificar y/o crear el componente `SelectComponent`

- **Ubicación:**  
  - Si existe: `src/components/ui/SelectComponent.vue`
  - Si no existe, créalo siguiendo estilos Tailwind, responsive y UX amigable.

#### Ejemplo de `SelectComponent.vue`:

```vue
<template>
  <select
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
  >
    <option disabled value="">{{ placeholder }}</option>
    <option
      v-for="option in options"
      :key="option[valueKey]"
      :value="option[valueKey]"
    >
      {{ option[labelKey] }}
    </option>
  </select>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  options: { type: Array, default: () => [] },
  valueKey: { type: String, default: 'id' },
  labelKey: { type: String, default: 'name' },
  placeholder: { type: String, default: 'Selecciona una opción' }
})
defineEmits(['update:modelValue'])
</script>
```

---

## 5. Crear el servicio `catalogService`

- **Ubicación:** `src/services/catalog/catalogService.js`
- **Estructura:** Debe seguir el patrón de tus servicios previos.
- **Método:**  
  - `getFootballTeams`: hace llamada al API `GET catalog/teams`

#### Ejemplo básico de `catalogService.js`:

```js
import apiClient from '@/services/apiClient' // Asegúrate que existe

const catalogService = {
  async getFootballTeams() {
    const response = await apiClient.get('catalog/teams')
    return response.data
  }
}

export default catalogService
```

---

## 6. Detalles UX y buenas prácticas

- El formulario debe validar la selección antes de enviar.
- Usa mensajes de error claros si la API falla o no hay equipos.
- El select debe permitir reutilización en otros formularios, por eso va en `/ui/`.
- Sigue los estilos y clases Tailwind definidos en el proyecto para coherencia visual.
- Revisa la accesibilidad (label for, focus, tamaño, etc).

---

### Resumen de estructura de archivos involucrados:

```
src/
│
├─ views/
│   └─ user/
│       └─ favoriteTeam/
│           └─ FavoriteTeamView.vue
│
├─ components/
│   └─ user/
│       └─ favoriteTeam/
│           └─ FavoriteTeamComponent.vue
│   └─ ui/
│       └─ SelectComponent.vue
│
├─ services/
│   └─ catalog/
│       └─ catalogService.js
```
