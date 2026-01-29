# Instrucciones para crear un composable para conexión al API

Sigue estas indicaciones para crear un **composable** reutilizable en todo el sistema para conectarte al API:

## 1. Variable de URL en `.env.local`

- La URL base del API debe estar almacenada en una variable dentro del archivo `.env.local`, por ejemplo:
  ```
  VITE_API_URL=https://api.fantasymx.test/api/
  ```
- El composable debe leer esta variable para construir las peticiones.

## 2. Uso de Axios

- Debes utilizar **axios** para invocar el API y realizar todas las solicitudes HTTP.

## 3. Headers obligatorios

- Todas las solicitudes deben incluir los siguientes headers:
  - `Accept: application/json`
  - `TimeZone: <zona horaria actual>`
    - La zona horaria debe obtenerse dinámicamente, por ejemplo, usando `Intl.DateTimeFormat().resolvedOptions().timeZone` en JavaScript.

## 4. Header opcional

- En algunos casos se debe enviar el header:
  - `Authorization: <token>`
    - El composable debe permitir agregar este header solo cuando sea necesario.

## 5. Buenas prácticas

- El composable debe ser **reutilizable** en cualquier parte del sistema.
- Debe permitir configurar fácilmente los headers y el método HTTP (`GET`, `POST`, etc.).
- Debe manejar errores y respuestas de forma uniforme.
- Debe permitir enviar parámetros y cuerpo (`body`) en las peticiones.

---

## Ejemplo de uso básico

```js
import { useApi } from "@/composables/useApi";

const { get, post } = useApi();

// Ejemplo GET
get("usuarios");

// Ejemplo POST con Authorization
post("login", { email, password }, { authorization: "Bearer <token>" });
```

---

## Resumen de requisitos

- Composable reutilizable para conectar a `https://api.fantasymx.test/api/` usando la variable de entorno.
- Uso de **axios** para todas las peticiones al API.
- Headers obligatorios: Accept y TimeZone en todas las peticiones.
- Header Authorization opcional.
- Configurable, fácil de usar, maneja errores y respuestas de forma uniforme.