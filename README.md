# Users & Posts

Prueba técnica Frontend (React + TypeScript) sobre la API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com).

> README en construcción: se va completando por fases junto con los commits.

## Cómo ejecutarlo

```bash
npm install
npm run dev     # app en http://localhost:5173
npm test        # tests (Vitest + Testing Library)
npm run build   # typecheck + build
npm run lint
```

## Registro de tiempo

- Inicio: 2026-11-15 21:12 (hora local, arranque del scaffold)
- Fin: _pendiente_
- Tiempo total: _pendiente_

## Decisiones técnicas

- **Fase 0:** Vite + React + TypeScript por arranque rápido y cero configuración. Sin librerías extra de estado, formularios o estilos: la app es pequeña y prefiero dependencias mínimas.

- **Fase 1:** Vitest en lugar de Jest porque comparte la configuración de Vite (sin Babel ni transformaciones extra). Entorno jsdom, `globals: true` y `jest-dom` registrado en `src/test/setup.ts`. Test de humo del `App` para validar la infraestructura.

- **Fase 2:** capa de API aislada en `src/api/` (tipos + funciones `getUsers`, `getPostsByUser`, `createPost`). Comprueba `res.ok` porque `fetch` no falla con 4xx/5xx, lanza un `ApiError` con mensajes legibles para el usuario y acepta `AbortSignal` para cancelar peticiones; las cancelaciones se propagan sin envolver para poder ignorarlas. Contrasté los endpoints reales con `curl`: `POST /posts` devuelve siempre `id: 101` y no persiste, así que la UI usará un id local único.
- **Fase 3:** lista de usuarios con búsqueda por nombre. El filtro (`src/lib/users.ts`) es una función pura que ignora mayúsculas y tildes, y se calcula con `useMemo` sin debounce porque es local. Cada fila es un `<button>` con `aria-current` para el usuario elegido, y el contador usa `role="status"`. Diseño: tokens CSS en `index.css`, una sola familia tipográfica (Bricolage Grotesque), listado con divisores en lugar de tarjetas y monogramas de iniciales con un tono derivado del id. El estado de datos vive en el hook `useUsers` (con cancelación al desmontar y reintento).
- **Fase 4:** estados de carga y error como componentes reutilizables. `Loading` dibuja filas fantasma con la misma forma que la lista real (evita saltos de layout) y anuncia el texto con `role="status"`. `ErrorMessage` usa `role="alert"`, explica qué falló con el mensaje del `ApiError` y ofrece `Reintentar`. La animación respeta `prefers-reduced-motion`.
- **Fase 5:** al elegir un usuario se monta `UserDetail` con `key={user.id}`, de modo que el estado se reinicia por usuario y nunca se ven publicaciones del anterior. `useUserPosts` cancela con `AbortController` al cambiar de usuario o desmontar, evitando que una respuesta lenta pise a la actual (race condition). Incluye estado vacío, esqueleto de carga propio y error con reintento.
- **Fase 6:** formulario con validación manual (sin librerías: son solo dos campos). La regla vive en una función pura (`src/lib/validation.ts`): un campo con solo espacios cuenta como vacío. Errores por campo con `aria-invalid`/`aria-describedby`, foco al primer campo inválido y el error se limpia al corregir. Al enviar se llama a `POST /posts`; mientras tanto el botón queda deshabilitado, y si falla se muestra el error y se conserva lo escrito. Como la API siempre responde `id: 101` y no persiste, la publicación se guarda en el estado de `App` por usuario con un id local negativo (nunca choca con los de la API), así no desaparece al cambiar de usuario y volver. Las nuevas llevan una etiqueta "Nueva" y el formulario avisa de que no se guardan en el servidor.
- **Fase 7:** 16 tests en 4 archivos (Vitest + Testing Library + user-event). Los de componentes cubren la búsqueda, el estado vacío, la selección y el formulario (errores por campo, espacios, envío correcto, fallo del envío). Los de `App` mockean `fetch` con un helper que imita JSONPlaceholder (`src/test/fixtures.ts`) y cubren carga, error con reintento, publicaciones, crear una publicación que sobrevive al cambio de usuario y la respuesta lenta de un usuario anterior. Pruebo comportamiento visible para el usuario (roles y etiquetas), no detalles internos.
- **Fase 8 (aspecto de app):** dirección visual pensada para que se sienta una app y no una pantalla de listado. Tokens CSS con tema claro/oscuro (un script en `index.html` fija el tema antes de pintar para evitar parpadeo; se guarda en `localStorage` con acceso protegido por `try/catch`). Shell con barra superior y paneles flotantes. Cada perfil tiene una portada cuyo degradado deriva del mismo tono que su monograma, así que cada usuario tiene su identidad de color. Las publicaciones son un feed de tarjetas, el formulario es un compositor (textarea que crece, contador) y publicar muestra un aviso accesible (`role="status"`) y anima solo la publicación nueva. En móvil el flujo es lista → detalle con botón Usuarios, y el usuario elegido se recuerda al recargar.

