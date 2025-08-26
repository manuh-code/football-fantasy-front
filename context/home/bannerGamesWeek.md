# Instrucciones para Copilot

## Objetivo
Agregar un **banner minimalista** en el `HomeComponent` de un proyecto **Vue 3**.  
El banner debe mostrar los **partidos de la semana actual**, obtenidos desde el método `getFixturesForTheWeek` del servicio `FootballFixtureService`.

---

## Requerimientos de diseño
- Usar **TailwindCSS** respetando el estilo existente del proyecto.  
- Debe ser **compatible con dark mode**.  
- Estilo **minimalista y limpio**.  
- El banner debe ser **responsivo** (adaptado a móvil y escritorio).  

### Para cada partido mostrar:
- 🛡 **Escudos de los equipos**.  
- 👥 **Nombres de los equipos**.  
- 📊 **Marcador final** (si existe).  
- 🏆 **Resaltar al ganador** (puede ser con tipografía más fuerte o color).  
- 🕒 **Fecha del partido**, mostrada de manera **sutil pero clara**.  

---

## Ubicación
El banner debe implementarse en el **`HomeComponent`** y consumir datos de `FootballFixtureService.getFixturesForTheWeek`.

---

## Ejemplo de respuesta de la API
El método `getFixturesForTheWeek` responde con un objeto JSON con esta estructura (simplificada):

```json
{
  "code": 200,
  "message": "Fixtures for the week",
  "data": [
    {
      "league": {
        "name": "Liga MX - Mexico",
        "image_path": "https://cdn.sportmonks.com/images/soccer/leagues/7/743.png"
      },
      "football_state": {
        "state": "FT",
        "name": "Full Time"
      },
      "name": "Querétaro vs Atlas",
      "starting_at": "2025-08-17 10:00:00",
      "participants": [
        {
          "team": {
            "name": "Querétaro",
            "image_path": "https://cdn.sportmonks.com/images/soccer/teams/26/538.png"
          },
          "meta": {
            "location": "home",
            "winner": false
          }
        },
        {
          "team": {
            "name": "Atlas",
            "image_path": "https://cdn.sportmonks.com/images/soccer/teams/8/680.png"
          },
          "meta": {
            "location": "away",
            "winner": true
          }
        }
      ],
      "scores": [
        { "participant_id": 538, "score": { "goals": 3 } },
        { "participant_id": 680, "score": { "goals": 2 } }
      ]
    }
  ]
}
