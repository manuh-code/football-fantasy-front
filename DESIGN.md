---
name: "Pro Fantasy · Noche lima"
description: "Siempre de noche: luz azul de estadio, la lima solo para la energía y Montserrat. Es el mundo de la landing de descarga (/landingpage); el resto de la web sigue en el tema heredado de tailwind.config.js."
colors:
  lime: "#b4e70e"
  lime-ink: "#212121"
  blue: "#0137d2"
  blue-deep: "#0025aa"
  ground: "#0b0b0b"
  ground-2: "#131313"
  surface: "#212121"
  surface-2: "#2b2b2b"
  line: "#2b2b2b"
  line-strong: "#414141"
  ink: "#f9f9f9"
  ink-2: "#d6d6d6"
  ink-3: "#b1b1b1"
  ink-4: "#858585"
typography:
  display:
    fontFamily: "'Montserrat Variable', Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.5rem, 1.15rem + 4.4vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Montserrat Variable', Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(2rem, 1.35rem + 2.3vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  title:
    fontFamily: "'Montserrat Variable', Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 800
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Montserrat Variable', Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.65
  body-sm:
    fontFamily: "'Montserrat Variable', Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "'Montserrat Variable', Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  label-strong:
    fontFamily: "'Montserrat Variable', Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 800
  label-caps:
    fontFamily: "'Montserrat Variable', Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.08em"
  caption:
    fontFamily: "'Montserrat Variable', Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.35
  numeric:
    fontFamily: "'Montserrat Variable', Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    fontFeature: '"tnum"'
rounded:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.875rem"
  lg: "1rem"
  xl: "1.25rem"
  pill: "999px"
spacing:
  "4": "0.25rem"
  "8": "0.5rem"
  "10": "0.625rem"
  "12": "0.75rem"
  "16": "1rem"
  "20": "1.25rem"
  "24": "1.5rem"
  "28": "1.75rem"
  "32": "2rem"
  "40": "2.5rem"
  "48": "3rem"
  gutter: "clamp(1.25rem, 4vw, 2.5rem)"
  section: "clamp(4.5rem, 3rem + 5vw, 7.5rem)"
  nav: "4rem"
  container: "80rem"
components:
  nav:
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
    height: "4rem"
  nav-scrolled:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
    height: "4rem"
  button-get:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.lime-ink}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.pill}"
    padding: "0.55rem 1.1rem"
  button-get-bar:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.lime-ink}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.pill}"
    padding: "0.7rem 1.15rem"
  button-play:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.lime-ink}"
    rounded: "{rounded.pill}"
    size: "4.5rem"
  button-icon:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "2.75rem"
  button-icon-hover:
    backgroundColor: "{colors.surface-2}"
  badge-app-store:
    rounded: "{rounded.md}"
    width: "15.375rem"
    height: "5.125rem"
  cell-coming-soon:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-4}"
    rounded: "{rounded.md}"
    padding: "0 0.875rem"
    width: "15.375rem"
    height: "3.5rem"
  qr-panel:
    backgroundColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.375rem"
    width: "7.5rem"
  link-route:
    textColor: "{colors.ink-2}"
    typography: "{typography.body-sm}"
    padding: "0.25rem 0"
  link-route-hover:
    textColor: "{colors.ink}"
  screenshot:
    backgroundColor: "{colors.ground-2}"
    rounded: "{rounded.lg}"
    width: "min(68vw, 16.5rem)"
  get-bar:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "0.625rem"
  scene-row:
    textColor: "{colors.ink-3}"
    padding: "1.05rem 0.25rem 1.15rem"
  scene-row-active:
    textColor: "{colors.ink}"
---

# Design System: Pro Fantasy · Noche lima

