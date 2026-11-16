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

## Con más tiempo

_Pendiente de completar._

## Uso de la IA

Usé Claude Code como asistente durante toda la prueba.

- **Fase 0:** le pedí un plan de desarrollo por fases a partir del enunciado y que creara el repo y el scaffold. Acepté el plan y el stack propuesto (Vite, sin React Query ni react-hook-form).
- **Fase 1:** le pedí montar Vitest + Testing Library. Acepté la configuración propuesta y verifiqué que `npm test`, `build` y `lint` pasaran antes de hacer el commit.
- **Fase 2:** le pedí los tipos y el cliente de API. Acepté la estructura que propuso (tratamiento explícito de `res.ok` y de las cancelaciones) y verifiqué las respuestas reales de la API con `curl`.
