# AGENTS.md

Práctica 2 – Ingeniería Web. Dos apps en un solo repo, orquestadas por el
`docker-compose.yml` de la raíz: `Practica2IngWeb/` (React 19 + Vite 8) y
`Practicas/` (Spring Boot 3.3 / Java 17). Detalle del frontend en
`Practica2IngWeb/AGENTS.md`.

## Comandos

Todo se coordina desde la raíz:

- `docker compose up --build` — los 3 servicios (front 5173, API 8081, DB 5433).
- `docker compose logs -f web` / `-f auth-service` — logs.
- `docker compose down` / `down -v` — parar / parar y borrar la BD.
- `docker compose restart auth-service` — tras tocar Java; no hay watcher, hay
  que reconstruir o reiniciar a mano.

Sin Docker:

- Frontend: `cd Practica2IngWeb && bun install && bun run dev` (bun es el
  package manager, ver `bun.lock`; no hay lockfile de npm/yarn).
- Backend: `cd Practicas && bash mvnw spring-boot:run`.
  **OJO: `mvnw` no tiene el bit de ejecución** (`100644` en git), así que
  `./mvnw` da `Permission denied`. Usar `bash mvnw ...`. `mvn` tampoco está
  instalado globalmente en esta máquina.

## Verificación

- Frontend: `bun run lint` (ESLint 10 flat config, pasa limpio) y `bun run build`.
  **No hay runner de tests ni typecheck**: los fuentes son `.js`/`.jsx`, no TS.
- Backend: `bash mvnw test`. El único test es `PracticasApplicationTests`
  (`@SpringBootTest` sin propiedades), así que **falla salvo que haya Postgres
  en `localhost:5432`** — que es el default de `DB_URL`, distinto del `5433`
  que publica el `db` de compose.

## Trampas del entorno

- **Proxy de Vite**: el browser y la API comparten origen (5173 → `/api` →
  auth-service:8081), por eso no hay CORS que configurar. El destino se lee de
  `process.env.PROXY_TARGET`, no de `.env` (los `.env` se cargan después de
  evaluar `vite.config.js`). Default local: `http://localhost:8081`.
- **`PROXY_TARGET` y `USE_POLLING` no deben llevar prefijo `VITE_`**: con
  prefijo, Vite los mete en el bundle que descarga el browser (filtraría el
  hostname interno de Docker).
- **`.env` vive en `Practica2IngWeb/`**, no en `src/`. Vite sólo lee del
  `envDir`, que por defecto es la raíz del proyecto; estuvo en `src/` y por eso
  `VITE_APP_API_URL` llegaba como `undefined`.
- **`node_modules` es un volumen con nombre** (`web_node_modules`), no el del
  host: los binarios nativos de rollup/esbuild del host son de otra plataforma
  y no corren dentro del contenedor Linux.
- **`USE_POLLING=true`** lo activa compose: los bind mounts desde macOS no
  generan eventos de archivo dentro de Linux y sin polling el HMR se congela.

## Decisiones de código que parecen raras pero no lo son

- `SecurityConfig` tiene `.requestMatchers("/error").permitAll()`. Sin eso, el
  ERROR dispatch de Spring Boot al resolver una excepción queda bloqueado y el
  cliente recibe **403 vacío** en lugar de su 4xx real (duplicados, validación).
  No quitarlo.
- `JWT_SECRET` está versionado a propósito (paridad con el compose anterior).
  Es una clave de desarrollo; no reutilizarla.
- El `docker-compose.yml` de `Practicas/` se borró: quedó sustituido por el de
  la raíz, que además añade el frontend.

## Huecos conocidos (no son bugs de configuración, faltan piezas)

- **No hay filtro JWT.** `SecurityConfig` nunca registra un filtro que use
  `JwtService`, así que los tokens se emiten pero no se validan;
  `anyRequest().authenticated()` los rechazará siempre. Falta el
  `JwtAuthenticationFilter` + `addFilterBefore`.
- **Credenciales incorrectas devuelven 403, no 401**: no hay
  `AuthenticationEntryPoint` configurado, así que `BadCredentialsException`
  cae en el entry point por defecto de Spring. El frontend no debe
  distinguir 401/403 en el login.
- El frontend sigue siendo el starter de Vite: `src/App.jsx` es la plantilla
  original. Las carpetas `src/pages`, `src/routes`, `src/store`,
  `src/layout`, `src/component` (ojo: en singular) y `src/assets/{css,logos}`
  están **vacías**; son el andamiaje previsto, no código existente.
- No hay router ni estado global instalados todavía (`react-router` y cualquier
  store no están en `package.json`).

## Git

- `Practicas/` **era un repo git propio** (remoto `Practica_web_1.git`, ya
  pusheado). Su `.git` se movió a un backup para que el backend entrara como
  archivos normales en este repo único. El historial del backend se perdió
  aquí; se puede recuperar del remoto antiguo.
- Este directorio cuelga de `/Users/famitry/Documents`, que es otro repo git
  con la rama `main` **sin ningún commit** y el índice lleno de borrados de
  otros proyectos. No hacer `git` desde ahí esperando nada útil: trabajar
  siempre dentro de `PWeb6to/`.
- `Practica2IngWeb/AGENTS.md` existe y cubre el frontend en detalle.