> **Alcance.** Este sistema es el de la landing de descarga (`/landingpage`: `src/views/landing/` y `src/components/landing/`), construida el 2026-10-02, y el de cualquier superficie nueva que se decida construir en este mismo mundo. **El resto de la web todavía no lo usa**: sus pantallas siguen en el tema heredado de `tailwind.config.js` (`primary` esmeralda, grises slate, la pila de fuentes del sistema y el cambio claro/oscuro con la clase `.dark`), que este documento no describe ni sustituye. Llevar una pantalla de la app a Noche lima es una migración que se decide aparte, no algo que este archivo autorice. Tampoco sigue este sistema el HTML estático que `scripts/prerender.mjs` sirve antes de que monte la app: usa sus propios estilos heredados.
>
> Los tokens viven como propiedades `--lp-*` sobre `.landing` en `LandingView.vue` (cada clave de color de arriba es `--lp-<clave>`) y salen de la paleta de marca del móvil (`Palette` en `football-fantasy-mobile/.../ui/theme/Color.kt`), en su modo oscuro.

## Overview

**Creative North Star: "Noche lima"**

Noche lima es un estadio de noche visto desde la grada: un suelo casi negro y neutro, una luz azul profunda que cae desde fuera del encuadre como la de los reflectores, las líneas del área apenas trazadas en cal y una sola chispa, la lima, reservada para lo que tiene energía. Es la paleta de marca de la app móvil en su modo oscuro, tomada escalón por escalón, y es siempre oscura: no cambia con el tema del sistema ni con el de la web, y mientras la página está montada también pinta de noche el lienzo del navegador, `theme-color` y `color-scheme`.

El mundo no se describe a sí mismo: enseña la app. Las capturas y el video de la App Store entran tal cual y el mundo se aparta para que el color lo pongan las pantallas reales. La densidad es baja, las superficies son planas y se separan por escalones de gris y filetes de 1 px, y Montserrat en 800 carga todo lo que es titular o acción. La composición de la primera superficie (la ficha de la App Store, con el carrusel que se sale por la derecha) vive en su brief de superficie; lo que este archivo fija es el mundo.

El mundo está quieto. Hay un solo momento de entrada por página, el progreso de lo que corre (las escenas del video) avanza en tiempo real, y todo lo demás solo responde a estados: hover, foco, pulsado y la posición del desplazamiento (la navegación que se vuelve opaca, la barra Obtener que entra). Los viajes y las escalas usan una salida exponencial, `cubic-bezier(0.16, 1, 0.3, 1)`; los cambios de color, entre 160 y 200 ms. Con `prefers-reduced-motion: reduce` no queda ninguna entrada ni ningún desplazamiento.

