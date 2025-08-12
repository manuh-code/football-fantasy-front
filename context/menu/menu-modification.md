# Instrucciones para implementar el menú dinámico en Vue 3 con TailwindCSS

## Objetivo

Vas a modificar el menú principal de la aplicación **FantasyMX** para que sea dinámico, responsive y se adapte al estilo visual basado en TailwindCSS que ya existe en el proyecto.

---

## Requisitos funcionales

1. **Estructura del menú:**
   - El menú debe estar fijado en la parte superior (`navbar`) de la página.
   - En la parte izquierda debe mostrar el nombre de la app: `FantasyMX`.
   - A la derecha:
     - Botón para cambiar entre modo oscuro/claro (switch darkmode, ya implementado).
     - Botón `Login`, que redirigirá a la vista de login si el usuario no está autenticado.
     - Si el usuario está autenticado (usa el método `isAuthenticated` del store `useAuthStore`):
       - Mostrar el avatar del usuario, obtenido desde el getter `getAvatarUrl` del store `useUserStore`.
       - Al hacer click en el avatar, se debe desplegar un menú con las siguientes opciones:
         - `View profile`
         - `Logout`

2. **Idiomas:**
   - Todos los textos y labels del menú deben estar en inglés.

3. **Responsividad y experiencia de usuario:**
   - El menú debe adaptarse a dispositivos móviles y escritorio.
   - Debe utilizar clases y utilidades de TailwindCSS para mantener la coherencia visual con el resto de la app.
   - El menú desplegable del avatar debe tener animación y cerrar al hacer click fuera o seleccionar una opción.
   - Maximiza la experiencia del usuario: usa transiciones suaves, accesibilidad básica (focus, aria).

---

## Consideraciones técnicas

- No implementes la lógica de redirección aún, sólo la vista y los componentes necesarios del menú.
- Utiliza los stores `useAuthStore` y `useUserStore` para obtener el estado de autenticación y el avatar respectivamente.
- Mantén la estructura de componentes del proyecto. Si es necesario, crea un componente nuevo para el menú.
- El menú debe funcionar correctamente tanto en modo oscuro como en modo claro.

---

## Ejemplo de estructura (solo referencia visual, no código final):

```
| FantasyMX | (Darkmode Switch) | Login | [Avatar] ▼
                                        └── View profile
                                        └── Logout
```

---
