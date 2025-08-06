# Instrucciones para Implementar un Menú Global con Cambio de Tema

Sigue estas indicaciones para crear un menú que estará disponible en todas las vistas de la aplicación, siguiendo las mejores prácticas:

## 1. Menú Global

- El menú debe estar presente y accesible en **todas las vistas** de la aplicación.
- Utiliza la mejor práctica recomendada para tu framework (por ejemplo, en Vue se suele colocar en el layout principal, como `App.vue` o en un componente de layout compartido).

## 2. Funcionalidad

- Por ahora, el menú **solo tendrá un icono** para cambiar el tema entre **dark mode** y **light mode**.
- El cambio de tema debe aplicarse a toda la interfaz de manera global.
- El icono debe reflejar el estado actual (por ejemplo, sol para light, luna para dark) y debe utilizar iconos de **Oh My Vue Icon**.
- El cambio de tema debe ofrecer una **transición suave** y una **buena experiencia de usuario**.

## 3. Mejores Prácticas

- El menú debe ser **responsivo** y mantener la coherencia de estilos con el resto de la aplicación.
- El manejo del estado del tema (dark/light) debe estar centralizado (usando store, composición API, o solución recomendada por el framework).
- El menú debe ser fácilmente extensible para agregar nuevas opciones en el futuro.

---

## Ejemplo de Estructura de Archivos

```
src/
├── components/
│   └── MenuGlobal.vue     # Componente del menú
├── App.vue                # Archivo principal donde se incluye el menú
└── ...
```

---

## Resumen de Requisitos

- Menú global presente en todas las vistas.
- Icono para cambiar entre dark y light mode usando Oh My Vue Icon.
- Cambio de tema global y transición suave.
- Responsivo y acorde a los estilos generales.
- Estado centralizado y menú fácilmente extensible.