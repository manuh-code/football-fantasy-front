# useApi Composable - Documentación

## Descripción

El composable `useApi` proporciona una interfaz unificada y reutilizable para realizar peticiones HTTP al API usando Axios. Implementa todas las especificaciones requeridas del documento de instrucciones.

## Características Implementadas

### ✅ **Configuración Requerida**

- **Variable de entorno**: Lee `VITE_API_URL` desde `.env.local`
- **Axios**: Utiliza Axios para todas las peticiones HTTP
- **Headers obligatorios**: 
  - `Accept: application/json`
  - `TimeZone: <zona horaria actual>` (obtenida dinámicamente)
- **Header opcional**: `Authorization: <token>` cuando sea necesario

### ✅ **Funcionalidades**

- **Métodos HTTP**: GET, POST, PUT, PATCH, DELETE
- **Manejo de errores**: Uniforme y personalizable
- **Estado reactivo**: Loading y error states
- **TypeScript**: Completamente tipado
- **Timeout**: 30 segundos por defecto
- **Interceptors**: Para requests y responses

## Uso Básico

```typescript
import { useApi } from '@/composables/useApi'

const { get, post, put, patch, delete: del, loading, error } = useApi()

// Ejemplo básico GET
try {
  const response = await get('usuarios')
  console.log(response.data)
} catch (err) {
  console.error('Error:', err)
}

// Ejemplo POST con datos
const userData = { 
  name: 'Juan', 
  email: 'juan@example.com' 
}

try {
  const response = await post('usuarios', userData)
  console.log('Usuario creado:', response.data)
} catch (err) {
  console.error('Error al crear usuario:', err)
}
```

## Autenticación

```typescript
import { useApi } from '@/composables/useApi'

const { get, post, setAuthToken } = useApi()

// Método 1: Usando setAuthToken helper
const token = setAuthToken('mi-jwt-token')
const response = await get('perfil', {}, { authorization: token })

// Método 2: Directamente
const response = await get('perfil', {}, { 
  authorization: 'Bearer mi-jwt-token' 
})

// Método 3: Para múltiples peticiones con el mismo token
const apiOptions = { authorization: setAuthToken('mi-jwt-token') }
const usuarios = await get('usuarios', {}, apiOptions)
const perfil = await get('perfil', {}, apiOptions)
```

## Ejemplos de Métodos HTTP

### GET - Obtener datos

```typescript
// GET simple
const usuarios = await get('usuarios')

// GET con parámetros query
const usuariosFiltrados = await get('usuarios', { 
  page: 1, 
  limit: 10, 
  status: 'active' 
})

// GET con autorización
const perfil = await get('perfil', {}, { 
  authorization: 'Bearer token123' 
})
```

### POST - Crear recursos

```typescript
// POST con datos
const nuevoUsuario = await post('usuarios', {
  name: 'Ana García',
  email: 'ana@example.com',
  role: 'user'
})

// POST con autorización
const response = await post('posts', {
  title: 'Mi nuevo post',
  content: 'Contenido del post...'
}, {
  authorization: 'Bearer token123'
})
```

### PUT - Actualizar recursos completos

```typescript
const usuarioActualizado = await put('usuarios/123', {
  name: 'Ana García López',
  email: 'ana.garcia@example.com',
  role: 'admin'
}, {
  authorization: 'Bearer token123'
})
```

### PATCH - Actualizar recursos parcialmente

```typescript
const usuarioParcial = await patch('usuarios/123', {
  role: 'admin'
}, {
  authorization: 'Bearer token123'
})
```

### DELETE - Eliminar recursos

```typescript
// DELETE con parámetros query
const resultado = await del('usuarios/123', {}, { 
  authorization: 'Bearer token123' 
})

// DELETE con parámetros adicionales
const resultado = await del('posts', { 
  ids: [1, 2, 3] 
}, { 
  authorization: 'Bearer token123' 
})
```

## Estado Reactivo

