# 🔐 Configuración de Secrets en GitHub

Para que el despliegue funcione correctamente, necesitas agregar los siguientes **secrets** en tu repositorio de GitHub.

## 📍 Dónde agregar los secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Secrets and variables** → **Actions**
4. Click en **New repository secret**

## 🔑 Secrets requeridos

### Secrets de Docker Hub (Ya los tienes)
- `DOCKER_USERNAME` - Tu usuario de Docker Hub
- `DOCKER_PASSWORD` - Tu contraseña/token de Docker Hub

### Secrets del VPS (Ya los tienes)
- `VPS_HOST` - IP o dominio de tu servidor
- `VPS_USERNAME` - Usuario SSH del servidor
- `VPS_SSH_KEY` - Tu clave privada SSH
- `VPS_SSH_PASSPHRASE` - Frase de paso de la clave SSH (si la tiene)

### ⚠️ NUEVOS Secrets de Variables de Entorno (AGREGAR ESTOS)

#### `VITE_API_BASE_URL`
**Valor:** `https://api.fantasymx.cloud/api/`

- URL de tu API en producción
- **IMPORTANTE:** Debe terminar con `/api/`

#### `VITE_ABLY_PUBLIC_KEY`
**Valor:** Tu clave pública de Ably para producción

- Obtén una clave de producción en: https://ably.com/accounts
- **NO uses la misma clave que en desarrollo**
- Formato ejemplo: `AbCdEf.GhIjKl`

## ✅ Verificación

Después de agregar los secrets, tu página de secrets debería verse así:

```
DOCKER_USERNAME          ✓
DOCKER_PASSWORD          ✓
VPS_HOST                 ✓
VPS_USERNAME             ✓
VPS_SSH_KEY              ✓
VPS_SSH_PASSPHRASE       ✓
VITE_API_BASE_URL        ✓ (NUEVO)
VITE_ABLY_PUBLIC_KEY     ✓ (NUEVO)
```

## 🚀 Probar el despliegue

Una vez agregados los secrets, haz un push a la rama `main`:

```bash
git add .
git commit -m "Configurar variables de entorno para producción"
git push origin main
```

El workflow se ejecutará automáticamente y construirá la imagen con las variables correctas.

## 🔍 Verificar que funcionó

1. Espera a que termine el workflow de GitHub Actions
2. Ve a tu servidor y verifica que el contenedor esté corriendo:
   ```bash
   docker ps
   docker logs fantasymx_front_nginx
   ```
3. Abre tu aplicación en `http://tu-servidor:3000`
4. Abre la consola del navegador (F12) y verifica que las peticiones vayan a `https://api.fantasymx.cloud/api/`

## 🐛 Troubleshooting

Si las variables no se aplican:

1. **Verificar en GitHub Actions:**
   - Ve a la pestaña "Actions" en tu repositorio
   - Click en el último workflow execution
   - Revisa los logs del step "Build and Push"
   - Deberías ver los build-args siendo pasados

2. **Reconstruir sin caché:**
   ```bash
   # En GitHub, ve a Actions → Re-run jobs → Re-run all jobs
   ```

3. **Verificar en el contenedor:**
   ```bash
   # Conectarse al contenedor
   docker exec -it fantasymx_front_nginx sh
   
   # Buscar el archivo JS principal y verificar la URL
   grep -r "api.fantasymx.cloud" /usr/share/nginx/html/assets/
   ```

   Deberías ver tu URL de producción en los archivos JavaScript compilados.
