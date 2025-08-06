# Instrucciones para Implementar la Ruta y Vista de Login

Sigue estos pasos para implementar la funcionalidad de login en tu aplicación:

## 1. Crear la Ruta

- **Ruta:** `/login`
- **View asociada:** `LoginView`
- **Ubicación de la vista:**  
  ```
  views/login/LoginView.vue
  ```

## 2. Estructura de la Vista

Dentro de `LoginView.vue` deberás importar y utilizar el siguiente componente:

- **Componente:** `LoginComponent`
- **Ubicación del componente:**  
  ```
  components/login/LoginComponent.vue
  ```

## 3. Estructura y Funcionalidad del Componente

En `LoginComponent.vue` implementa lo siguiente:

### Formulario de Login

- **Campos requeridos:**
  - **Email** (obligatorio, debe ser un email válido)
  - **Password** (obligatorio)

- **Validación:**
  - Ambos campos son obligatorios.
  - El campo email debe validarse como correo electrónico utilizando un método propio en el componente, **no** el validador del navegador.

  ```js
  // Ejemplo de método para validar email
  methods: {
    validateEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    }
  }
  ```

- **Botones:**
  - Botón para iniciar sesión con email y contraseña.
  - **Botón para hacer login con Google.** Este botón debe estar claramente identificado y separado del botón de login tradicional.

### Uso de Iconos

- Utiliza los iconos de **Oh My Vue Icon** en los campos del formulario y/o los botones.

### Estilos y UX

- El formulario debe respetar los **estilos generales** de la aplicación.
- Debe ser **responsivo** y ofrecer una **buena experiencia de usuario**.

---

## Ejemplo de Estructura de Archivos

```
src/
├── components/
│   └── login/
│       └── LoginComponent.vue
└── views/
    └── login/
        └── LoginView.vue
```

---

## Resumen de Requisitos

- Ruta `/login` con vista `LoginView`.
- Vista importa y utiliza `LoginComponent`.
- `LoginComponent` tiene formulario con email y password (ambos obligatorios).
- Validación de email por método propio, no por navegador.
- Botones para Login y para Login con Google.
- Iconos de Oh My Vue Icon.
- Respeta estilos generales.
- Diseño responsivo y buena UX.