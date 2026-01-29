# Instrucciones para crear el formulario de FantasyLeagueCreate en Vue 3

A continuación, se describen los pasos y recomendaciones para implementar el formulario de creación de ligas fantasy, usando **Vue 3**, **TailwindCSS**, y siguiendo las mejores prácticas de UX/UI. El formulario será completamente dinámico, responsive y amigable para el usuario.

---

## 1. Estructura de componentes

Debes crear:

- **Componente**: `FantasyLeagueCreate.vue`
- **Vista**: `FantasyLeagueCreateView.vue`
- **Servicios**: Usar los métodos `storeFantasyLeague` (FantasyLeagueService) y `getFootballLeagues` (CatalogService)
- **UI Components**: Utiliza los componentes de tu librería UI base (inputs, select, switch, etc.) y componentes de fecha compatibles con Tailwind (ver sección 7).

---

## 2. Payload del formulario

Debes mapear el siguiente payload a los campos del formulario:

```json
{
    "name": "",
    "status_uuid": null,
    "league_uuid": "",
    "participants_count": 8,
    "description": "",
    "is_private": true,
    "password": "",
    // "image_path": "",
    "started_at": "",
    "draft": {
        "draft_day": "",
        "pick_timer": 120,
        "snake_order": true
    }
}
```

---

## 3. Campos y tipos de input

| Campo                | Tipo de input         | Extra / Validaciones                                         |
|----------------------|----------------------|-------------------------------------------------------------|
| name                 | Input texto          | Requerido, máximo 255 caracteres                            |
| status_uuid          | Select / hidden      | Opcional o hidden si no aplica                              |
| league_uuid          | Select               | Requerido, opciones desde `getFootballLeagues`              |
| participants_count   | Input numérico       | Requerido, min 2, max 20                                    |
| description          | Textarea             | Opcional, máximo 500 caracteres                             |
| is_private           | Switch / Checkbox    | True/False, muestra input password si está en true          |
| password             | Input texto          | Solo requerido si is_private=true                            |
| image_path           | Input file           | Opcional, puedes usar un componente de imagen si aplica     |
| started_at           | DateTimePicker       | Requerido, usar calendario compatible con Tailwind          |
| draft.draft_day      | DateTimePicker       | Requerido, usar calendario compatible con Tailwind          |
| draft.pick_timer     | Input numérico       | Requerido, en segundos, min 30                              |
| draft.snake_order    | Switch / Checkbox    | True/False                                                  |

---

## 4. Manejo de errores 422

- Al recibir un error 422, debes mostrar los mensajes de error debajo del input correspondiente.
- Los errores pueden ser anidados (ejemplo: `draft.draft_day`), así que asegúrate de mapearlos correctamente.
- Utiliza un objeto `errors` en el componente para almacenar los mensajes y mostrarlos dinámicamente.

---



## 7. Date/Time Picker con Tailwind

Para los campos de fecha, puedes utilizar una librería como [Vue Tailwind Datepicker](https://vue-tailwind-datepicker.vercel.app/) o [vue3-date-time-picker](https://vue3datepicker.com/) que tienen integración con Tailwind:
o si tienes algo nativo de tailwind usalo

---

## 8. Responsive y UX

- Usa clases de Tailwind como `w-full`, `max-w-lg`, `space-y-6`, `flex flex-col md:flex-row gap-4`, etc.
- Los inputs deben ocupar 100% en móvil, y agruparse en columnas en escritorio si el diseño lo permite.
- Mantén los botones grandes y accesibles.

---

## 9. Vista FantasyLeagueCreateView

```vue
<template>
  <PageHeader title="Crear Nueva Liga Fantasy" />
  <div class="max-w-2xl mx-auto p-4">
    <FantasyLeagueCreate />
  </div>
</template>
```

---

## 10. Notas adicionales


- Si tienes un sistema de notificaciones, úsalo para mostrar mensajes de éxito o error globales.
- Puedes mostrar un loading spinner en el botón mientras se envía el formulario.

