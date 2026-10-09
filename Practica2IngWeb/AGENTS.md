# AGENTS.md — frontend

Practica 2 – Ingeniería Web. Single-page React app, todavía mayormente el
starter de Vite más una instancia de axios. Todos los comandos de este archivo
se ejecutan desde este directorio (es la raíz del proyecto Vite).

Para el stack completo (Docker, backend, proxy) ver `../AGENTS.md`.

## Comandos

Package manager es **bun** (`bun.lock`, no hay lockfile de npm/yarn):

- `bun install`
- `bun run dev` — dev server en 5173
- `bun run lint` — ESLint 10 flat config, pasa limpio
- `bun run build` — salida en `dist/`
- `bun run preview` — sirve el `dist/` construido

**No hay runner de tests ni typecheck**: los fuentes son `.js`/`.jsx`, no
TypeScript (aunque `@types/react` esté instalado). Verifica con
`bun run lint` + `bun run build`, y abriendo la app.

Dentro de Docker los comandos son los mismos, pero el contenedor ya corre
`bun run dev` con el código montado (HMR). No hace falta `bun install` a mano:
`node_modules` es el volumen `web_node_modules`.

## Env vars

- `.env` y `.env.example` viven en **la raíz del proyecto**, no en `src/`.
  Vite sólo lee del `envDir`, cuyo default es la raíz: estuvo en `src/` y por eso
  `import.meta.env.VITE_APP_API_URL` llegaba como `undefined`. No los muevas de
  vuelta a `src/`.
- `VITE_APP_API_URL=/api` es **relativa a propósito**: el proxy de Vite la
  reenvía al backend, así front y API comparten origen y no hace falta CORS.
- El destino del proxy no se configura aquí: `vite.config.js` lo lee de
  `process.env.PROXY_TARGET` (los `.env` se cargan después de evaluar el
  config). Local → default `http://localhost:8081`; Docker → lo pone
  `docker-compose.yml` como `http://auth-service:8081`.
- Sólo las variables con prefijo `VITE_` llegan al cliente. `.gitignore`
  ignora `*.local` pero **no** `.env`, así que lo que esté en `.env` queda
  versionado: no pongas secretos ahí.

## Wiring / entrypoints

- `index.html` → `/src/main.jsx` → `src/App.jsx`. Router ya instalado
  (`react-router-dom`, `BrowserRouter` en main.jsx) y estado global mínimo:
  `src/store/SessionProvider.jsx` mantiene la sesión en memoria (contexto en
  `src/store/session.js`). Las rutas públicas (login/register), el shell
  autenticado (`src/layout/AuthedShell.jsx`) y las rutas de módulos por rol
  viven en `App.jsx`; los canales de cada módulo son placeholders hasta que se
  conecten.
- `src/api/axios.js` es la única capa HTTP. Importa el default export `api` en
  vez de crear instancias de axios sueltas.
- `vite.config.js` además de React define el dev server: `host: true` (necesario
  para el contenedor), `port: 5173` con `strictPort`, `allowedHosts: true`,
  el proxy de `/api` y `watch.usePolling` leído de `USE_POLLING`.
- Los assets estáticos se reparte en dos: importables en `src/assets/` (Vite les
  pone hash) y de paso en `public/`. `public/icons.svg` es un sprite SVG usado
  como `<use href="/icons.svg#id" />`; los iconos sólo se alcanzan por `id`.
- Los imports de relleno `hero.png` / `react.svg` / `vite.svg` y los ids de
  sección `#center`, `#next-steps`, `#spacer` de `App.jsx` son de la plantilla
  original de Vite. Bórralos en vez de construir encima.

## Convenciones

- **Existe un sistema de diseño**: `DESIGN.md` (SHINRYŪ-KAI). Tokens, gamut,
  componentes y copy están especificados ahí — léelo antes de escribir JSX o
  CSS nuevo, y no inventes colores/ radios nuevos fuera de sus tokens.
- ESLint aplica `js.configs.recommended` + `react-hooks` + `react-refresh/vite`
  sólo a `**/*.{js,jsx}`. Sin reglas de estilo ni Prettier: el formateo no se
  verifica y los archivos son inconsistentes (`src/App.jsx` sin punto y coma,
  `src/api/axios.js` con ellos). Sigue el estilo del archivo que edites.
- `react-refresh/only-export-components` impide que un archivo de componente
  exporte además valores que no son componentes (mételos en otro archivo).
- `.dockerignore` excluye `node_modules` y `dist`: el contenedor los
  reinstala/resuelve desde la imagen y el volumen.