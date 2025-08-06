# Instrucciones para implementar `loginService`

Sigue estas indicaciones para crear y utilizar un servicio de autenticación centralizado:

## 1. Ubicación del servicio

- Crea el archivo en la siguiente ruta:
  ```
  src/services/login/loginService.ts
  ```

## 2. Desacoplar lógica de autenticación

- Toda la lógica relacionada con la autenticación (invocación del endpoint, manejo de payload, validaciones, gestión de errores, guardado del token en el store de Pinia, etc.) debe estar en este servicio.
- El componente `LoginComponent` solo debe encargarse de la interfaz y de llamar al service con los datos del formulario.
- El service debe usar el composable `useApi` para realizar las llamadas al API.

## 3. Métodos y estructura

- El service debe exponer un método principal para login, por ejemplo: `login(payload)`.
- El método debe manejar internamente:
  - Enviar el payload adecuado al endpoint `POST auth`
  - Procesar los distintos tipos de respuesta y errores
  - Guardar el token en el store de Pinia (`userStore`) si el login fue exitoso
  - Retornar el resultado o los mensajes de error al componente para que se muestren en la UI (por ejemplo, vía toast)

## 4. Ejemplo de uso básico

```js
// En LoginComponent.vue
import { loginService } from "@/services/login/loginService";

async function login() {
  const payload = {
    email,
    password,
    device_name: "web",
    remember: false
  };
  const result = await loginService.login(payload);
  // Maneja el resultado y muestra los mensajes que retorne el servicio
}
```

---

## Resumen de requisitos

- Crea `loginService.ts` en `src/services/login/`.
- Desacopla toda la lógica de autenticación y gestión de errores en ese service.
- El componente solo consume el servicio y muestra los resultados en la UI.
- El service usa `useApi` y gestiona el store de usuario.