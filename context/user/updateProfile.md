# Instrucciones para actualizar el perfil de usuario en Vue 3

## Objetivo

Implementar la funcionalidad para actualizar el perfil del usuario logueado utilizando un servicio y el store de Pinia.

---

## Estructura y pasos

### 1. Crear la interfaz `UserPayload`

- Ubicación: `interfaces/user/userPayload.ts`
- Debe contener los siguientes campos:
  - `firstName`: string
  - `lastName`: string
  - `email`: string
  - `phone`: string

**Ejemplo:**
```typescript
export interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
```

---

### 2. Crear el método `updateProfile` en `UserService`

- Ubicación: `services/UserService.ts`
- Método estático `updateProfile` que reciba un payload de tipo `UserPayload`.
- Debe hacer una petición PUT al endpoint `user/update` enviando el payload.



---

### 3. Crear la action `updateProfile` en el store `useUserStore`

- Ubicación: `stores/useUserStore.ts`
- Action asíncrona llamada `updateProfile` que reciba el payload.
- Debe llamar al método `updateProfile` de `UserService`.
- Si la respuesta es exitosa (`status === 200`), actualiza el state `userData` con los datos recibidos del API.



---

## Consideraciones

- El método debe manejar posibles errores y lanzar excepciones si la petición falla.
- La actualización del estado `userData` permite que el perfil del usuario se muestre actualizado en la aplicación.
- Puedes extender la interfaz `UserPayload` si tu API requiere otros campos.

---


despues vas a usar el ProfileComponent y vas a poner un boton para llamar el action de userStore, 

recuerda que el api te puede retornar un 422, en este caso en el composable useApiFantasy vas a cachar los 422
y sera una respuesta como esta

{
    "message": "The first name field is required. (and 3 more errors)",
    "errors": {
        "firstName": [
            "The first name field is required."
        ],
        "lastName": [
            "The last name field is required."
        ],
        "email": [
            "The email field is required."
        ],
        "phone": [
            "The phone field must be a string."
        ]
    }
}

Me gustaria que pudieras guardar en un state de pinia llamado validatorError todos los errores que sean 422,  y luego en ProfileComponent mostrar los errors correspondientes en cada input en la parte de abajo del mismo en rojo.


