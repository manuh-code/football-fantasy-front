# Instrucciones para implementar el cambio de avatar en Vue 3

## 1. Método `changeAvatar` en `UserService`

- Ubicación: `services/user/UserService.ts`
- Crea el método `changeAvatar` siguiendo la estructura de los demás métodos.
- Este método debe enviar una solicitud al endpoint `user/store/avatar` usando el método `POST` (según la documentación de tu API), enviando el archivo de imagen en formato `multipart/form-data`.
- La respuesta esperada es:

```json
{
    "timestamp": "2025-08-11 21:15:52",
    "code": 200,
    "message": "Avatar updated successfully.",
    "data": {
        "uuid": "b86ca398-98c2-4095-862c-380ea53a8776",
        "firstname": "Ignacio Manuel",
        "lastname": "Sanchez Neri",
        "fullname": "Ignacio Manuel Sanchez Neri",
        "phone": "5541234567",
        "email": "manuh0989@gmail.com",
        "avatar": "https://api.fantasymx.test/storage/avatar/1-PPP51lXb6a0RZFJmSTQNqTShvEmf0luYwOzktiG8.jpeg"
    }
}
```

- El objeto `data` corresponde a la interfaz `UserDataInterface`.
- Si el endpoint devuelve status `422`, debes capturar los errores de validación y devolverlos para mostrarlos en el frontend.

---

## 2. Acción `changeAvatar` en el store `useUserStore`

- Ubicación: `stores/user/useUserStore.ts`
- Crea un método asíncrono llamado `changeAvatar` que reciba el archivo de imagen.
- Este método debe llamar a `UserService.changeAvatar`.
- Si la respuesta es exitosa (código 200), actualiza el estado `userData` usando `this.setUserData(response.data)`.
- Si ocurre un error de validación (status 422), guarda los errores en el state y asegúrate de que puedan ser mostrados en el frontend.

---

## 3. Actualización del componente `ProfileComponent`

- Analiza si es necesario usar una librería de Vue para la subida de archivos. Te recomiendo investigar opciones como [vue-filepond](https://github.com/pqina/vue-filepond), [vue-upload-component](https://github.com/lian-yue/vue-upload-component), o el input nativo de archivos con personalización usando TailwindCSS.
- Asegúrate que la solución elegida se adapte bien al estilo visual y experiencia de usuario de tu proyecto.
- El componente debe mostrar el avatar actual y permitir seleccionar y subir una nueva imagen.
- Cuando el usuario suba una imagen, utiliza el método `changeAvatar` del store para actualizar el avatar y la información del usuario.
- Muestra retroalimentación clara: carga, éxito, error de validación, etc.

---

## 4. Consideraciones de experiencia de usuario y estilo

- El botón o formulario de cambio de avatar debe integrarse visualmente con el perfil.
- Al cambiar el avatar, actualízalo dinámicamente en la interfaz.
- Valida el tipo y tamaño del archivo antes de enviarlo.
- Los errores de validación deben mostrarse de forma clara y visualmente coherente con el diseño de tu proyecto (usando TailwindCSS).

---

## Ejemplo de flujo

1. El usuario ve su perfil y avatar actual en `ProfileComponent`.
2. Selecciona una imagen para subir como nuevo avatar.
3. El componente llama a la acción `changeAvatar` del store.
4. Si la subida es exitosa, el avatar se actualiza en la vista.
5. Si hay errores de validación, se muestran en el componente.

---