## Con más tiempo

_Pendiente de completar._

## Uso de la IA

Usé Claude Code como asistente durante toda la prueba.

- **Fase 0:** le pedí un plan de desarrollo por fases a partir del enunciado y que creara el repo y el scaffold. Acepté el plan y el stack propuesto (Vite, sin React Query ni react-hook-form).
- **Fase 1:** le pedí montar Vitest + Testing Library. Acepté la configuración propuesta y verifiqué que `npm test`, `build` y `lint` pasaran antes de hacer el commit.
- **Fase 2:** le pedí los tipos y el cliente de API. Acepté la estructura que propuso (tratamiento explícito de `res.ok` y de las cancelaciones) y verifiqué las respuestas reales de la API con `curl`.
- **Fase 3:** le pedí la lista con búsqueda y la dirección visual (usó la skill `frontend-design`). Acepté la propuesta de diseño. Correcciones: un linter marcó `setState` síncrono dentro de un efecto y lo moví al callback de reintento; y su primer intento de escribir todos los archivos de golpe falló en el shell, así que los volvió a crear uno a uno.
- **Fase 4:** le pedí los estados de carga y error. Acepté los componentes y el uso de esqueletos en vez de un spinner genérico. Aún no los he visto en el navegador; los validaré con tests en la fase 7.
- **Fase 5:** le pedí el panel de publicaciones con cancelación. Acepté el hook y la cabecera de perfil. Decisión de diseño que tomó y acepté: reiniciar el panel con `key` en lugar de limpiar estado a mano dentro del efecto (lo que además evita el aviso del linter).
- **Fase 6:** le pedí el formulario validado. Acepté su diseño (validación pura + estado por usuario en `App`). Corrección durante la revisión: había deshabilitado los campos mientras se enviaba, pero eso impedía devolver el foco al título tras publicar; los quité y dejé solo el botón deshabilitado.
- **Fase 7:** le pedí los tests. Corrección importante: el test de la condición de carrera pasaba aunque quitara la protección (esperaba un solo tick de microtareas y comprobaba antes de que llegara la respuesta tardía). Lo detecté haciendo una prueba de mutación (quitar el `key` y ver si el test fallaba), lo arreglé esperando de verdad y comprobé que ahora falla sin la protección y pasa con ella.
- **Fase 8:** le pedí algo más moderno y atractivo; propuso un paquete (portada por usuario, shell de app, tema oscuro, flujo móvil, aviso) y acepté su recomendación dejando fuera atajos de teclado. Correcciones: una sustitución con regex dejó mal el JSX de `App.tsx` y lo reparó con una edición precisa; y al mover el aviso de publicación a un toast global rompió dos tests (había varias regiones `status`), que se actualizaron.
