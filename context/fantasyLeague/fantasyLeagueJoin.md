# Instrucciones para implementar el buscador y filtro de Fantasy Leagues

## 1. Vista y componente principal

- **Vista:** `JoinFantasyLeagueView`  
  - Ubicación sugerida: `src/views/fantasy/JoinFantasyLeagueView.vue`
  - Debe invocar el componente `<JoinFantasyLeagueComponent />`.

```vue
<template>
  <JoinFantasyLeagueComponent />
</template>

<script setup>
import JoinFantasyLeagueComponent from '@/components/fantasy/JoinFantasyLeagueComponent.vue'
</script>
```

---

## 2. Componente: JoinFantasyLeagueComponent

- **Ubicación:** `src/components/fantasy/JoinFantasyLeagueComponent.vue`
- **Funcionalidad:**  
  - Input de búsqueda (nombre o descripción).
  - Dos radio buttons para filtrar por pública o privada.
  - Al buscar, invoca `getFantasyLeaguesSearch` de `CatalogService` con el payload `FantasyLeagueSearchPayload`.
  - Muestra los resultados usando cards reutilizables (ver punto 4).

### Ejemplo básico del formulario:

```vue
<template>
  <div class="max-w-2xl mx-auto p-4">
    <form @submit.prevent="searchLeagues" class="flex flex-col gap-4">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar fantasy league por nombre o descripción"
        class="input input-bordered w-full"
      />
      <div class="flex gap-4">
        <label class="flex items-center gap-2">
          <input type="radio" v-model="isPrivate" :value="false" /> Pública
        </label>
        <label class="flex items-center gap-2">
          <input type="radio" v-model="isPrivate" :value="true" /> Privada
        </label>
      </div>
      <button type="submit" class="btn btn-primary w-full">Buscar</button>
    </form>
    <div v-if="leagues.length" class="mt-6 grid gap-6">
      <FantasyLeagueCard
        v-for="league in leagues"
        :key="league.uuid"
        :league="league"
        :showJoinButton="true"
        @join="onJoinLeague"
      />
    </div>
    <div v-else class="mt-6 text-center text-gray-500">
      No se encontraron ligas.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CatalogService from '@/services/catalog/catalogService'
import FantasyLeagueCard from '@/components/fantasy/FantasyLeagueCard.vue'

const search = ref('')
const isPrivate = ref(false)
const leagues = ref([])

const searchLeagues = async () => {
  const payload = {
    search: search.value,
    is_private: isPrivate.value
    // Otros campos si son necesarios
  }
  leagues.value = await CatalogService.getFantasyLeaguesSearch(payload)
}

const onJoinLeague = (league) => {
  if (league.is_private) {
    // Mostrar modal o input para solicitar contraseña antes de llamar join
  } else {
    // Lógica para unirse directamente
  }
}
</script>
```

---

## 3. Servicio: CatalogService

- **Método:** `getFantasyLeaguesSearch(payload: FantasyLeagueSearchPayload)`
- **Ubicación:** `src/services/catalog/catalogService.js`
- **Estructura:** Debe seguir el patrón de los services existentes.

```js
// Ejemplo de CatalogService.js
const CatalogService = {
  async getFantasyLeaguesSearch(payload) {
    const response = await apiClient.post('catalog/fantasy-leagues/search', payload)
    return response.data // Array de FantasyLeaguesResponse
  }
}
export default CatalogService
```

---

## 4. Card de Fantasy League reutilizable

- **Componente:** `FantasyLeagueCard`
- **Ubicación:**  
  - Si ya existe en `UserFantasyLeagueComponent`, refactórala para que sea reutilizable (por ejemplo, `FantasyLeagueCard.vue` en `components/fantasy/`).
  - Debe aceptar props como `league`, `showJoinButton`, y emitir eventos como `join`.
  - Si la liga es privada, al hacer clic en el botón "Unirse", solicita la contraseña (puedes usar un modal reutilizable de tu UI).

```vue
// FantasyLeagueCard.vue
<template>
  <div class="card bg-white shadow rounded p-4 flex flex-col gap-2">
    <img :src="league.image_path" alt="League" class="w-16 h-16 rounded object-cover" />
    <h2 class="text-lg font-bold">{{ league.name }}</h2>
    <p class="text-gray-600">{{ league.description }}</p>
    <span class="badge" :class="league.is_private ? 'badge-error' : 'badge-success'">
      {{ league.is_private ? 'Privada' : 'Pública' }}
    </span>
    <button
      v-if="showJoinButton"
      @click="$emit('join', league)"
      class="btn btn-primary w-full mt-2"
    >
      Unirse
    </button>
  </div>
</template>
<script setup>
defineProps({
  league: Object,
  showJoinButton: Boolean
})
defineEmits(['join'])
</script>
```

---

## 5. Reutilización de componentes UI

- **Inputs, radios, botones, modales:** Usa los componentes UI del proyecto (si existen). Si no existen, crea componentes reutilizables y colócalos en `components/ui/`.
- **Estilos:** Siempre usa Tailwind y respeta el diseño y experiencia UX definidos.
- **Iconos:** Si usas iconos (por ejemplo, para indicar pública/privada), importa los iconos necesarios de tu librería (ejemplo: Heroicons, FontAwesome).

---

## 6. Estructura de archivos recomendada

```
src/
│
├─ views/
│   └─ fantasy/
│       └─ JoinFantasyLeagueView.vue
│
├─ components/
│   ├─ fantasy/
│   │    ├─ JoinFantasyLeagueComponent.vue
│   │    └─ FantasyLeagueCard.vue
│   └─ ui/
│        ├─ InputComponent.vue
│        ├─ RadioComponent.vue
│        └─ ModalComponent.vue
│
├─ services/
│   └─ catalog/
│       └─ catalogService.js
```

---

## 7. Notas de UX

- Valida el input antes de buscar.
- Mensajes claros en caso de error o sin resultados.
- Si la liga es privada, muestra prompt para contraseña y valida antes de unirse.
- Feedback visual para loading y acciones.

---