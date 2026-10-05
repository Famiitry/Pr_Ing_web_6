# Práctica 2 – Ingeniería Web

API de autenticación (Spring Boot) + frontend (React + Vite) para un sistema
veterinario, orquestados en un único `docker compose`.

## Levantar todo

```bash
docker compose up --build
```

| Servicio | URL | Notas |
| --- | --- | --- |
| Frontend | http://localhost:5173 | Vite dev server con HMR |
| API | http://localhost:8081/api/auth | `POST /register`, `POST /login` |
| PostgreSQL | `localhost:5433` | puerto interno 5432 |

Para parar: `docker compose down`. Para borrar también los datos:
`docker compose down -v`.

## Estructura

```
.
├── docker-compose.yml   # los 3 servicios
├── Practica2IngWeb/     # frontend React 19 + Vite 8 (bun)
└── Practicas/           # API Spring Boot 3.3 / Java 17 (Maven)
```

## Cómo funciona el proxy

El navegador y la API quedan en **el mismo origen**, así que no hace falta CORS
ni cambiar URLs entre entornos:

```
navegador ──http://localhost:5173/api/auth/login──▶ Vite (proxy)
                                                    └─▶ auth-service:8081
```

- `Practica2IngWeb/.env` → `VITE_APP_API_URL=/api` (relativa).
- `Practica2IngWeb/vite.config.js` define el proxy de `/api`.
- El destino se lee de `process.env.PROXY_TARGET`:
  - **Docker**: `http://auth-service:8081` (lo pone `docker-compose.yml`).
  - **Local**: default `http://localhost:8081`.

> `PROXY_TARGET` y `USE_POLLING` no llevan prefijo `VITE_` a propósito: con
> prefijo, Vite las inyecta en el bundle que se descarga el navegador.

## Desarrollo

El código del frontend está montado en el contenedor, así que se edita en el
host y se ve al instante en http://localhost:5173.

```bash
docker compose logs -f web          # logs del frontend
docker compose logs -f auth-service # logs de la API
docker compose restart auth-service # reiniciar sólo el backend tras recompilar
```

### Frontend sin Docker

Útil para iterar rápido sin reconstruir la API:

```bash
cd Practica2IngWeb
bun install
bun run dev     # http://localhost:5173, proxy -> localhost:8081
```

Requiere la API corriendo aparte: `cd Practicas && bash mvnw spring-boot:run`.

### API sin Docker

`mvnw` no tiene permiso de ejecución en el repo, hay que invocarlo con `bash`:

```bash
cd Practicas
bash mvnw spring-boot:run
```

Configuración por variables de entorno, con defaults en
`src/main/resources/application.properties`:

| Variable | Default |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/veterinaria_auth_db` |
| `DB_USERNAME` / `DB_PASSWORD` | `postgres` / `postgres` |
| `JWT_SECRET` | clave HMAC-SHA256 de desarrollo (hex) |
| `JWT_EXPIRATION` | `86400000` (24 h) |

Ojo: el `default` de `DB_URL` apunta a `5432`, pero el `db` de docker-compose
publica `5433` en el host. Fuera de Docker hay que exportarlo a mano:

```bash
DB_URL=jdbc:postgresql://localhost:5433/veterinaria_auth_db bash mvnw spring-boot:run
```

El esquema se genera sola (`ddl-auto=update`): no hay migraciones.

## Tests y lint

```bash
cd Practica2IngWeb && bun run lint     # ESLint 10 (sin reglas de estilo)
cd Practica2IngWeb && bun run build    # build de producción -> dist/
cd Practicas      && bash mvnw test    # requiere Postgres en localhost:5432
```

El único test del backend es `PracticasApplicationTests` (`@SpringBootTest`), así
que **falla si no hay base de datos reachable** en el `default` de `DB_URL`.

## Notas

- `JWT_SECRET` está versionado y es solo para desarrollo. No reutilizarlo.
- No hay filtro que valide el JWT: `SecurityConfig` no registra ningún filtro
  con `JwtService`, así que los tokens se emiten pero no se comprueban.
- Credenciales incorrectas devuelven `403` y no `401` (no hay
  `AuthenticationEntryPoint` configurado, cae en el de Spring por defecto).