# Guía turística de Huancavelica

Sitio web estático (HTML, CSS y JavaScript, sin dependencias ni compilación) optimizado para móviles, con animaciones fluidas, galería interactiva e imágenes integradas, listo para publicar en **GitHub Pages** o **Vercel**.

## Novedades de esta versión

- **Modo Oscuro automático (PC y celular) + Selector manual:** detecta automáticamente el tema del sistema operativo (`prefers-color-scheme`) y el tipo de dispositivo (PC o celular), e incluye un botón en la cabecera para alternar entre modo Oscuro, Claro y Automático.
- **Soporte móvil completo (Responsive):** menú hamburguesa desplegable en pantallas pequeñas, barra de progreso de lectura, grillas adaptables, botones táctiles y soporte para gestos de deslizamiento (*swipe*) en el visor de fotos.
- **Animaciones e interactividad:** aparición escalonada al hacer scroll (*scroll reveal*), contadores numéricos animados en la portada, buscador en tiempo real, guardado de atractivos favoritos en **Mi ruta** y lista de etapas marcables en las rutas de 1, 3 y 5 días.
- **Imágenes y galería Lightbox:** incluye 17 imágenes optimizadas en la carpeta `img/` con nombres de archivo limpios sin tildes ni espacios para evitar errores de carga en servidores web. Las 12 tarjetas de *Qué ver* tienen foto.
- **Botones reorganizados:** cabecera con tres botones del mismo tamaño (tema, *Mi ruta* y menú), navegación horizontal solo cuando los 8 enlaces caben en una línea, filtro *Mi ruta* junto a las categorías, contador de resultados, botones de portada del mismo ancho y visor de fotos con cerrar arriba y flechas a los lados.

## Publicar en GitHub Pages o Vercel

1. Crea un repositorio nuevo en GitHub (o arrastra la carpeta en Vercel).
2. Sube todos los archivos conservando la estructura: `index.html`, `style.css`, `main.js`, `favicon.svg` y la carpeta `img/`.
3. En GitHub ve a **Settings → Pages → Deploy from a branch**, selecciona `main` y `/ (root)`.
