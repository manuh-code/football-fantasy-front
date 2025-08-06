# Menú Global - Football Fantasy

## Descripción

El componente `MenuGlobal.vue` implementa un menú global que está presente en todas las vistas de la aplicación, siguiendo las especificaciones del archivo `context/menu/menu.md`.

## Características

### ✅ Funcionalidades Implementadas

- **Menú Global**: Presente en todas las vistas a través de `App.vue`
- **Cambio de Tema**: Botón para alternar entre modo oscuro y claro
- **Iconos Oh My Vue Icon**: Utiliza `hi-solid-sun` y `hi-solid-moon`
- **Transiciones Suaves**: Animaciones CSS personalizadas
- **Responsivo**: Se adapta a diferentes tamaños de pantalla
- **Accesibilidad**: Soporte completo para teclado y lectores de pantalla
- **Estado Centralizado**: Integrado con el store de Pinia para tema

### 🎨 Diseño

- **Posición**: Fijo en la esquina superior derecha
- **Estilo**: Botón circular flotante con sombra
- **Interactividad**: Hover effects, escalado y rotación de iconos
- **Temas**: Soporte completo para modo claro y oscuro

### 🔧 Aspectos Técnicos

- **Framework**: Vue 3 con Composition API
- **Estado**: Pinia store (`useThemeStore`)
- **Estilos**: SCSS con variables CSS personalizadas
- **Iconos**: Oh My Vue Icons (HiSolidSun, HiSolidMoon)
- **Accesibilidad**: ARIA labels, soporte de teclado (Enter, Space)

## Estructura del Código

```
src/
├── components/
│   └── MenuGlobal.vue         # Componente principal del menú
├── store/
│   └── theme.ts              # Store para manejo del tema
└── App.vue                   # Integración del menú global
```

## Uso

El componente se incluye automáticamente en `App.vue` y estará disponible en todas las rutas:

```vue
<template>
  <div id="app">
    <MenuGlobal />
    <main>
      <router-view />
    </main>
  </div>
</template>
```

## Extensibilidad

El menú está diseñado para ser fácilmente extensible. Para agregar nuevas opciones:

1. Agregar nuevos botones en el template
2. Implementar las funciones correspondientes
3. Mantener la coherencia de estilos existente

## Estados del Tema

- **Light Mode**: Icono de luna (`hi-solid-moon`)
- **Dark Mode**: Icono de sol (`hi-solid-sun`)
- **Sistema**: Se adapta automáticamente a las preferencias del sistema

## Animaciones

- **Hover**: Escalado del botón y rotación del icono
- **Focus**: Ring de enfoque para accesibilidad
- **Transiciones**: Cambios suaves de tema en toda la aplicación
- **Reduced Motion**: Respeta las preferencias de movimiento reducido

## Responsividad

- **Desktop**: Botón de 3rem (48px)
- **Tablet**: Botón de 2.5rem (40px)
- **Mobile**: Botón de 2.75rem (44px) con padding reducido

---

*Implementado siguiendo las mejores prácticas de Vue 3, Tailwind CSS y accesibilidad web.*
