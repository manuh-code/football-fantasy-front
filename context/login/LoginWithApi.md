# Implementación de login usando `useApi` y manejo de errores

A continuación se describen los pasos para implementar el login utilizando el composable `useApi`, con la integración del endpoint `POST auth` y el manejo detallado de errores según la respuesta del API.

---

## 1. Campos requeridos en el formulario

Asegúrate de que el formulario del componente `LoginComponent` contenga los siguientes campos:

- **email** (obligatorio, tipo email)
- **password** (obligatorio)
- **device_name** (valor por defecto: `"web"`)
- **remember** (booleano, por defecto `false`)

Si algún campo no está presente, agrégalo tanto en el formulario como en el payload.

---

## 2. Uso del composable `useApi`

Utiliza el composable para invocar el endpoint:

- **Método:** POST
- **Endpoint:** `auth`
- **Payload de ejemplo:**
  ```json
  {
      "email": "manuh0989@gmail.com",
      "password": "0989nacho",
      "device_name": "web",
      "remember": false
  }
  ```

---

## 3. Validación y manejo de errores en `useApi`

Implementa el manejo de errores HTTP en el composable `useApi`, considerando los siguientes escenarios:

### - Errores 404 y 500

- Debes mostrar un **toast** con un mensaje de error general.
- Verifica si el proyecto ya cuenta con un sistema de toast; si no es así, implementa uno simple.

### - Error 401

- La respuesta será:
  ```json
  {
      "timestamp": "2025-08-06 23:00:39",
      "code": 401,
      "message": "Authentication error. Please verify your credentials."
  }
  ```
- Toma el campo `message` y muéstralo en un **toast**.

### - Error 422

- La respuesta será:
  ```json
  {
      "message": "The password field is required.",
      "errors": {
          "password": [
              "The password field is required."
          ]
      }
  }
  ```
- Muestra el mensaje en el **toast** y, opcionalmente, despliega los errores específicos en el formulario.

---

## 4. Manejo de respuesta exitosa (200)

- Ejemplo de respuesta:
  ```json
  {
      "timestamp": "2025-08-06 23:01:39",
      "code": 200,
      "message": "success",
      "data": {
          "token": "eyJpdiI6InA3bUUyL0ZXeTlKczRJZjFuYVdKb1E9PSIsInZhbHVlIjoiUERCSStMTUhiejJURU4vdmkvMXV3VEFpVmFINmJJVEY1RUVKZTRaQlhOcERrUHRPNG4yM1JaWkU1QXhCSy9uY1I3czBaUFNzOHA0TSs0QUNTRERlY3c9PSIsIm1hYyI6IjRiZGMxZjIzMDNlYTU1ZGI3MmM1NzFiYTg3YzAyYzk1NDViMDM4ZjRkMzlmYTJmNjNhOTg4MWVhNjM2ZGFjOTQiLCJ0YWciOiIifQ=="
      }
  }
  ```
- Guarda el valor del token en un **store de Pinia** llamado `userStore`.
- El token debe mantenerse disponible en todo el proyecto.

---

## 5. Resumen de implementación

- El formulario de login debe tener los campos mencionados.
- El endpoint de login se invoca usando `useApi` (POST a `auth`).
- El manejo de errores se realiza en el composable, mostrando los mensajes correspondientes mediante toast.
- En caso de éxito, el token se guarda en el `userStore` de Pinia y está disponible globalmente.

---

## Ejemplo de integración en el componente

```js
// LoginComponent.vue (pseudo-código)
import { useApi } from "@/composables/useApi";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "@/composables/useToast"; // Si no existe, créalo

const { post } = useApi();
const userStore = useUserStore();
const toast = useToast();

async function login() {
  try {
    const payload = {
      email,
      password,
      device_name: "web",
      remember: false
    };
    const response = await post("auth", payload);
    userStore.setToken(response.data.token);
    // Redirigir o mostrar éxito
  } catch (error) {
    if (error.code === 401) {
      toast.show(error.message);
    } else if (error.code === 422) {
      toast.show(error.message);
      // Opcional: mostrar errores específicos en el formulario
    } else {
      toast.show("Error inesperado. Intenta más tarde.");
    }
  }
}
```

---