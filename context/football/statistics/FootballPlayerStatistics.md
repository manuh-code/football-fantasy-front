# Instrucciones para Implementar la Ruta y Vista de Estadísticas de Jugadores de Fútbol

## 1. Crear la Ruta Protegida

- Crea una ruta protegida que apunte a la vista `FootballPlayerStatisticsView`.
- Guarda la vista en:  
  `views/football/player/FootballPlayerStatisticsView.vue`

## 2. Vista: FootballPlayerStatisticsView

- Esta vista debe importar y utilizar el componente `FootballPlayerStatistic`.

## 3. Componente: FootballPlayerStatistic

### A. Buscador/Filtros

El componente debe incluir un buscador con los siguientes campos de filtro:

#### 1. `seasons`
- **Tipo:** select
- **Carga de datos:** Llama al método `getSeasonByFantasyLeagueUuid` del service `CatalogService` para llenar las opciones.

#### 2. `teamsUuids`
- **Tipo:** select
- **Comportamiento:**
  - Al montar el componente, este select debe estar deshabilitado.
  - Se habilita solo cuando el usuario selecciona un valor en `seasons`.
  - Al seleccionar una season, invoca `getTeamsBySeasonUuid` del service `CatalogService` enviando como parámetro el uuid de la season seleccionada.
  - Pinta los teams que retorna el API.

#### 3. `name`
- **Tipo:** input de texto libre
- **Función:** Permite buscar por nombre del jugador.

#### 4. `statTypes`
- **Tipo:** multiselect
- **Carga de datos:** Utiliza el método `getTypeStatistic` de `CatalogService` para llenar las opciones.
- **Implementación:** Usa una librería compatible con Vue 3 para el multiselect (ejemplo sugerido: vue-multiselect, vue-select, etc.) Asegúrate de validar la compatibilidad antes de implementarlo.

### B. Consulta de Datos

- En el método `onMounted` del componente, invoca el método `getFootballPlayerStatistics` del service `FootballPlayerService`.
- Muestra los datos retornados en una tabla.

#### Ejemplo de Response (importante para la estructura de la tabla):

```json
{
    "data": [
        {
            "uuid": "a55741f3-45e1-4b7e-8d41-2e5ee9a13a34",
            "age": 24,
            "common_name": "A. Mejía Montoya",
            "full_name": "Aaron Mejía MontoyaAaron",
            "display_name": "Aarón Mejía",
            "image_path": "...",
            "country": { ... },
            "position": { ... },
            "team": { ... },
            "statistics": {
                "uuid": "...",
                "has_values": false,
                "details": {
                    "minutes_played": 180,
                    "rating": 6.38,
                    "goals": 0,
                    "assists": 0,
                    "yellow_cards": 0,
                    "red_cards": 0
                }
            }
        }
    ],
    "pagination": { ... }
}
```

- NOTA: El objeto `details` dentro de `statistics` puede tener distintas keys dependiendo del tipo de estadísticas. La tabla debe ser capaz de adaptarse dinámicamente a las keys presentes.

### C. Tabla de Resultados

- Muestra todos los datos relevantes de cada jugador y sus estadísticas.
- Adapta la tabla para mostrar dinámicamente las columnas de acuerdo a las keys que vengan en `statistics.details`.
- Incluye columnas para: Nombre, Equipo, Edad, País, Posición, Imagen, y las estadísticas dinámicas.

### D. Paginación

- Implementa la paginación utilizando la información del objeto `pagination` que retorna el API.
- Usa los estilos del proyecto con Tailwind CSS para la paginación y la tabla.

### E. Consideraciones Generales

- Sigue las buenas prácticas de Vue 3 (composition API preferentemente).
- El código debe estar modularizado y legible.
- Asegúrate de manejar los estados de carga y error apropiadamente.
- Los filtros deben estar sincronizados con la consulta y permitir búsquedas combinadas.

---

## Resumen Estructural

1. **Ruta protegida**  
   ↳ `views/football/player/FootballPlayerStatisticsView.vue`  
   ↳ Importa y usa `FootballPlayerStatistic`

2. **Componente `FootballPlayerStatistic`**  
   - Filtros (`seasons`, `teamsUuids`, `name`, `statTypes`)
   - Tabla de resultados (datos + columnas dinámicas)
   - Paginación con Tailwind
   - Llamadas a los servicios (`CatalogService`, `FootballPlayerService`)

---

## Ejemplo de Árbol de Archivos

```
src/
└── views/
    └── football/
        └── player/
            └── FootballPlayerStatisticsView.vue
└── components/
    └── football/
        └── player/
            └── FootballPlayerStatistic.vue
```

---