```vue
<template>
  <div>
    <div v-if="loading" class="loading">
      Cargando...
    </div>
    
    <div v-if="error" class="error">
      Error: {{ error.message }}
    </div>
    
    <div v-else>
      <!-- Contenido de la respuesta -->
    </div>
  </div>
</template>

<script setup>
import { useApi } from '@/composables/useApi'

const { get, loading, error, clearError } = useApi()

// El loading y error son reactivos
const cargarDatos = async () => {
  clearError() // Limpiar errores previos
  try {
    const response = await get('datos')
    // loading se pone automáticamente en false
  } catch (err) {
    // error se actualiza automáticamente
  }
}
</script>
```

## Headers Adicionales

```typescript
// Agregar headers personalizados
const response = await get('endpoint', {}, {
  additionalHeaders: {
    'X-Custom-Header': 'valor',
    'X-Request-ID': 'uuid-123'
  }
})

// Combinar autorización con headers adicionales
const response = await post('endpoint', data, {
  authorization: 'Bearer token123',
  additionalHeaders: {
    'X-API-Version': 'v2',
    'X-Client-Type': 'web'
  }
})
```

## Configuración Avanzada con Axios

```typescript
// Usar configuración adicional de Axios
const response = await get('endpoint', params, {}, {
  timeout: 60000, // 60 segundos
  responseType: 'blob', // Para archivos
  validateStatus: (status) => status < 500 // Validación personalizada
})
```

## Manejo de Errores

```typescript
import { ApiError } from '@/composables/useApi'

try {
  const response = await get('endpoint')
} catch (error) {
  const apiError = error as ApiError
  
  console.log('Mensaje:', apiError.message)
  console.log('Status:', apiError.status)
  console.log('Response:', apiError.response)
  
  // Manejar errores específicos
  if (apiError.status === 401) {
    // Redirigir al login
  } else if (apiError.status === 422) {
    // Mostrar errores de validación
    console.log('Errores de validación:', apiError.response)
  }
}
```

## Tipos TypeScript

```typescript
// Definir tipos para las respuestas
interface Usuario {
  id: number
  name: string
  email: string
  role: string
}

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

// Usar tipos en las peticiones
const usuarios = await get<PaginatedResponse<Usuario>>('usuarios')
const usuario = await post<Usuario>('usuarios', userData)
```

## Headers Automáticos

El composable incluye automáticamente estos headers en todas las peticiones:

- `Accept: application/json`
- `TimeZone: America/Mexico_City` (o la zona horaria del usuario)

## Variables de Entorno

Asegúrate de tener configurado en `.env.local`:

```bash
VITE_API_URL=https://api.fantasymx.test/api/
```

## Ejemplos Completos de Uso

### Autenticación y Gestión de Usuarios

```typescript
// composables/useAuth.ts
import { useApi } from '@/composables/useApi'

export const useAuth = () => {
  const { post, get } = useApi()
  
  const login = async (email: string, password: string) => {
    const response = await post('auth/login', { email, password })
    return response.data
  }
  
  const getProfile = async (token: string) => {
    const response = await get('auth/profile', {}, { 
      authorization: `Bearer ${token}` 
    })
    return response.data
  }
  
  return { login, getProfile }
}
```

### CRUD de Recursos

```typescript
// composables/useUsuarios.ts
import { useApi } from '@/composables/useApi'

export const useUsuarios = () => {
  const { get, post, put, delete: del } = useApi()
  
  const obtenerUsuarios = (params = {}) => {
    return get('usuarios', params)
  }
  
  const crearUsuario = (userData: any, token: string) => {
    return post('usuarios', userData, { 
      authorization: `Bearer ${token}` 
    })
  }
  
  const actualizarUsuario = (id: number, userData: any, token: string) => {
    return put(`usuarios/${id}`, userData, { 
      authorization: `Bearer ${token}` 
    })
  }
  
  const eliminarUsuario = (id: number, token: string) => {
    return del(`usuarios/${id}`, {}, { 
      authorization: `Bearer ${token}` 
    })
  }
  
  return {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
  }
}
```

---

*Implementación completa según las especificaciones del documento de requerimientos.*
