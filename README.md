# Football Fantasy Front

Una aplicación web moderna de fantasy football construida con Vue.js 3, TypeScript, TailwindCSS y Pinia.

## 🚀 Características

- **Vue.js 3** con Composition API y TypeScript
- **TailwindCSS** para estilos utilitarios y responsivos
- **SASS** para estilos avanzados con variables y mixins
- **Pinia** para gestión de estado
- **Oh My Vue Icons** para iconografía
- **PWA** (Progressive Web App) completamente configurada
- **Modo oscuro/claro** automático y manual
- **Diseño responsivo** para móviles, tablets y escritorio
- **Tipado completo** con TypeScript
- **Estructura modular** y escalable

## 🛠️ Stack Tecnológico

### Frontend
- Vue.js 3 (Composition API)
- TypeScript
- Vue Router 4
- Pinia (State Management)

### Estilos
- TailwindCSS
- SASS/SCSS
- Variables CSS personalizadas
- Mixins y utilidades

### Herramientas
- Vue CLI
- Oh My Vue Icons
- PWA configuración completa
- Service Worker
- Web App Manifest

## 📁 Estructura del Proyecto

```
src/
├── assets/
│   ├── styles/
│   │   ├── variables.scss    # Variables CSS y SASS
│   │   ├── mixins.scss       # Mixins para componentes
│   │   └── tailwind.scss     # Configuración Tailwind
│   └── logo.png
├── components/               # Componentes reutilizables
├── composables/             # Lógica reutilizable
│   ├── useMediaQuery.ts     # Responsive utilities
│   ├── useToast.ts          # Sistema de notificaciones
│   ├── useLoading.ts        # Estados de carga
│   └── index.ts             # Exportaciones
├── icons/
│   └── index.ts             # Configuración de iconos
├── router/
│   └── index.ts             # Configuración de rutas
├── store/
│   ├── theme.ts             # Store para tema
│   └── index.ts             # Configuración Pinia
├── views/                   # Páginas/Vistas
│   ├── HomeView.vue
│   ├── AboutView.vue
│   └── NotFoundView.vue
├── App.vue                  # Componente principal
└── main.ts                  # Punto de entrada
```

## 🎨 Sistema de Diseño

### Colores
El proyecto utiliza una paleta inspirada en Laravel Cloud Dashboard con soporte completo para modo oscuro:

- **Primary**: Azul (`#0ea5e9`)
- **Success**: Verde (`#22c55e`)
- **Warning**: Amarillo (`#f59e0b`)
- **Danger**: Rojo (`#ef4444`)
- **Gray**: Escala de grises completa

### Tipografía
- **Fuente principal**: Inter (Google Fonts)
- **Tamaños**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl
- **Pesos**: thin, light, normal, medium, semibold, bold, extrabold, black

### Breakpoints
```scss
xs: 475px
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## 🧩 Composables Disponibles

### `useMediaQuery`
```typescript
const isMobile = useMediaQuery('(max-width: 767px)')
const { isMobile, isTablet, isDesktop, isLarge } = useBreakpoints()
```

### `useTheme` (Store)
```typescript
const themeStore = useThemeStore()
themeStore.toggleTheme()
themeStore.setTheme('dark') // 'light', 'dark', 'system'
```

### `useToast`
```typescript
const { success, error, warning, info } = useToast()
success('¡Éxito!', 'Operación completada')
```

### `useLoading`
```typescript
const { isLoading, withLoading } = useLoading()
await withLoading('api-call', () => apiCall())
```

## 🎯 Mixins SCSS Disponibles

### Responsive
```scss
@include breakpoint('md') { /* styles */ }
@include breakpoint-down('lg') { /* styles */ }
```

### Componentes
```scss
@include button-base;
@include button-variant('primary');
@include card-base;
@include input-base;
```

### Utilidades
```scss
@include flex-center;
@include truncate;
@include glass-morphism;
@include skeleton;
```

## 🚀 Comandos Disponibles

### Desarrollo
```bash
npm run serve         # Servidor de desarrollo
npm run build         # Build de producción
npm run lint          # Linter
```

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd football-fantasy-front

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run serve
```

## 📱 PWA Features

- **Instalable**: Se puede instalar como app nativa
- **Offline**: Funciona sin conexión a internet
- **Service Worker**: Cache inteligente de recursos
- **Manifest**: Configuración completa para app stores
- **Responsive**: Adaptado a todos los dispositivos

## 🌙 Modo Oscuro

El tema se detecta automáticamente del sistema operativo y se puede cambiar manualmente:

```typescript
// Automático (detecta del sistema)
themeStore.setTheme('system')

// Manual
themeStore.setTheme('dark')
themeStore.setTheme('light')

// Toggle
themeStore.toggleTheme()
```

## 🚀 Despliegue en Producción

Este proyecto incluye despliegue automático con **GitHub Actions** y **Docker**.

### Despliegue automático (CI/CD)

Cada push a la rama `main` despliega automáticamente a producción:

1. **GitHub Actions** construye la imagen Docker
2. Sube la imagen a **GitHub Container Registry**
3. Conecta al servidor VPS vía SSH
4. Descarga y despliega con **Docker Compose**
5. Tu app está en **https://fantasymx.cloud** 🎉

### Configuración rápida

```bash
# 1. En tu servidor VPS
wget https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh

# 2. Configura secretos en GitHub (Settings → Secrets)
VPS_HOST, VPS_USERNAME, VPS_SSH_KEY, VPS_TARGET

# 3. Push a main y listo!
git push origin main
```

### Documentación completa

- 📖 [Guía rápida de despliegue](QUICKSTART_DEPLOY.md)
- 📚 [Documentación completa](DEPLOYMENT.md)
- 🐳 [Dockerfile](Dockerfile) y [docker-compose.yml](docker-compose.yml)

### Despliegue manual

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Con Docker
docker-compose up -d
```

## 🧪 Testing

El proyecto está preparado para testing con:
- Jest para unit testing
- Vue Test Utils para testing de componentes
- Cypress para E2E testing (configuración futura)

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

## 🤝 Contribución

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.

---

Construido con ❤️ usando Vue.js 3 + TypeScript + TailwindCSS
