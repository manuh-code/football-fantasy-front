# LeagueStandingCurrent Component

## Objetivo

Crear un componente de Vue 3 llamado **LeagueStandingCurrent** que muestre una tabla responsiva con la clasificación actual de los equipos de una liga de fútbol (“standings”). El componente debe consumir el endpoint `getCurrentStandings` del servicio `FootballLeagueService` y mostrar los datos principales de cada equipo en la temporada actual.

---

## Estructura de la respuesta esperada

El endpoint retorna un arreglo de objetos con la siguiente estructura (ejemplo de un solo equipo):

```json
{
  "position": 1,
  "result": "equal",
  "points": 15,
  "team": {
    "uuid": "f3955ce8-737d-494d-95c0-0b14c5177b28",
    "name": "Monterrey",
    "short_code": "MNT",
    "image_path": "https://cdn.sportmonks.com/images/soccer/teams/6/2662.png",
    // ...
  },
  "league": { /* ... */ },
  "season": { /* ... */ },
  "stage": { /* ... */ },
  "statistics": [
    // ...
    { "type": { "code": "overall-matches-played" }, "value": 6 },
    { "type": { "code": "overall-won" }, "value": 5 },
    { "type": { "code": "overall-draw" }, "value": 0 },
    { "type": { "code": "overall-lost" }, "value": 1 },
    { "type": { "code": "overall-goals-for" }, "value": 13 },
    { "type": { "code": "overall-goals-against" }, "value": 7 },
    { "type": { "code": "goal-difference" }, "value": 6 }
    // ...
  ],
  "form": [
    { "form": "L", "sort_order": 1 },
    { "form": "W", "sort_order": 2 },
    // ...
  ]
}
```

---

## Campos requeridos en la tabla

La tabla debe mostrar la siguiente información (titulos en **inglés**):

| Position | Team | Matches | Wins | Draws | Losses | Goals For | Goals Against | Goal Difference | Last 5 |
|----------|------|---------|------|-------|--------|-----------|---------------|-----------------|--------|

**Descripción de los campos:**

- **Position:** Posición del equipo en la tabla (`position`)
- **Team:** Logo e imagen del equipo + nombre corto (`team.name` y `team.image_path`)
- **Matches:** Partidos jugados (`statistics` con `"overall-matches-played"`)
- **Wins:** Partidos ganados (`statistics` con `"overall-won"`)
- **Draws:** Partidos empatados (`statistics` con `"overall-draw"`)
- **Losses:** Partidos perdidos (`statistics` con `"overall-lost"`)
- **Goals For:** Goles a favor (`statistics` con `"overall-goals-for"`)
- **Goals Against:** Goles en contra (`statistics` con `"overall-goals-against"`)
- **Goal Difference:** Diferencia de goles (`statistics` con `"goal-difference"`)
- **Last 5:** Últimos 5 partidos jugados, usando el arreglo `form` (solo los 5 más recientes, de derecha a izquierda).

---

## Detalles adicionales

- Los valores de **Last 5** deben representarse visualmente:
  - **W** (Win) = círculo verde
  - **L** (Loss) = círculo rojo
  - **D** (Draw) = círculo amarillo

- Utiliza **Tailwind CSS** para asegurar un diseño responsivo, visualmente limpio y acorde con el diseño general del proyecto.
- La tabla debe adaptarse correctamente a pantallas pequeñas y grandes.
- Los textos de la tabla y títulos deben estar en **inglés**.
- El componente debe manejar correctamente los estados de carga y error.
- Utiliza buenas prácticas de Vue 3 (Composition API).

---

## Ejemplo de tabla

| # | Team           | M | W | D | L | GF | GA | +/- | Last 5               |
|---|----------------|---|---|---|---|----|----|-----|----------------------|
| 1 | ![MNT] Monterrey | 6 | 5 | 0 | 1 | 13 | 7  | +6  | 🟢 🟢 🟢 🟢 🔴         |

---

## Mejoras a las instrucciones originales

- Añadí la gestión de estados de carga/error.
- Especifiqué el uso de **Tailwind** para la responsividad y los estilos visuales de los estados de los partidos.
- Añadí la indicación de incluir el logo del equipo junto al nombre.
- Especificación de la dirección de visualización de los últimos 5 partidos: el más reciente a la derecha.
- Indicaciones para textos en inglés y buenas prácticas de Vue 3.

---

## Sugerencia de estructura de archivos
  
- `/components/football/leagues/LeagueStandingCurrent.vue`
- `/services/FootballLeagueService.js` (o .ts si usas TypeScript)

---

## Resumen

> El componente **LeagueStandingCurrent** debe mostrar la tabla de posiciones de equipos usando los campos principales y las estadísticas más relevantes, con un diseño atractivo, responsivo y en inglés, integrando la lógica de colores para los últimos 5 partidos.
