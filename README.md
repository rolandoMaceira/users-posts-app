# Usuarios y publicaciones

Prueba técnica Frontend (React + TypeScript) sobre la API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com).

**Qué hace**

- Lista de usuarios con búsqueda por nombre (ignora mayúsculas y tildes).
- Al elegir un usuario: su perfil y sus publicaciones.
- Formulario para crear una publicación, con título y texto obligatorios y errores por campo. La nueva publicación aparece arriba de la lista y se conserva al cambiar de usuario y volver.
- Estados de carga (esqueletos) y de error (con botón Reintentar) visibles en usuarios y publicaciones.
- Extras: tema claro/oscuro, flujo lista → detalle en móvil, y la selección y el tema se recuerdan al recargar.

## Cómo ejecutarlo

Requiere Node 20.19 o superior (probado con Node 24).

```bash
npm install
npm run dev     # app en http://localhost:5173
npm test        # tests (Vitest + Testing Library)
npm run build   # typecheck + build de producción
npm run lint    # oxlint
```

## Registro de tiempo

- Inicio: 2026-11-15 21:12
- Fin: 2026-11-15 21:54
- Tiempo total: **unos 40 minutos** de trabajo con el asistente, medidos con la hora de los commits (el primero a las 21:14). El plan de fases se habló justo antes de empezar y no está incluido en esa cifra.

## Stack

Vite + React 19 + TypeScript, CSS plano con variables, Vitest + Testing Library + jsdom. Sin librerías de estado, formularios, estilos ni iconos: son tres endpoints y dos campos, y prefiero pocas dependencias.

## Estructura

```
src/
  api/          cliente de la API y tipos (api.ts, types.ts)
  hooks/        useUsers, useUserPosts, useTheme
  lib/          lógica pura: filtro, iniciales, validación, storage
  components/   UserList, UserDetail, PostList, PostForm, Toast, Loading, ErrorMessage...
  test/         setup de Vitest y fixtures que imitan la API
  App.tsx       composición y estado compartido
```

## Decisiones técnicas

**Datos y errores**

- El cliente (`src/api/api.ts`) comprueba `res.ok`, porque `fetch` no lanza con un 404 o 500. Convierte los fallos en un `ApiError` con un mensaje legible para el usuario.
- Todas las peticiones aceptan un `AbortSignal`. Las cancelaciones se propagan sin envolver para que la UI las ignore en lugar de mostrarlas como error.
- Hooks propios (`useUsers`, `useUserPosts`) en vez de React Query: la app es pequeña y así se ve el manejo de estados.
- **Condición de carrera:** `useUserPosts` cancela la petición anterior al cambiar de usuario, y `UserDetail` se monta con `key={user.id}`, de modo que su estado se reinicia por usuario y nunca se ven publicaciones del usuario anterior mientras cargan las nuevas.

**Publicaciones nuevas**

- `POST /posts` se llama de verdad, pero JSONPlaceholder responde siempre con `id: 101` y no persiste nada. Por eso la publicación se guarda en el estado de `App`, por usuario, con un id local negativo que nunca choca con los de la API. El formulario avisa de que no se guarda en el servidor.
- Validación a mano, con una función pura (`src/lib/validation.ts`): un campo con solo espacios cuenta como vacío. Errores por campo, foco al primer campo inválido y el error se limpia al corregirlo. Si el envío falla, se muestra el error y se conserva lo escrito.

**Accesibilidad**

- Cada usuario es un `<button>` con `aria-current`. Campos con `label`, `aria-invalid` y `aria-describedby`. Los errores de red usan `role="alert"`; carga, contador y aviso de publicación usan `role="status"`.
- Foco visible y `prefers-reduced-motion` respetado.

**Diseño**

- Una sola familia tipográfica (Bricolage Grotesque) y tokens CSS para color, con tema claro y oscuro. Un script en `index.html` fija el tema antes de pintar, para evitar el parpadeo.
- Cada usuario tiene un tono propio, derivado de su id, que se usa en su monograma, la franja del perfil y el botón y el aviso de publicar. Es el detalle que da identidad a la app sin necesitar imágenes.
- `localStorage` siempre va protegido con `try/catch`: la app funciona igual sin persistencia.

**Tests (21, en 5 archivos)**

- Cubren búsqueda y filtro, el formulario (errores, espacios, envío correcto, fallo del envío), carga y error con reintento, publicaciones del usuario, crear una publicación que sobrevive al cambio de usuario, la respuesta lenta del usuario anterior, el tema, la selección recordada y el aviso que se cierra solo.
- `fetch` se simula con un helper que imita JSONPlaceholder (`src/test/fixtures.ts`). Pruebo comportamiento visible (roles y etiquetas), no detalles internos.

## Con más tiempo

- **Editar y borrar** publicaciones, con deshacer y actualización optimista.
- **React Query** para caché, reintentos y deduplicar peticiones, si la app creciera.
- **Persistir** las publicaciones nuevas (por ejemplo en `localStorage`), ya que hoy se pierden al recargar.
- **Teclado:** `/` para enfocar el buscador y flechas para recorrer la lista.
- **Tests e2e** con Playwright y una revisión de accesibilidad automática (axe).
- **Fuente propia** en vez de Google Fonts, para no depender de un servicio externo, y un `ErrorBoundary`.
- Buscar dentro de las publicaciones y paginar si el volumen de datos lo pidiera.

## Uso de la IA

Usé Claude Code durante toda la prueba, trabajando por fases con un commit cada una. Cómo lo usé:

**Qué le pedí**

- Un plan por fases a partir del enunciado, la creación del repo y el scaffold, y después cada fase por separado: API, lista con búsqueda, estados de carga y error, publicaciones, formulario, tests y la dirección visual.
- Que me propusiera cómo hacer la app más moderna y atractiva antes de tocar nada. Elegí su recomendación, dejando fuera los atajos de teclado.

**Qué acepté**

- El stack mínimo (Vite, sin React Query ni librerías de formularios), la capa de API con `res.ok` y cancelación, y reiniciar el panel por usuario con `key` en lugar de limpiar estado a mano.
- La dirección visual: tokens, tema oscuro y el tono por usuario. Verifiqué las respuestas reales de la API con `curl` antes de fiarme del comportamiento de `POST /posts`.

**Qué corregí o detecté**

- **Un test que no medía nada.** El test de la respuesta lenta pasaba aunque quitara la protección, porque esperaba un solo tick y comprobaba antes de que llegara la respuesta. Lo detecté con una prueba de mutación (quitar el `key` y ver si fallaba), lo arreglé esperando de verdad y comprobé que ahora falla sin la protección.
- **Foco tras publicar.** Había deshabilitado los campos durante el envío, lo que impedía devolver el foco al título. Dejé solo el botón deshabilitado.
- **Aviso del linter** por `setState` síncrono dentro de un efecto: lo moví al callback de reintento.
- **Errores de herramienta.** Un comando que escribía muchos archivos de golpe falló en el shell, y una sustitución con regex dejó mal el JSX de `App.tsx`. En los dos casos se rehízo con ediciones precisas.
- **Dos fallos visuales que vi al probarlo:** la franja del perfil era demasiado alta, y tapaba parte del monograma porque un elemento posicionado se pinta encima de uno que sube con margen negativo. Pedí reducirla y se arregló subiendo el perfil de capa.
- **Aviso de publicación:** pedí cambiarlo por uno arriba a la derecha, con check y una barra de progreso que se vacía, y que el botón tomara el color de cada perfil.
