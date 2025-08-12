# Instrucciones para implementar el cambio de contraseña en Vue 3

Este documento describe los pasos y la estructura necesaria para agregar la funcionalidad de cambio de contraseña en tu proyecto Vue 3, siguiendo la misma lógica y patrones usados en los demás componentes del proyecto.

---

## 1. Crear el componente `changePasswordComponent`

**Ubicación:** `src/components/password/changePasswordComponent.vue`

El componente debe ser un formulario con tres campos:

- **old password** (contraseña actual)
- **new password** (nueva contraseña)
- **confirm password** (confirmar nueva contraseña)

Cada campo debe mostrar mensajes de error debajo del input si existen errores de validación. Usa el state `ValidationErrors` como en otros componentes del proyecto.

---

## 2. Crear la interfaz de payload

**Ubicación:** `src/user/password/changePasswordPayload.ts`

Define la interfaz para el payload que se enviará al API:

```typescript
export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}
```

---

## 3. Implementar la lógica en el store

**Archivo:** `src/stores/user/useUserStore.ts`

Agrega el método `changePassword` en el store. Este método debe recibir el payload y utilizar el método `changePassword` de `UserService`. Maneja los errores usando el state `ValidationErrors` como en otros componentes similares.


---

## 4. Implementar el método en el servicio

**Archivo:** `src/services//user/UserService.ts`

Agrega el método `changePassword` que haga la petición al endpoint correspondiente. Este método debe retornar la estructura que incluye el campo `data` con la interfaz `UserDataInterface`:

```typescript
import { ChangePasswordPayload } from '@/user/password/changePasswordPayload';
import { UserDataInterface } from '@/interfaces/UserDataInterface';

export async function changePassword(payload: ChangePasswordPayload): Promise<{ data: UserDataInterface }> {
  // Implementa la llamada al API usando axios o fetch
  // Retorna la respuesta en el formato especificado
}
```

Ejemplo de respuesta exitosa (`200`):

```json
{
  "timestamp": "2025-08-12 01:49:05",
  "code": 200,
  "message": "Password updated successfully.",
  "data": {
    "uuid": "b86ca398-98c2-4095-862c-380ea53a8776",
    "firstname": "Ignacio Manuel",
    "lastname": "Sanchez Neri",
    "fullname": "Ignacio Manuel Sanchez Neri",
    "phone": "5541234567",
    "email": "manuh0989@gmail.com",
    "avatar": "https://api.fantasymx.test/storage/avatar/1-rpz4PC5cAMUgjZcaT5WbT9PvigXqic5AVeL9Fz5Z.jpeg"
  }
}
```

En caso de error (`422`), muestra los mensajes de error debajo de cada input, igual que en los demás formularios.

---

## 5. Crear la vista

**Ubicación:** `src/views/user/password/changePasswordView.vue`

Esta vista debe renderizar el componente `changePasswordComponent` y manejar la navegación o feedback para el usuario tras el cambio exitoso o error.

---

## 6. Consistencia de la lógica

Antes de finalizar, revisa otros componentes similares (por ejemplo, formularios de edición de perfil, login, etc.) y asegúrate que:

- El manejo de errores y validaciones sea igual.
- Los states y métodos usados sean consistentes.
- No haya diferencias en la estructura del código, ni en la forma de mostrar mensajes al usuario.

---

## Referencias

- [UserDataInterface](src/interfaces/user/UserDataInterface.ts)
- [ValidationErrors state](src/stores//validation/useValidationStore.ts)

