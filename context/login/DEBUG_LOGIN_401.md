# Debugging Login 401 - Pasos para Resolver

## 🔍 Cambios Realizados

### 1. Mejorado useApi
- ✅ Manejo más detallado de errores HTTP
- ✅ Preservación de la respuesta original completa
- ✅ Mejor tipado para errores 401 y 422

### 2. Simplificado loginService  
- ✅ Usa el manejo de errores del useApi directamente
- ✅ Logging mejorado para debugging
- ✅ Manejo más claro de status codes

### 3. Debugging Mejorado
- ✅ Logs adicionales en el componente
- ✅ Mejor trazabilidad de errores

## 🧪 Para Probar el Error 401

### Paso 1: Abrir DevTools
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña Console
3. Ve a la pestaña Network

### Paso 2: Intentar Login con Credenciales Incorrectas
Usa datos que sepas que fallarán:
```
Email: test@test.com
Password: wrongpassword
```

### Paso 3: Verificar los Logs
Deberías ver en consola:
```
LoginService: Attempting login with: {...}
LoginService: Login error caught: {...}
LoginService: Handling error: { status: 401, message: "...", response: {...} }
LoginComponent: Service result: { success: false, title: "Authentication Failed", message: "..." }
LoginComponent: Showing error toast: { title: "...", message: "..." }
```

### Paso 4: Verificar Network Tab
- Busca la request a `auth`
- Verifica que sea 401
- Revisa la respuesta del servidor

## 🐛 Posibles Causas Si No Funciona

### 1. Toast No Se Muestra
- Verificar que el componente Toast esté montado en la aplicación
- Revisar si hay CSS que oculte los toasts
- Comprobar que `useToast` esté funcionando con otros casos

### 2. Error No Se Captura
- Verificar logs en consola
- Comprobar que la URL de la API sea correcta
- Verificar que el servidor esté respondiendo 401

### 3. Debugging Adicional

#### Verificar useToast manualmente:
```javascript
// En consola del navegador
const toast = useToast()
toast.error('Test Error', 'This is a test message')
```

#### Verificar respuesta del servidor:
```javascript
// En Network tab, revisar la respuesta completa del 401
```

## 🔧 Si Aún No Funciona

### Agrega este debug temporal al LoginComponent:

```typescript
} else {
    // Debug temporal
    console.log('=== DEBUG LOGIN ERROR ===')
    console.log('Result:', result)
    console.log('Title:', result.title)
    console.log('Message:', result.message)
    console.log('Toast function:', toast.error)
    
    // Forzar toast manualmente
    try {
        toast.error(result.title || 'Error', result.message)
        console.log('Toast called successfully')
    } catch (toastError) {
        console.error('Toast error:', toastError)
    }
}
```

### Verificar que el Toast Component esté en App.vue:
Buscar algo como:
```vue
<ToastContainer />
<!-- o -->
<div class="toast-container">
  <Toast v-for="toast in toasts" :key="toast.id" :toast="toast" />
</div>
```

## 📋 Checklist de Verificación

- [ ] Network tab muestra request 401 al endpoint `/auth`
- [ ] Console muestra logs del LoginService
- [ ] Console muestra logs del LoginComponent
- [ ] useToast funciona con test manual
- [ ] ToastContainer está montado en la aplicación
- [ ] No hay errores en consola bloqueando la ejecución

## 🎯 Resultado Esperado

Al enviar credenciales incorrectas deberías ver:
1. Request 401 en Network tab
2. Logs de debugging en Console
3. Toast rojo con mensaje de error
4. NO errores en consola
