# Componente FantasyLeagueManagement

## Descripción General

El componente `FantasyLeagueManagement.vue` permite gestionar las reglas de puntuación de una liga fantasy, incluyendo la configuración de condiciones opcionales para cada regla.

## Integración en FantasyLeagueDetailView

### Cambios Realizados en la Vista

La vista `FantasyLeagueDetailView.vue` fue actualizada para:

1. **Cargar datos de la liga**: Se agregó la función `fetchLeagueData()` que obtiene los datos completos de la liga, incluyendo las reglas de puntuación.

2. **Estado de carga**: Se agregó `isLoadingLeague` para manejar el estado de carga.

3. **Computed `scoringData`**: Extrae las reglas de puntuación del objeto de la liga para pasarlas al componente.

4. **Manejo de eventos**: Se agregó `handleLeagueSaved()` para recargar los datos después de guardar cambios.

### Ejemplo de Integración

```vue
<template>
  <div v-else-if="activeTab === 'management'" key="management">
    <!-- Loading State -->
    <div v-if="isLoadingLeague">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
    
    <!-- No Scoring Data -->
    <div v-else-if="!scoringData">
      <p>Sin reglas de puntuación configuradas</p>
    </div>
    
    <!-- Management Component -->
    <FantasyLeagueManagement 
      v-else
      :scoring-data="scoringData" 
      :league-uuid="uuid"
      @saved="handleLeagueSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'

const league = ref<FantasyLeaguesResponse | null>(null)
const isLoadingLeague = ref(false)

const scoringData = computed<FantasyLeagueScoringRules | null>(() => {
  if (!league.value?.scoring_rules?.length) return null
  return league.value.scoring_rules[0]
})

const fetchLeagueData = async () => {
  isLoadingLeague.value = true
  league.value = await fantasyLeagueService.showFantasyLeague(uuid)
  isLoadingLeague.value = false
}

const handleLeagueSaved = () => {
  fetchLeagueData() // Recargar después de guardar
}
</script>
```

## Funcionalidades Principales

### 1. Visualización de Reglas
- Muestra todas las reglas de puntuación de la liga fantasy
- Cada regla incluye:
  - Tipo de estadística
  - Posición del jugador
  - Puntos asignados
  - Condición opcional

### 2. Edición de Puntos
- Permite modificar los puntos asignados a cada regla
- Validación de entrada numérica

### 3. Gestión de Condiciones
- **Activar/Desactivar**: Toggle para habilitar o deshabilitar condiciones
- **Selección de Tipo**: Dropdown con todas las condiciones disponibles
- **Campos Dinámicos**: Formulario generado automáticamente según el tipo de condición seleccionado
- **Validaciones**: Respeta las validaciones definidas (min, max, step, required)

### 4. Guardado de Cambios
- Construye el payload correcto para el API
- Convierte las condiciones a formato JSON
- Maneja errores y muestra notificaciones

## Props

```typescript
{
  scoringData: {
    type: Object as PropType<FantasyLeagueScoringRules>,
    required: true
  },
  leagueUuid: {
    type: String,
    required: true
  }
}
```

### scoringData
Objeto que contiene las reglas de puntuación actuales de la liga:
```typescript
{
  position: TypeResponse | null,
  rules: FantasyRule[]
}
```

### leagueUuid
UUID de la liga fantasy para actualizar las reglas.

## Eventos

### @saved
Emitido cuando las reglas se guardan exitosamente.

### @cancel
Emitido cuando el usuario cancela la edición.

## Ejemplo de Uso

