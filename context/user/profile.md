# Instrucciones para crear la vista y componente de perfil de usuario en Vue 3

## Objetivo

Implementar una vista y un componente para mostrar el perfil del usuario logueado en la aplicación.

---

## Estructura de archivos

- Carpeta `views/user/`:
  - Archivo: `ProfileView.vue`
  - Contiene la vista que invoca el componente de perfil.

- Carpeta `components/user/`:
  - Archivo: `ProfileComponent.vue`
  - Componente que renderiza la información del usuario logueado.

---

## Detalles de implementación

### Vista: `ProfileView.vue`
- Esta vista debe importar y renderizar el componente `ProfileComponent`.
- Ubícala en la carpeta `views/user/`.

### Componente: `ProfileComponent.vue`
- Ubica este componente en la carpeta `components/user/`.
- El componente debe mostrar la información del usuario logueado.
- Utiliza el store de Pinia `useUserStore` y el getter `getUserData`.
- La estructura de los datos está basada en la interfaz `UserDataInterface`.

#### Ejemplo de campos a mostrar:
   uuid: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    avatar: string;


---

## Consideraciones

- El diseño debe ser limpio y responsivo, usando TailwindCSS si el proyecto ya lo tiene integrado.
- Los textos pueden estar en inglés para mantener consistencia internacional.
- No implementes lógica de edición, solo la vista de perfil.
- Si el usuario no está logueado, el componente debe mostrar un mensaje apropiado o no renderizar información.

---