**Key Characteristics:**
- Siempre oscuro: suelo `ground` (#0b0b0b), banda `ground-2` (#131313), sin modo claro.
- El azul de marca es luz: degradados radiales y resplandores, nunca relleno ni texto.
- La lima es la única chispa y, cuando es fondo, lleva tinta `lime-ink` (#212121).
- Montserrat Variable autoalojada (solo latín): 800 en titulares y acciones, 500 en cuerpo, 600 en interfaz, 700 en datos; cifras tabulares en lo que corre.
- Planos por tono y filetes de 1 px; las únicas sombras son el resplandor azul bajo el ícono, el disco de reproducción y el peso del teléfono.
- La prueba es real: capturas y video de la App Store sin marcos añadidos.
- Una sola entrada animada por página; lo demás solo responde a estados.

## Colors

Una noche neutra con dos acentos de marca que nunca compiten: el azul alumbra y la lima actúa.

### Primary
- **Lima voltaje** (#b4e70e): token `lime` (`Lima400` del móvil, la gemela cálida que la marca usa en oscuro). Es la energía: la segunda línea del titular y la palabra central del cierre, el botón de Obtener/Descargar, el disco de reproducción, la escena que corre (su tiempo y su barra), el anillo de foco, la selección de texto y la flecha de las rutas de texto, cuyo subrayado también se vuelve lima al pasar el ratón. Sobre `ground` da 13.48:1. La #ace80d de la guía (`Lima500`, la de modo claro) no aparece aquí: esta página nunca es clara.
- **Tinta sobre lima** (#212121): token `lime-ink`, la tinta de todo lo que va encima de la lima (botones, disco, selección), a 11.02:1. Tiene el mismo valor que `surface` pero es otro papel: si un día cambia el grafito, la tinta sobre lima no tiene por qué moverse.

### Secondary
- **Azul reflector** (#0137d2): token `blue` (`Azul600`). La luz del estadio en su punto más vivo: el centro de los degradados radiales y el resplandor bajo el ícono, siempre con transparencia (`rgba(1, 55, 210, …)`). En pantalla nunca llega a verse como azul plano: el punto más brillante del encabezado queda en un azul marino profundo.
- **Azul estadio** (#0025aa): token `blue-deep` (`Azul700`, el azul del logo). El halo exterior de esa luz, el segundo foco que entra por la izquierda del encabezado y el tinte del peso del teléfono (`rgba(0, 37, 170, …)`). Hoy los dos azules están declarados en `.landing` pero los degradados escriben sus valores como `rgba()` literales: quien toque la luz cambia los dos sitios.

### Neutral
- **Noche** (#0b0b0b): token `ground`. El suelo de la página, la navegación al bajar y el fondo de la celda apagada; también el lienzo, `theme-color` y `color-scheme` mientras la landing está montada.
- **Noche de banda** (#131313): token `ground-2`. La banda de la sección de modos y el fondo de reserva de cada captura mientras carga.
- **Grafito** (#212121): token `surface`. Los controles redondos y la barra flotante de Obtener.
- **Grafito alto** (#2b2b2b): token `surface-2`. El hover de los controles redondos.
- **Filete** (#2b2b2b): token `line`. Los filetes de 1 px (bajo la navegación, bordes de la banda, filas de información y de escenas, pie) y el riel de progreso del carrusel.
- **Filete marcado** (#414141): token `line-strong`. Separadores de la tira de datos, borde de la celda apagada y de la barra flotante, subrayado en reposo de las rutas y la barra de las escenas ya vistas.
- **Blanco cal** (#f9f9f9): token `ink`. Titulares, datos y lo que se lee primero; a baja opacidad, las líneas de cancha (7 %), el filo de las capturas (9 %) y el hover de las escenas (3 %).
- **Gris humo** (#d6d6d6): token `ink-2`. El cuerpo de texto, las líneas de apoyo, el pulgar del progreso y el reloj del video.
- **Gris grada** (#b1b1b1): token `ink-3`. Enlaces de navegación y pie, el pie del QR, el subtítulo de la barra flotante y las escenas que faltan.
- **Gris sombra** (#858585): token `ink-4`. Rótulos de dato, tiempos de escena, la duración total, los avisos legales y la celda apagada.

### Named Rules
**La regla de la chispa única.** La lima marca energía y nada más: lo que se pulsa para obtener, lo que está corriendo, lo que tiene foco y la mitad del titular que empuja. Nunca es fondo de una sección, de un panel o de una tarjeta, ni texto corrido; cuando es fondo, lleva `lime-ink` encima.

**La regla de la luz, no del relleno.** El azul de marca entra como luz: degradados radiales que caen desde fuera del encuadre (arriba a la derecha en el encabezado, desde abajo en el cierre), la luz que se enciende detrás del teléfono y el resplandor desplazado bajo el ícono. En este mundo nunca es un relleno plano, ni el fondo de un botón, ni un color de texto.

**La regla de la escalera de tinta.** Cuatro tintas, cada una con su trabajo: `ink` para lo que se lee primero, `ink-2` para el cuerpo, `ink-3` para la navegación y lo secundario, `ink-4` para rótulos, tiempos, lo apagado y lo legal. `ink-4` solo va sobre `ground` o `ground-2` (5.33 y 5.04:1); sobre `surface` baja a 4.36:1 y no alcanza para texto.

## Typography

**Display Font:** Montserrat Variable (con Montserrat, system-ui, -apple-system, Segoe UI, sans-serif)
**Body Font:** Montserrat Variable (la misma familia, con el mismo respaldo)
**Label/Mono Font:** no hay monoespaciada; los números que corren usan las cifras tabulares de Montserrat.

**Character:** La geométrica de la guía de marca, en negro pesado: el 800 con interletrado cerrado se lee como el nombre de una app en su ficha, y el 500 del cuerpo deja respirar el texto sobre el negro. Se sirve autoalojada desde `@fontsource-variable/montserrat`, solo el subconjunto latino (`landing-font.css`: eje de peso 100–900, `font-display: swap`), que cubre el español y el inglés de la página con acentos, ñ y ¿¡.

### Hierarchy
- **Display** (800, clamp(2.5rem, 1.15rem + 4.4vw, 4rem), 1.02, -0.035em): el titular de la ficha, en dos renglones con el segundo en lima. El cierre usa la misma voz con piso más bajo: clamp(2.25rem, 1.2rem + 3.6vw, 4rem), interlineado 1.04 y `text-wrap: balance`.
- **Headline** (800, clamp(2rem, 1.35rem + 2.3vw, 3rem), 1.06, -0.03em): títulos de sección, con `text-wrap: balance`.
- **Title** (800, 1.0625rem, -0.01em): subtítulos como "Información". La marca en la navegación (1rem) y el nombre en la barra flotante (0.9375rem) son el mismo gesto, más chico. Los títulos de las filas de escena bajan a 700 con interlineado 1.3.
- **Body** (500, 1.0625rem, 1.65): texto corrido y descripciones de modos, a 34–38rem de ancho como máximo (unos 55 a 60 caracteres). La línea de apoyo del encabezado usa clamp(1rem, 0.94rem + 0.3vw, 1.125rem) con interlineado 1.6 y 33rem de ancho; los nombres que abren cada párrafo de modos van a 800 en `ink`.
- **Body-sm** (600, 0.9375rem, 1.5): filas de información y la ruta web. Los valores de la tira de datos usan este mismo tamaño a 700.
- **Label** (600, 0.875rem): navegación, pie e "Iniciar sesión".
- **Label-strong** (800, 0.875rem): el texto de los botones píldora (Descargar, Obtener).
- **Label-caps** (700, 0.6875rem, 0.08em, mayúsculas): solo los rótulos de dato de la tira de la ficha. La línea chica de la celda de Google Play usa la misma voz a 0.625rem y 0.06em (0.6875rem desde 640px).
- **Caption** (600, 0.75rem, 1.35): el pie del QR y el subtítulo de la barra flotante; los avisos legales van a 500 con interlineado 1.5.
- **Numeric** (700, 0.875rem, `tabular-nums`): el reloj del video; los tiempos de escena, a 0.8125rem.

### Named Rules
**La regla del 800.** Todo lo que es titular o acción va en 800 (ExtraBold). El cuerpo se queda en 500, la interfaz en 600 y los datos en 700; no hay otros pesos.

**La regla de las cifras quietas.** Todo número que cambia mientras se mira (el reloj del video, los tiempos de escena) lleva `font-variant-numeric: tabular-nums`, para que no baile.

**La regla de las mayúsculas de dato.** Las mayúsculas con interletrado rotulan un dato que va justo debajo, o la línea chica de un sello de tienda. Nunca van encima de un titular.

## Layout

Un solo contenedor centrado de 80rem (`--lp-max`) con un margen lateral fluido de 1.25rem a 2.5rem (`--lp-gutter`). La navegación mide 4rem (`--lp-nav`), es sticky, y el encabezado se mete debajo de ella con un margen negativo para que la luz empiece en el borde de la ventana. Todo arranca en el borde izquierdo del contenido salvo el cierre, que va centrado, y el carrusel de capturas, que arranca ahí (`--edge: max(var(--lp-gutter), calc((100% - var(--lp-max)) / 2 + var(--lp-gutter)))`) y se sale por la derecha de la ventana, con `scroll-snap` y ese mismo borde como `scroll-padding`.

Las secciones respiran con `padding-block` de clamp(4.5rem, 3rem + 5vw, 7.5rem), de 72 a 120px; la del video arranca un poco antes, clamp(4rem, 2.75rem + 3.5vw, 6rem), y el cierre se abre más, clamp(5rem, 3.5rem + 6vw, 8.5rem). Dentro, los espacios salen de una escala corta escrita en rem (0.25, 0.5, 0.625, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5 y 3rem: de 4 en 4px, más un paso de 10px): grupos apretados, de 0.25 a 0.75rem, entre rótulo y dato o entre botones hermanos, y separaciones amplias, de 2 a 3.5rem, entre bloques. Una sola sección va en banda (`ground-2` con filete arriba y abajo) para cambiar de registro sin recurrir a tarjetas.

- **640px:** el ícono pasa al lado del titular (de 72 a 96px), aparece Descargar en la navegación, las dos insignias van lado a lado y la celda apagada crece a 82px de alto; las capturas miden 16rem.
- **768px:** el bloque de descarga pasa a dos columnas; con puntero fino aparece el QR junto a la insignia de Apple y las insignias se apilan.
- **1024px:** enlaces en la navegación, ícono de 112px, el video a dos columnas (el teléfono sticky a `top: 6rem` a la izquierda; el texto y el índice de escenas a la derecha), modos a 7fr/5fr, pie en fila y flechas en el carrusel; la barra flotante de Obtener desaparece.
- **1200px:** la fila de la ficha, con la identidad a la izquierda y la descarga a la derecha; antes de ese ancho el titular se partiría en tres renglones.

El teléfono del video se mide contra la altura útil para que él y sus controles quepan en una pantalla: min(78vw, 19.5rem, calc((100svh - 10rem) * 0.46)) en teléfono y clamp(15rem, calc((100vh - 12rem) * 0.46), 20rem) desde 1024px. Todo elemento `position: fixed` va por `<Teleport to="body">`, porque `.app-content` (App.vue) lleva un `transform` y con él un elemento fijo deja de pegarse a la pantalla.

### Named Rules
**La regla del borde del contenido.** Los textos y los bloques arrancan en el borde izquierdo del contenedor; el cierre es la única pieza centrada, y el carrusel de capturas, la única que sale del contenedor, y solo por la derecha.

**La regla del puntero.** Lo que solo sirve con ratón (el QR) se decide por tipo de puntero, `(hover: hover) and (pointer: fine)`, y no por ancho: una ventana angosta de escritorio lo necesita y un iPad horizontal no.

## Elevation & Depth

Un híbrido de planos por tono y luz. Las superficies son planas: el escalón `ground` → `ground-2` → `surface` → `surface-2` y los filetes de 1 px separan todo lo que en otro mundo sería una tarjeta. La profundidad de ambiente no es sombra sino luz azul radial, más las líneas de cancha en SVG (rectángulos y el arco del área, trazo de 1.5px sin escalar, `stroke: rgba(249, 249, 249, 0.07)`). Las sombras de verdad son pocas y siempre desplazadas; el filo de las capturas y el bisel del teléfono son bordes dibujados con `box-shadow`.

Las recetas de luz, tal como están en el código:
- **Encabezado:** `radial-gradient(66rem 46rem at 90% -14%, rgba(1, 55, 210, 0.66), rgba(0, 37, 170, 0.26) 46%, transparent 76%), radial-gradient(44rem 30rem at 4% -6%, rgba(0, 37, 170, 0.34), transparent 72%)`, en una capa de hasta 62rem de alto con `mask-image: linear-gradient(to bottom, #000 68%, transparent)` para que la luz se apague sobre el carrusel.
- **Cierre:** `radial-gradient(closest-side, rgba(1, 55, 210, 0.45), rgba(0, 37, 170, 0.15) 55%, transparent)`, entrando desde abajo (`inset: auto -10% -40% -10%`, 80 % de alto).
- **Detrás del teléfono:** `radial-gradient(closest-side, rgba(1, 55, 210, 0.42), transparent 75%)` (`inset: -10% -30% 10%`).

### Shadow Vocabulary
- **Resplandor del ícono** (`box-shadow: 0 14px 36px -12px rgba(1, 55, 210, 0.75)`): el ícono de la ficha. El del cierre, más grande, usa `0 20px 50px -16px rgba(1, 55, 210, 0.8)`.
- **Peso del teléfono** (`box-shadow: inset 0 0 0 1px #3a3a3a, inset 0 0 0 3px #111, 0 40px 80px -24px rgba(0, 0, 0, 0.9), 0 18px 40px -12px rgba(0, 37, 170, 0.35)`): solo la maqueta del iPhone; los dos `inset` son el bisel.
- **Disco de reproducción** (`box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.7)`): despega el disco lima del póster del video.
- **Filo de captura** (`box-shadow: 0 0 0 1px rgba(249, 249, 249, 0.09)`): hace de borde, no de sombra; separa las capturas, que traen su propio fondo casi negro, del suelo de la página.

### Named Rules
**La regla del plano por tono.** Los paneles y los controles se separan por escalón de gris y filete de 1 px, y llevan borde o sombra, nunca las dos. El único objeto con volumen es el teléfono, porque es un objeto y no un panel.

**La regla de la luz de ambiente.** La profundidad de ambiente es luz azul radial: cae desde fuera del encuadre en el encabezado y en el cierre, y se enciende detrás del teléfono. Nunca es un resplandor sin desplazamiento alrededor de un elemento; el filo de 1px de las capturas es un borde, no luz.

## Shapes

Formas suaves y de producto: radios de 14 a 16px en lo que contiene (insignias, el papel del QR, las capturas), 20px en la barra flotante, píldora en lo que se pulsa y en el riel del carrusel, y círculo en los controles. El foco sigue el radio de cada pieza: 0.25rem en los enlaces de texto y 0.5rem en la navegación y las filas de escena. Las líneas son de 1px; el subrayado de las rutas, de 1.5px a 0.3em del texto; los rieles de progreso, de 3px en el carrusel y 2px en las escenas.

El ícono de la app conserva la esquina de iOS, con un radio de entre el 22 y el 26 % de su lado a cualquier tamaño: 0.5rem a 32px, 0.55rem a 36px, 0.7rem a 44px, 1.05rem a 72px, 1.35 o 1.4rem a 96px y 1.6rem a 112px; el archivo (`app-icon.webp`) ya trae su máscara de esquinas. El teléfono del video tiene cuerpo de 3.1rem de radio, pantalla de 2.5rem e isla en píldora.

Los íconos son propios (`LandingIcon.vue`): una retícula de 24px, trazo de 2px con puntas y uniones redondas, en `currentColor` y medidos en `em`; reproducir y pausa van rellenos.

### Named Rules
**La regla del ícono de iOS.** El ícono de la app siempre lleva la esquina de iOS; nunca círculo, nunca cuadrado.

**La regla del trazo único.** Un solo sistema de íconos dibujados en SVG sobre la misma retícula de 24px y en `currentColor`: los de línea con trazo de 2px redondo, los de reproducción rellenos. Ni glifos Unicode ni emoji en lugar de un ícono.

## Components

Piezas propias en `src/components/landing/`, con estilos `scoped`; de Tailwind solo se usa `sr-only` para un título oculto. En este mundo no hay tarjetas, chips ni campos de formulario.

### Buttons
- **Shape:** píldora (999px) para la acción; círculo para los controles.
- **Primary (Obtener / Descargar):** fondo `lime` con `lime-ink`, 0.875rem a 800, `padding: 0.55rem 1.1rem` en la navegación (desde 640px) y `0.7rem 1.15rem` con 0.01em de interletrado en la barra flotante.
- **Hover / Focus:** `filter: brightness(1.06)` en 160ms; pulsado `scale(0.97)` en la barra; foco con anillo `ink` de 2px a 3–4px, porque sobre la lima un anillo lima no se vería.
- **Disco de reproducción:** el mismo par lima y tinta en un círculo de 4.5rem, con el triángulo corrido 0.15em a la derecha para centrarlo a la vista; al pasar el ratón crece a `scale(1.06)` en 200ms con la salida exponencial.
- **Controles redondos (flechas del carrusel, video):** 2.75rem, `surface` con filete `line` e ícono `ink`; hover `surface-2`, pulsado `scale(0.96)`, apagado al 35–40 % de opacidad y foco lima a 3px.

### Insignias de tienda
- **App Store:** la insignia oficial de Apple, negra y en el idioma de la página (es-mx o en-us, del toolbox de marketing de Apple), a su tamaño oficial de 246×82; nunca se redibuja ni se recolorea. Hover `translateY(-2px)`, pulsado `scale(0.985)` y foco lima a 4px.
- **Google Play, próximamente:** una celda apagada del mismo ancho, dibujada completa en lugar de un hueco: `ground` con filete `line-strong`, texto e ícono en `ink-4`, 3.5rem de alto en teléfono y 82px desde 640px. Es un párrafo, no un control: no recibe foco ni parece botón. Cuando exista la ficha de Google Play pasa a insignia oficial con enlace.
- **QR:** papel blanco (#ffffff) de 7.5rem con 0.375rem de relleno y radio de 14px, y su pie en Caption `ink-3`. Solo con puntero fino desde 768px, y siempre junto a la insignia de Apple.
- **Ruta web:** enlace subrayado en `ink-2` con subrayado `line-strong` de 1.5px a 0.3em y flecha lima; al pasar el ratón el texto sube a `ink`, el subrayado se vuelve lima y la flecha avanza 3px.

### Navigation
- Sticky, 4rem, transparente sobre la luz del encabezado; al bajar 8px se vuelve opaca (`ground` con filete `line`) en 200ms. Opaca a propósito: con cualquier transparencia, los titulares blancos que pasan por debajo se leen como un fantasma detrás de la marca.
- Marca con el ícono de 36px y el nombre en 800; enlaces (desde 1024px) e "Iniciar sesión" en Label `ink-3`, que pasan a `ink` al pasar el ratón; Descargar en píldora lima desde 640px.
- Foco con anillo lima de 2px a 4px y radio de 0.5rem.

### Tira de datos y filas de información
- **Tira de la ficha:** una lista de definiciones en fila; el rótulo en Label-caps `ink-4` sobre el valor en 0.9375rem a 700 en `ink`. Las celdas se separan con un filete izquierdo `line-strong` de 1px y 1.1rem de aire a cada lado; la primera no lleva filete.
- **Filas de información:** rejilla de `8.5rem` y el resto, 0.95rem de aire arriba y abajo con filete `line` debajo, en Body-sm: rótulo en `ink-4` y valor en `ink`.

### Carrusel de capturas (firma)
- Las capturas de la App Store ya vienen compuestas (titular, teléfono y lupa) y se muestran sin marco extra: radio de 1rem, el filo de 1px al 9 % y `ground-2` de fondo mientras cargan. Ancho de min(68vw, 16.5rem) en teléfono, 16rem desde 640px y clamp(15rem, 18vw, 17.5rem) desde 1024px; 1rem entre una y otra (1.25rem en escritorio).
- Copias WebP de 600 y 900px servidas desde `public/img/landing/shots/`, con el PNG original de 1320px como el candidato más grande del `srcset`.
- La barra de desplazamiento nativa se oculta y la sustituye un riel de 3px (`line`, con el pulgar en `ink-2`) de hasta 12rem; desde 1024px, flechas redondas que avanzan tantas capturas como caben enteras menos una. La pista recibe foco y se recorre con teclado, rueda o dedo.

**La regla de la entrada única.** La página tiene un solo momento de entrada: las capturas llegan desde la derecha en cadena (de `opacity` 0.4 a 1 y de `translateX(3rem)` a 0, en 900ms con la salida exponencial, 70ms entre una y otra hasta la sexta y 120ms de arranque), visibles desde el primer cuadro. Ninguna otra sección anima su entrada.

### App Preview: teléfono e índice de escenas (firma)
- El video (la App Preview real, 886×1920) va dentro de un iPhone dibujado en CSS: cuerpo #050505 con 0.6rem de bisel, pantalla e isla negras, botones laterales en #2b2b2b, el "Peso del teléfono" como sombra y la luz azul detrás.
- Antes de la primera reproducción, el disco lima sobre un velo `linear-gradient(to bottom, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.35))`; arranca con sonido porque es un gesto de quien mira. Debajo, controles redondos (reproducir, sonido) y el reloj en Numeric, con el transcurrido en `ink-2` y el total en `ink-4`; mientras carga, un giro de 1.1rem con la parte de arriba en lima.
- El índice de escenas es a la vez el texto alternativo y la navegación del video: filas con filete `line`, tiempo en Numeric a 0.8125rem en `ink-4` y título a 1.0625rem / 700 / 1.3 en `ink-3`. La escena que corre enciende su tiempo en lima y su título en `ink`, con una barra lima de 2px que avanza en tiempo real; las ya vistas quedan con barra `line-strong` y título `ink-2`; las que faltan, apagadas. Tocar una salta a su segundo.
- Arranca sola, silenciada y en bucle, solo con puntero fino (o con `DEMO_VIDEO.lightweight` activado), nunca con menos movimiento o ahorro de datos, y se pausa al salir de pantalla. Si falla, un aviso sobre el video en `rgba(19, 19, 19, 0.92)` con radio de 0.75rem.

### Barra Obtener (firma)
- Solo en teléfono y tableta (desaparece desde 1024px): flota a 0.75rem de los bordes y de la zona segura, en `surface` con filete `line-strong`, radio de 1.25rem y 0.625rem de relleno; ícono de 44px, nombre a 0.9375rem / 800 y subtítulo en Caption `ink-3` con elipsis; la acción, en píldora lima. En Android ofrece la web en lugar de la App Store.
- Entra y sale con `translateY` en 320ms con la salida exponencial y la opacidad en 200ms; oculta queda `inert`. Aparece solo cuando ninguna descarga ni el pie están a la vista, después de pasar la del encabezado y nunca encima del teléfono del video.
- Va por Teleport fuera de `.landing`, así que redeclara los seis tokens que usa y la pila de Montserrat: si cambia un valor en `.landing`, cambia también en `GetAppBar.vue`.

### Foco y superficies del navegador
- Todo lo interactivo lleva un anillo de 2px: lima sobre la noche, `ink` sobre la lima, a 3–4px de separación (por dentro, a -2px, en la pista del carrusel y en las filas de escena), con el radio de la pieza.
- La selección de texto es `lime` con `lime-ink`; el resaltado al tocar es transparente en enlaces y botones; `color-scheme: dark` oscurece los controles nativos.

## Do's and Don'ts

### Do:
- **Do** tomar los colores de los tokens `--lp-*` de `.landing` y, si un elemento sale de `.landing` por Teleport, redeclarar los mismos valores, como hace `GetAppBar.vue`.
- **Do** poner `lime-ink` (#212121) sobre todo fondo lima (11.02:1) y usar un anillo de foco `ink` cuando lo enfocado es lima.
- **Do** dar a cada control su anillo de foco de 2px y su estado de hover; los que pueden apagarse (las flechas del carrusel, los controles del video) llevan además su estado apagado.
- **Do** mostrar las capturas y el video de la App Store tal cual, con radio de 1rem y el filo de 1px al 9 %, y servir copias WebP con el original como el candidato más grande del `srcset`.
- **Do** usar la insignia oficial de Apple (negra, en el idioma de la página, 246×82) sin tocarla, y dibujar Google Play como celda apagada y sin foco mientras no exista su ficha.
- **Do** mantener `tabular-nums` en todo número que corre y sacar los espacios de la escala en rem de este archivo.
- **Do** respetar `prefers-reduced-motion: reduce`: sin entrada del carrusel, sin desplazamientos animados y con desplazamiento `auto` en lugar de `smooth`.

### Don't:
- **Don't** usar la lima como texto corrido ni como fondo de una sección, un panel o una tarjeta.
- **Don't** usar el azul de marca como relleno plano, fondo de botón o color de texto: en este mundo es luz.
- **Don't** escribir texto en `ink-4` sobre `surface`: baja a 4.36:1.
- **Don't** agregar un modo claro ni leer la clase `.dark` del resto de la web: la página es oscura siempre.
- **Don't** poner un rótulo en mayúsculas encima de un titular; las mayúsculas con interletrado son para rótulos de dato.
- **Don't** volver a enmarcar las capturas con otro teléfono, una sombra o un borde grueso: ya vienen compuestas. El video sí va dentro del teléfono, porque es la pantalla sola.
- **Don't** animar la entrada de cada sección; la única entrada es la del carrusel.
- **Don't** mezclar este sistema con el heredado: ni clases `primary-*` (esmeralda), `gray-*` (slate) o `dark:` ni la pila de fuentes del sistema dentro de la landing, ni `--lp-*` o Montserrat en pantallas de la app sin una migración decidida.
