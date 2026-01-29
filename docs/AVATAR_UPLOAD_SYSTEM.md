# Avatar Upload System

## Overview
Sistema completo para cambio de avatar de usuario con validación, feedback visual y persistencia automática.

## Components

### AvatarUpload.vue
Componente UI reutilizable para subida de avatares con las siguientes características:

#### Features:
- **Visual Feedback**: Hover effects con overlay de cámara
- **Status Indicators**: 
  - Verde: Estado normal
  - Azul + spinner: Subiendo archivo
  - Rojo: Error de validación
- **Validación Client-side**:
  - Tipos permitidos: JPEG, PNG, GIF, WebP
  - Tamaño máximo: 5MB
- **Error Display**: Mensajes de error debajo del avatar
- **Responsive**: Se adapta a diferentes tamaños de pantalla

#### Props:
```typescript
interface Props {
  currentAvatar?: string | null  // URL del avatar actual
  altText?: string              // Texto alternativo para la imagen
}
```

#### Usage:
```vue
<AvatarUpload 
  :current-avatar="userData.avatar" 
  :alt-text="User Avatar"
/>
```

## Services

### UserService.changeAvatar()
Método para enviar avatar al backend:

```typescript
async changeAvatar(file: File): Promise<UserDataInterface>
```

- **Endpoint**: `POST /user/store/avatar`
- **Content-Type**: `multipart/form-data`
- **Response**: UserDataInterface con nueva URL de avatar

## Store Actions

### useUserStore.changeAvatar()
Action para actualizar avatar y sincronizar estado:

```typescript
async changeAvatar(file: File): Promise<void>
```

- Llama a `UserService.changeAvatar()`
- Actualiza automáticamente `userData` en el store
- Maneja errores a través del interceptor de API

## Error Handling

### Validation Errors (422)
Los errores se capturan automáticamente en el interceptor de API y se almacenan en `useValidationStore`:

```json
{
  "errors": {
    "avatar": [
      "The avatar field is required.",
      "The avatar must be an image.",
      "The avatar may not be greater than 2048 kilobytes."
    ]
  }
}
```

### Client-side Validation
- Verificación de tipo de archivo
- Verificación de tamaño
- Mensajes de error localizados

## Integration

### ProfileComponent
El componente se integra reemplazando la imagen estática del avatar:

```vue
<!-- Antes -->
<img :src="userData.avatar" ... />

<!-- Después -->
<AvatarUpload :current-avatar="userData.avatar" ... />
```

## User Experience

### Flow:
1. **Hover**: Muestra overlay con icono de cámara
2. **Click**: Abre selector de archivos
3. **Select**: Valida archivo client-side
4. **Upload**: Muestra spinner durante la subida
5. **Success**: Actualiza avatar automáticamente + toast
6. **Error**: Muestra mensajes de error debajo del avatar

### Visual States:
- **Normal**: Indicator verde, hover effect
- **Uploading**: Indicator azul con spinner, sin hover
- **Error**: Indicator rojo, mensajes de error visibles
- **Success**: Retorna a estado normal con nuevo avatar

## Accessibility

- Labels apropiados para screen readers
- Estados de disabled durante upload
- Mensajes de error claros
- Contraste adecuado en dark mode

## Styling

- Integración completa con TailwindCSS
- Dark mode support
- Transiciones suaves
- Responsive design
- Consistente con el design system del proyecto