```vue
<script setup lang="ts">
import { ref } from 'vue';
import FantasyLeagueManagement from '@/components/fantasy/FantasyLeagueManagement.vue';
import { FantasyLeagueScoringRules } from '@/interfaces/fantasy/leagues/FantasyLeagueScoringRules';

const scoringData = ref<FantasyLeagueScoringRules>({
  position: null,
  rules: [
    {
      uuid: '123',
      type: { uuid: 'type-1', name: 'Goles', code: 'GOALS' },
      position: { uuid: 'pos-1', name: 'Delantero', code: 'FW' },
      points: 5,
      condition: null
    }
  ]
});

const leagueUuid = 'liga-uuid-123';

const handleSaved = () => {
  console.log('Reglas guardadas exitosamente');
};

const handleCancel = () => {
  console.log('Edición cancelada');
};
</script>

<template>
  <FantasyLeagueManagement
    :scoring-data="scoringData"
    :league-uuid="leagueUuid"
    @saved="handleSaved"
    @cancel="handleCancel"
  />
</template>
```

## Estructura del Payload

El componente construye el siguiente payload para guardar:

```json
{
  "score_rules": [
    {
      "type_uuid": "95549480-5cb3-4410-88b1-94eeb55f3cac",
      "position_uuid": "08cffcc3-0424-47f2-a4ee-7874d99d72d1",
      "points": 1,
      "condition": ""
    },
    {
      "type_uuid": "10130323-5A32-48C2-A6F6-397B68152237",
      "position_uuid": "A99FC6E5-5ADD-46CF-A68E-F7DEC2560674",
      "points": 5,
      "condition": "{\"EVERY\":25}"
    }
  ]
}
```

## Tipos de Condiciones

Las condiciones se obtienen dinámicamente del catálogo mediante `catalogService.getConditionsRules()`.

Cada condición define:
- **code**: Código único de la condición
- **name**: Nombre descriptivo
- **description**: Explicación de la condición
- **fields**: Campos del formulario (tipo, validaciones, valores por defecto)

### Ejemplo de Condición

```typescript
{
  code: "EVERY",
  name: "Cada X estadísticas",
  description: "Otorga puntos cada X veces que se alcanza la estadística",
  fields: [
    {
      key: "EVERY",
      label: "Cada cuántas veces",
      type: "number",
      inputType: "number",
      required: true,
      validation: {
        min: 1,
        step: 1
      },
      default: 1
    }
  ]
}
```

## Flujo de Datos

1. **Inicialización**:
   - Carga las condiciones disponibles del catálogo
   - Copia las reglas del prop `scoringData`
   - Inicializa el estado de condiciones para cada regla

2. **Edición**:
   - Usuario modifica puntos
   - Usuario activa/desactiva condiciones
   - Usuario selecciona tipo de condición
   - Usuario completa campos dinámicos

3. **Guardado**:
   - Construye JSON de condiciones para cada regla
   - Crea payload con formato correcto
   - Llama a `fantasyLeagueService.updateScoreRules()`
   - Emite evento `saved` si es exitoso

## Características de UI

### Diseño Responsivo
- Mobile-first con TailwindCSS
- Adaptable a diferentes tamaños de pantalla

### Dark Mode
- Soporte completo para modo oscuro
- Colores adaptativos según tema

### Estados Visuales
- Loading spinner durante carga
- Mensajes de error claros
- Feedback visual en botones
- Badges para posiciones

### Accesibilidad
- Labels asociados correctamente
- Placeholders informativos
- Textos de ayuda para campos
- Navegación por teclado

## Dependencias

- **Services**: 
  - `catalogService` - Obtener condiciones disponibles
  - `fantasyLeagueService` - Actualizar reglas

- **Composables**:
  - `useToast` - Notificaciones

- **Interfaces**:
  - `FantasyLeagueScoringRules`
  - `FantasyConditionsRulesResponse`
  - `ScoreRulePayload`

## Validaciones

El componente respeta las validaciones definidas en cada campo:
- **min/max**: Valores mínimos y máximos para números
- **step**: Incremento para campos numéricos
- **required**: Campos obligatorios
- **type**: Tipo de dato esperado

## Manejo de Errores

- Captura errores al cargar condiciones
- Captura errores al guardar reglas
- Muestra mensajes descriptivos
- Notificaciones toast para feedback

## Optimizaciones

- Uso de `v-model` para binding bidireccional
- Campos dinámicos generados según configuración
- Estado reactivo con Vue 3 Composition API
- Parsing inteligente de condiciones existentes
