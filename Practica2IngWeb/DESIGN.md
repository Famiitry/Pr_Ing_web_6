# SHINRYŪ-KAI (診療会) — Sistema de diseño

> *診療* = diagnóstico · *療* = tratamiento · *会* = asociación/clan
> "La clínica como clan". El lenguaje visual del yakuza (極道) aplicado a un
> sistema veterinario: tinta, vermellón de sello, pan de oro y la estética del
> tattoo — pero con la disciplina de un sistema, no de un disfraz.

---

## 1. Fundamento

El yakuza se rebela contra el vestir blandito de oficina: negro duro, rojo de
sello, oro, diagonales de cuchilla, tipografía de cartel. Ese vocabulario
funciona en veterinaria porque las dos cosas comparten un motivo: **el sello
como identidad y el juramento como vínculo**. Un clan y una clínica son lo
mismo visto desde dos lados.

Qué se toma:

| Se toma | Por qué | Se usa en |
| --- | --- | --- |
| Sumi (墨) negro plano | El contraste máximo, sin suavizado | fondo, paneles |
| 朱 (shu) vermellón | Tinta de sello, el color de la autoridad | acción primaria, error |
| 金 (kin) pan de oro | rango, status: "esto vale algo" | acentos, token, roles |
| TACHI (立ち) perfil de cuchilla | Tensión direccional, no simétrica | esquinas recortadas |
| 落款 (rakkan) sello de tinta | La marca de que algo está firmado | badges de rol, confirmación |
| Asanoha · ichimatsu · raimon | Textura japonesa, no «estilo oriental» | fondos con 3–5 % de opacidad |

Qué **no** se toma, y por qué:

- **Svástika 卍**: aunque tiene un uso budista histórico, es un símbolo
  repulsivo en el imaginario europeo post-1945 y no aporta nada aquí. En su
  lugar: **raimon** (雷紋), **asanoha** (麻の葉) o **ichimatsu** (市松), que
  dan la misma textura tradicional sin el problema.
- **Samurái, apego a armas, sahumerio**: cliché de plantilla. Si un asset
  necesita un sable para entenderse, es que el asset está mal.
- **Ninguna «textura de papel viejo» marrón.** El papel es 生成, blanco
  crudo, no beige Nostalgia.

---

## 2. Qué tiene que resolver el diseño

Esto no es un sistema genérico: la superficie real son **dos endpoints**.

```
POST /api/auth/register   → 201  {token, tokenType:"Bearer", id, nombre, email, role}
POST /api/auth/login      → 200  {token, tokenType:"Bearer", id, nombre, email, role}
```

`RegisterRequest`: `nombre` (2–50), `apellido`?, `email` (único),
`password` (≥6), `telefono`?, `role`? (`CLIENTE` | `VETERINARIO` | `ADMIN`,
default `CLIENTE`).
`Role`: `CLIENTE`, `VETERINARIO`, `ADMIN`.

### 2.1 Cobertura: cada endpoint tiene que quedar servido

Un endpoint sin pantalla es un endpoint que no existe para el usuario. Esta
tabla es la lista de verificación del sistema: si una fila no tiene pantalla
diseñada, el sistema está incompleto.

| # | Endpoint | Pantalla | Estados que hay que diseñar | Notas |
| --- | --- | --- | --- | --- |
| E1 | `POST /api/auth/register` | `RegisterScreen` | vacío · foco · error de campo · cargando · 201 · 400 · red | 6 campos + selector de rol opcional |
| E2 | `POST /api/auth/login` | `LoginScreen` | vacío · foco · error de campo · cargando · 200 · 403 · red | 2 campos, el 403 **no** es 401 |
| E3 | sesión (JWT en memoria, sin endpoint) | `AuthedShell` | cargando sesión · autenticado · expirado | el `role` sale del `AuthResponse` |
| E4 | rutas protegidas (aún no existen) | `AuthedShell` + `Panel` | 403 sin token → fuera | Ver §2.4 |

`RegisterScreen` y `LoginScreen` comparten un `AuthLayout`: panel de marca a la
izquierda (kanji vertical, textura asanoha), formulario a la derecha, ancho
total `min(1120px, 92vw)`. El enlace entre ambas va en el pie del formulario,
nunca en un navbar: en un formulario de un solo propósito, la navegación compite
con el CTA.

### 2.2 Tres superficies autenticadas, no una

El `AuthResponse` trae `role`, así que el sistema tiene que comportarse distinto
según él. No es decoración: es lo que la API permite hacer hoy.

| Role | Kanji | Navegación del shell | Panel inicial |
| --- | --- | --- | --- |
| `CLIENTE` | 客 | Panel · Mis datos · Citas | Datos de la cuenta + `TokenStrip` |
| `VETERINARIO` | 獣 | Panel · Agenda · Pacientes · Mis datos | Agenda del día |
| `ADMIN` | 総 | Panel · Usuarios · Configuración · Mis datos | Métricas del sistema |

Todos los roles ven «Mis datos». La diferencia es **cuántos items de navegación
y qué panel abre**, no un layout distinto: el shell es el mismo y se le pasa el
rol. Es la única forma de que añadir un rol después no rompa nada.

### 2.3 Estados que ninguna pantalla puede saltarse

Cada pantalla con datos pasa por los cinco, siempre:

`vacío` → `cargando` → `con datos` → `error` → `reintentar`

`error` y `reintento` no son opcionales. La API puede caerse (ver §2.4), y una
pantalla que sólo sabe mostrar datos es una pantalla rota.

### 2.4 Lo que el backend todavía no sirve (y el diseño debe tolerar)

- **No hay filtro JWT.** `SecurityConfig` no registra ningún filtro con
  `JwtService`, así que `anyRequest().authenticated()` rechaza el token. Hoy
  no hay rutas protegidas y nada se nota; en cuanto haya una, el `AuthedShell`
  tiene que reaccionar a ese 403 y **expulsar a `LoginScreen`**, no mostrar un
  error.
- **No hay endpoint de «yo».** El perfil sale del `AuthResponse` del login y
  vive en memoria: recargar la página pierde la sesión. El diseño asume sesión
  en memoria; no se dibuja un «estado de carga de perfil» que no existe.

### La restricción que define todo el sistema

**La API no devuelve mensajes ni errores por campo.** El body de error es
literalmente:

```json
{"timestamp":"2026-10-05T21:01:54Z","status":400,"error":"Bad Request","path":"/api/auth/register"}
```

Verificado contra el backend en ejecución. Consecuencias de diseño, no de
código:

1. **Todo el copy de error es del cliente**, en español, mapeado por status.
2. **El 400 es ambiguo**: «email duplicado» y «password de 3 letras» producen
   el mismo body. → El formulario tiene que **prevenir** los 400 con
   validación en cliente (reglas idénticas a las del DTO) en lugar de
   esperar la respuesta. El 400 que se escapa es un caso raro y se muestra
   como copy genérico, nunca como «el campo X está mal».
3. **Login con credenciales incorrectas devuelve `403`, no `401`** (no hay
   `AuthenticationEntryPoint`). El copy no puede decir «401» ni el front puede
   ramificar por él.
4. `axios` tiene `timeout: 15000`. El estado de carga tiene que aguantar 15 s
   sin fingir progreso, y el fallo de red merece copy propio: «El servidor no
   responde» ≠ «credenciales incorrectas».

> Deuda de diseño pendiente: un `@ControllerAdvice` que devuelva
> `{field, message}[]` permitiría error por campo y un `401` real. Mientras no
> exista, la capa de validación del cliente es la **única** barrera de calidad
> de la copia.

---

## 3. Color (chroma)

**Default: modo claro «washi».** El modo oscuro «tinta» es opt-in vía
`[data-theme='tinta']`. Una gestión veterinaria se usa en salas luminosas
todo el día; un fondo negro cansa y dificulta juzgar color en fotos de
piel/pelo. La estética yakuza queda como *artesanía*: el sello 落款, el filete
de oro, la cuchilla en el botón primario — no como oscuridad.

La paleta es deliberadamente restrictiva: **un acento saturado (朱 vermellón),
un metal (金 oro) sólo como filete/sello, y verdes/índigos clínicos**.
Todo lo demás es neutro.

### Tokens — modo claro default (washi)

| Token | Hex | Uso |
| --- | --- | --- |
| `--sk-paper` | `#FAF8F3` | Fondo de página — 生成, papel crudo |
| `--sk-panel` | `#FFFFFF` | Tarjetas, paneles |
| `--sk-shade` | `#F1EEE6` | Filas alternas, zonas hundidas |
| `--sk-ink` | `#17150F` | Superficie oscura puntual (nav, footer) |
| `--sk-text` | `#17150F` | Texto principal (17.20 sobre paper) |
| `--sk-text-2` | `#4A443A` | Texto secundario (9.08) |
| `--sk-text-3` | `#6E675A` | Texto muted (5.28 — solo cuerpo grande/labels) |
| `--sk-text-inv` | `#FAF8F3` | Texto sobre --sk-ink |
| `--sk-hair` | `#E4DFD2` | Decorativo (1.33 — **no** marca controles) |
| `--sk-edge` | `#8C8578` | Con significado (3.66 sobre panel) |
| `--sk-shu` | `#B3272E` | **Único acento saturado**: acción primaria, error |
| `--sk-shu-hover` | `#8E1D23` | Primary hover (8.94 sobre panel) |
| `--sk-shu-soft` | `#F6DCDA` | Fondo de alerta/aviso |
| `--sk-on-shu` | `#FFFFFF` | Texto **sobre vermellón** (6.47) — **nunca invierte** |
| `--sk-kin` | `#A8821C` | Filete 1px (3.57 sobre panel) / sello |
| `--sk-kin-text` | `#6F5714` | Oro legible como texto (5.69 sobre kin-soft) |
| `--sk-kin-soft` | `#F3E9CC` | Fondo de sello / destacado |
| `--sk-ai` | `#245C86` | Enlaces, informativo (7.12) |
| `--sk-moegi` | `#4A6321` | Éxito / animal sano (5.72 sobre moegi-soft) |
| `--sk-moegi-soft` | `#E7EFD5` | Fondo de éxito |

### Tokens — modo oscuro opt-in (tinta)

| Token | Hex | Nota |
| --- | --- | --- |
| `--sk-paper` | `#0A0A0B` | Fondo (solo si usuario fuerza tema) |
| `--sk-panel` | `#131316` | Panel |
| `--sk-shade` | `#1C1C21` | Superficie hundida |
| `--sk-ink` | `#F4F1EA` | Texto principal (17.54) |
| `--sk-text` | `#F4F1EA` | Texto principal |
| `--sk-text-2` | `#B9B3A6` | Secundario (8.88) |
| `--sk-text-3` | `#837C6E` | Muted (4.78) |
| `--sk-hair` | `#2A2A31` | Decorativo |
| `--sk-edge` | `#6A6A75` | Con significado |
| `--sk-shu` | `#C1272D` | Vermellón (más vivo en oscuro) |
| `--sk-on-shu` | `#F4F1EA` | **Mismo token** — no invierte |
| `--sk-kin` | `#C9A227` | Oro vivo |
| `--sk-kin-text` | `#E8CC6B` | 12.52 sobre paper |
| `--sk-ai` | `#7FA8D6` | 7.99 |
| `--sk-moegi` | `#A8C25A` | 9.92 |

### Contrato de contraste (medido, no estimado)

Todas las cifras salen de la fórmula WCAG 2.1, verificadas con script.

| Par | Ratio | Veredicto |
| --- | --- | --- |
| `--sk-text` sobre `--sk-paper` | 17.20 | AAA |
| `--sk-text-2` sobre `--sk-paper` | 9.08 | AAA |
| `--sk-text-3` sobre `--sk-paper` | 5.28 | AA |
| `--sk-shu` sobre `--sk-paper` | 6.09 | AA (texto de error) |
| `--sk-on-shu` sobre `--sk-shu` | 6.47 | AA (**botón primario**) |
| `--sk-on-shu` sobre `--sk-shu-hover` | 8.94 | AAA |
| `--sk-ai` sobre `--sk-panel` | 7.12 | AAA |
| `--sk-moegi` sobre `--sk-moegi-soft` | 5.72 | AA |
| `--sk-kin-text` sobre `--sk-kin-soft` | 5.69 | AA |
| `--sk-edge` sobre `--sk-panel` | 3.66 | ≥3:1 (borde con significado) |
| `--sk-kin` filete sobre `--sk-panel` | 3.57 | ≥3:1 (sólo filete) |
| `--sk-kin-text` foco sobre `--sk-paper` | 6.49 | ≥3:1 |
| **oscuro** `--sk-text` sobre `--sk-paper` | 17.54 | AAA |
| **oscuro** `--sk-on-shu` sobre `--sk-shu` | 5.18 | AA |

### Reglas de croma (hard rules)

- **Un acento saturado por pantalla**: `--sk-shu`. Nunca dos rojos, nunca
  `--sk-shu` + `--sk-moegi` compitiendo.
- **Oro solo como filete (1px) o sello**. `--sk-kin` no es color de texto
  en modo claro (3.37 — falla). Usa `--sk-kin-text` sobre `--sk-kin-soft`.
- **`--sk-on-shu` no invierte**. Si lo haces, en modo claro el botón
  primario cae a 2.41:1.
- **Bordes que significan** (input, foco, estado) usan `--sk-edge` (3.66).
  `--sk-hair` (1.33) es decoración pura, nunca en controles interactivos.
- Sin degradados salvo `--sk-foil` (filete de oro) — máximo 2 por pantalla.
- Texto muted (`--sk-text-3`, 5.28) solo en labels grandes o ayuda;
  nunca en cuerpo de párrafo largo.

---

## 4. Tipografía
| `--sk-moegi-bg` | `#1E2A10` | Fondo de éxito |
| `--sk-washi` | `#F4F1EA` | Texto principal |

---

## 4. Tipografía

| Rol | Stack | Uso |
| --- | --- | --- |
| Display | `'Anton', 'Arial Black', sans-serif` | Títulos, botones, sellos. `uppercase`, `letter-spacing: -0.02em`, `line-height: 0.9` |
| Body | `'Inter', system-ui, sans-serif` | Todo el texto corrido |
| Mono | `'IBM Plex Mono', ui-monospace` | JWT, `id`, email — el token **parece** un token |
| Mincho | `'Shippori Mincho', 'Noto Serif JP', serif` | Kanji ornamentales, texto vertical |

Escala (base 16):

```
--sk-fs-display: clamp(2.5rem, 6vw, 4.5rem)   /* 凝 - títulos de clan */
--sk-fs-h1:      2rem
--sk-fs-h2:      1.5rem
--sk-fs-body:    1rem
--sk-fs-small:   0.875rem
--sk-fs-micro:   0.75rem    /* labels, en mayúsculas, tracking +0.08em */
```

- Display **siempre** `uppercase`. EsCartel, no documento.
- Nunca pesos que no existan en la fuente; Anton es 400 y punto.
- Texto en japonés: `writing-mode: vertical-rl` sólo como adorno en columnas
  laterales de ≥120 px, `max-height: 60vh`, `opacity: 0.5`.

---

## 5. Layout — desktop-first responsive

**No es mobile-first.** Es una aplicación de escritorio, se usa en laptop y
monitor, y el sistema se adapta **hacia arriba** con `min-width`. No existe
layout de teléfono, ni hamburger, ni patrón de bottom-nav. Escribe las queries
en `min-width`; una hoja de estilos con `max-width` aquí es un error de
concepto, no de estilo.

### 5.1 Rango soportado

| Rango | Viewport objetivo | Qué cambia |
| --- | --- | --- |
| Pantalla estrecha | `< 1024px` | **Fuera de rango.** No hay layout móvil: se muestra un aviso (§5.5) |
| Laptop | `1024–1439px` | Layout base. Grid de 12 col, contenedor `1120px` |
| Desktop | `1440–1679px` | Contenedor `1280px`, márgenes respirados |
| Wide | `1680–2199px` | Aparece la **tercera columna** del shell (rail de contexto) |
| Ultrawide | `≥ 2200px` | El grid se topa en `1600px`; la columna central se limita a `72ch` |

```css
:root { --sk-shell-max: 1120px; }
@media (min-width: 1440px) { :root { --sk-shell-max: 1280px; } }
@media (min-width: 1680px) { :root { --sk-shell-max: 1440px; } }
@media (min-width: 2200px) { :root { --sk-shell-max: 1600px; } }
```

Nunca `max-width` para *encoger*: en pantallas grandes el sistema **suma** una
columna, no encoge la que ya tiene.

### 5.2 Rejilla

12 columnas, `gap: 16px`, margen lateral `clamp(24px, 3vw, 56px)`.
Formularios de auth en una columna de `440px`, centrados en su panel.

### 5.3 El shell autenticado

```
┌──────────────────────────────────────────────────────────────────┐
│  TOPBAR  48px   SHINRYŪ-KAI ▸ panel     [Seal rol]  [nombre]  ⏻  │
├────────────┬───────────────────────────────────┬─────────────────┤
│            │                                   │                 │
│  NAVRAIL   │   PANEL (contenido)               │  RAIL CONTEXTO  │
│  232px     │   flexible                        │  320px          │
│            │                                   │  ≥1680px        │
│  Por rol   │   grid 12 col dentro              │  oculta < 1680  │
│            │                                   │                 │
├────────────┴───────────────────────────────────┴─────────────────┤
│  FOOTER  banda de foil de oro, 1px                                │
└──────────────────────────────────────────────────────────────────┘
```

- **`NavRail`**: ancho fijo, `border-right: 1px solid var(--sk-edge-strong)`.
  Cada item es un bloque rectangular con el kanji del módulo a la izquierda y
  el label en `--sk-font-display`. El item activo lleva una barra de oro de
  2 px a la izquierda — el «sello lateral». Nunca se colapsa a iconos: el
  espacio es de sobra y colapsar sólo añade estados que nadie pidió.
- **Rail de contexto**: `display: none` por debajo de 1680 px, `display: block`
  a partir de ahí. Es lo único que aparece al crecer. Lleva `TokenStrip`,
  resumen de rol y datos de la cuenta.
- **Panel**: `min-width: 0` en el contenedor flex, o el contenido desborda.
  En `≥ 1680px` pasa a ocupar 8 de las 12 columnas.

### 5.4 Layout de auth

```
┌───────────────────────────┬──────────────────────────────────┐
│                           │                                  │
│   PANEL DE MARCA          │   Formulario                     │
│   flex: 1                 │   ancho fijo 440px               │
│                           │   centrado vertical              │
│   診療会 vertical         │                                  │
│   asanoha 4 %             │   Field... Field...              │
│   filete de oro           │   [ Botón primario con cuchilla ]│
│                           │   enlace al otro formulario      │
└───────────────────────────┴──────────────────────────────────┘
```

El panel de marca **no se oculta** en laptop: es la mitad de la identidad del
sistema. Si someday hay que quita algo, se quita el rail de contexto, no esto.

### 5.5 Por debajo de 1024 px

No hay diseño móvil y no se va a inventar uno ahora. Lo honesto es decirlo en
la pantalla en vez de mostrar un formulario de 340 px con la tipografía de
cartel:

```css
@media (max-width: 1023px) {
  #root { display: grid; place-items: center; min-height: 100vh; }
  .sk-gate { display: grid; }   /* único bloque visible */
}
```

El aviso (`sk-gate`) es un `Panel` con el kanji, un texto de una línea
(«Esta pantalla está pensada para escritorio») y el ancho mínimo requerido.
Es una decisión de diseño, no un error: el sistema declara su rango.

### 5.6 Formas

- **Radios**: `0` en todo lo estructural, `999px` sólo en sellos circulares y
  el avatar. La rigidez rectangular es el look; los radios blandos lo matan.
- **Tachi (cuchilla)**: `clip-path: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)`
  en botones primarios y tarjetas de destaque. El corte va abajo a la derecha,
  siempre. Nunca en un input — estorba el cursor.
- **Foil de oro**: filete de 1–2 px con
  `linear-gradient(90deg, #8A6D1F, #E8CC6B 35%, #8A6D1F 70%, #E8CC6B)` para
  separar secciones de jerarquía alta. Máximo 2 por pantalla.
- **Textura**: asanoha o ichimatsu en SVG a `opacity: 0.04` detrás de paneles
  grandes. Nunca sobre texto pequeño.

---

## 6. Componentes

### 6.1 `Seal` (落款) — badge de rol

El componente de firma. Cada `Role` es un sello con tinta propia:

| Role | Kanji | Tinta | Fondo |
| --- | --- | --- | --- |
| `CLIENTE` | 客 | `--sk-kin` | `--sk-iro` |
| `VETERINARIO` | 獣 | `--sk-moegi` | `--sk-moegi-bg` |
| `ADMIN` | 総 | `--sk-shu` | `--sk-aka-bg` |

Cuadrado 28 px, `border-radius: 999px`, kanji centrado, glifo a la derecha en
`--sk-fs-micro` + tracking. El kanji **nunca** sustituye al texto: siempre
`aria-label` con el rol.

### 6.2 `Field` (input)

- Alto 48 px, fondo `--sk-iro`, `border: 1px solid var(--sk-edge-strong)`.
- Foco: `box-shadow: 0 0 0 3px var(--sk-ink), 0 0 0 5px var(--sk-kin-bright)`
  (doble anillo para separarse de cualquier fondo).
- Label arriba, `micro` en mayúsculas, `--sk-mochi`. El error va **debajo**,
  con icono, en `--sk-aka`, y el input pasa a `border-color: var(--sk-aka)`.
- El error **solo aparece tras blur o submit**, nunca mientras se escribe.

### 6.3 `Button`

- Primario: fondo `--sk-shu`, texto `--sk-on-shu` (5.18 ✓), clip de cuchilla,
  `font-display` uppercase. **El texto del botón nunca usa `--sk-washi`**:
  ese token invierte a oscuro en modo claro y ahí el ratio cae a 2.41.
- Secundario: fondo transparente, borde `--sk-edge-strong` 1px, texto `--sk-washi`.
- Carga: el label se sustituye por un indicador **no-spinner**: una barra de
  progreso de tinta (`scaleX`) con el texto en `--sk-mochi`. El estado de carga
  es un componente real, no un GIF. Tiene que aguantar los 15 s del timeout sin
  fingir avance.
- Foco: mismo doble anillo que `Field`.

### 6.4 `Alert` — el único componente que traduce HTTP a lenguaje

| Situación real | Status | Título | Cuerpo |
| --- | --- | --- | --- |
| `register` ok | 201 | 入会 — Bienvenido | Sellos con los datos del `AuthResponse` |
| `register` rechazado | 400 | 失敗 — No pudimos crear la cuenta | «Revisa los datos e inténtalo de nuevo.» Sin nombrar el campo. |
| `register` email duplicado | 400 | 失敗 — Correo en uso | Sólo si el cliente ya sabe que existe; si no, el 400 genérico. |
| `login` ok | 200 | 入場 — Sesión iniciada | `nombre` + `Seal` del rol |
| `login` credenciales malas | **403** | 拒否 — Credenciales incorrectas | «Revisa tu correo y tu contraseña.» |
| red / timeout / backend caído | — | 断 — El servidor no responde | «Inténtalo de nuevo en un momento.» + botón reintentar |

Reglas: icono + título + cuerpo, `role="alert"`. El `path` y el `timestamp`
**no se muestran al usuario** — se dejan en `console` para soporte. Nada de
códigos HTTP en la interfaz.

### 6.5 `TokenStrip`

El JWT en `--sk-font-mono`, `--sk-moegi`, 12 px, `word-break: break-all`,
sobre `--sk-moegi-bg`, con label `TOKEN (24 h)`. Es el objeto de valor de todo
el flujo: el diseño tiene que tratarlo como una **insignia**, no como texto de
debug. Botón copiar con confirmación de 2 s.

### 6.6 `Panel`

Fondo `--sk-sumigata`, borde 1 px `--sk-edge`, `border-radius: 0`.
Variante `.panel--sealed` con filete de oro superior y una cinta washi
translúcida en la esquina superior izquierda — se reserva para **una** por
pantalla: la confirmación de éxito.

### 6.7 `NavRail` — navegación por rol

Sólo en escritorio y sólo en `AuthedShell`. Es un componente **dirigido por
`role`**, no por un array de items libre: quien llama pasa el rol y la lista sale
de un mapa (§2.2). Así es imposible mostrarle «Usuarios» a un `CLIENTE`.

- Ancho fijo `232px`, `border-right: 1px solid var(--sk-edge-strong)`.
- Item: `display: grid; grid-template-columns: 28px 1fr; gap: 12px`, alto 40 px.
  Kanji del módulo en la primera columna (`--sk-font-jp`), label en
  `--sk-font-display` uppercase 13 px.
- Item activo: `border-left: 2px solid var(--sk-kin)` y texto `--sk-washi`.
  El resto, `--sk-mochi`. El estado activo **no** cambia el fondo: cambia la
  barra y el color del texto, para no gritar.
- Item de cierre de sesión al final, separado por un filete de oro de 1 px.

### 6.8 `ContextRail`

La tercera columna, `320px`, `display: none` por debajo de 1680 px. Contenido
en este orden: `Seal` del rol + `nombre` + `email` (del `AuthResponse`),
`TokenStrip`, y un bloque de "salir" con confirmación.

Aparece **al crecer la pantalla**, no al encoger. Es el único componente cuyo
existe/no existe depende del viewport.

### 6.9 `StateBlock` — vacío, cargando, error, reintento

Un solo componente para los cuatro estados no-afectivos, porque si cada
pantalla inventa el suyo el sistema se desincroniza en dos semanas.

| Variante | Contenido | Acción |
| --- | --- | --- |
| `empty` | kanji contextual + una línea de copy | el CTA de la pantalla |
| `loading` | barra de progreso de tinta, sin texto de «cargando» | ninguna |
| `error` | icono + `Alert` (§6.4) + `path`/status sólo en `console` | botón reintentar |
| `forbidden` | `Panel` con `Seal` de acceso denegado | volver a `LoginScreen` |

`forbidden` existe por §2.4: cuando se añada el filtro JWT y devuelva 403 sin
token, el shell expulsa en vez de mostrar un error genérico.

---

## 7. Movimiento

- `ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`, duraciones 120 ms (estado),
  240 ms (entrada), 400 ms (sello).
- Los sellos entran con un **golpe**: `scale(1.6) → scale(1)` en 400 ms, con
  `opacity 0 → 1`. Nada de fade genérico para lo que es un objeto físico.
- `@media (prefers-reduced-motion: reduce)` → `animation: none !important;
  transition-duration: 1ms !important`. El sello aparece sin golpe, pero
  aparece.

---

## 8. Accesibilidad

- Todo texto ≥4.5:1; bordes con significado ≥3:1. Cifras medidas arriba.
- El kanji del `Seal` es decorativo: `aria-hidden` en el glifo, el texto del
  rol siempre presente.
- Foco visible en todos los interactivos, nunca `outline: none` sin
  reemplazo.
- Los estados de error se anuncian (`role="alert"`), no sólo se pintan.
- Orden de tabulación = orden visual, siempre.
- **Reflow**: como no hay diseño bajo 1024 px, WCAG 1.4.10 no aplica, pero sí
  1.4.4 — el texto debe subir al 200 % sin perder contenido ni cortarse. El
  layout de escritorio aguanta zooming; el `--sk-shell-max` en `px` y las
  columnas del shell se mueven antes de que el texto se pise.
- Sin scroll horizontal en 1024 px. Si un panel necesita scroll lateral, es que
  `--sk-shell-max` está mal puesto.

---

## 9. Prohibido

### Estilo

- Texto oscuro sobre vermellón (`#14100C` en `#C1272D` = 3.24, falla).
- `--sk-ai` oscuro (`#2E5C8A`) como texto: 2.84.
- Oro `#8A6D1F` como texto sobre tinta (4.04) o sobre papel (3.97).
- Bordes de 1 px `--sk-edge` para marcar un control interactivo (1.39, invisible).
- Radios >2 px en paneles, botones o inputs.
- Emoji como icono de estado.
- Mostrar `400` / `403` / `path` / `timestamp` en pantalla.
- Radial gradients, glassmorphism, sombras difusas. La profundidad viene del
  borde, no del blur.
- Svástika en cualquier forma.

### Responsive

- **Media queries en `max-width`.** El sistema es desktop-first: se escribe en
  `min-width` y **crece** sumando la columna de contexto. Encoger es lo que
  rompe el shell.
- **Layout móvil**: hamburger, bottom-nav, drawer, `100vw` para el ancho de un
  panel, `flex-wrap` en la navegación. No existen y no se añaden.
- Colapsar el `NavRail` a iconos. Hay espacio de sobra; colapsar sólo genera
  estados que nadie pidió.
- Ocultar el panel de marca de `AuthLayout` para «ganar espacio». Si hay que
  quitar algo, se quita el rail de contexto.
- Un segundo patrón de breakpoints. Si hace falta ajustar a 1366 px, se ajusta
  `--sk-shell-max`, no se abre una media query nueva.

### Sistema

- Un endpoint sin pantalla diseñada (§2.1) ni un rol sin fila en el mapa de
  navegación (§2.2).
- Colores, radios o sombras fuera de los tokens de §10.

---

## 10. Esqueleto — archivos listos para usar

El sistema no es solo un PDF: los archivos existen y compilan.

```
src/assets/css/
├── tokens.css   # variables CSS (§3) — light default + [data-theme='tinta']
└── base.css     # reset, tipografía, primitivas (.sk-*)
src/index.css    # importa ambos arriba; mantiene estilos starter por compatibilidad
```

**`tokens.css`** — fuente de verdad del color/tipo/espacio/layout. Light default,
`[data-theme='tinta']` opt-in. No añadas colores aquí.

**`base.css`** — primitivas listas:
| Clase | Qué hace | § ref |
|---|---|---|
| `.sk-shell` | `min-height:100vh`, fondo paper | 5.1 |
| `.sk-container` | `max-width: var(--sk-shell-max)`, márgenes fluidos | 5.2 |
| `.sk-panel` | panel blanco, borde hairline, radio 0 | 6.6 |
| `.sk-panel--sealed` | + filete de oro arriba (1 sola por pantalla) | 6.6 |
| `.sk-field` / `__input` / `--invalid` / `__error` | input 44px, estados | 6.2 |
| `.sk-btn` / `--primary` / `--ghost` / `[disabled]` | 44px, clip cuchilla, loading | 6.3 |
| `.sk-alert` / `--error` / `--ok` | traductor HTTP → español | 6.4 |
| `.sk-token` | JWT mono, word-break, label «TOKEN (24h)» | 6.5 |
| `.sk-seal` | sello circular 28px, kanji del rol | 6.1 |
| `.sk-gate` | aviso «pantalla para escritorio» <1024px | 5.5 |
| `.sk-label` / `.sk-prose` / `.sk-mono` / `.sk-jp` | utilidades de texto | 4 |

**`index.css`** — importa `tokens.css` + `base.css` **antes** de cualquier regla.
El starter de Vite sigue ahí por compatibilidad; se borrará al implementar
`LoginScreen` / `RegisterScreen` / `AuthedShell`.

### Cómo activar modo tinta (opt-in)

```js
// en el entry point (main.jsx) o donde decidas la preferencia
document.documentElement.dataset.theme = 'tinta';
```

No uses `prefers-color-scheme`: una clínica no cambia de tema sola.

---

## 11. Export de tokens (referencia rápida)

Los tokens canónicos están en `src/assets/css/tokens.css`. Aquí la tabla
resumida para copiar/pegar si hace falta fuera del repo.

```css
:root {
  /* superficies */
  --sk-paper: #faf8f3;
  --sk-panel: #ffffff;
  --sk-shade: #f1eee6;
  --sk-ink: #17150f;

  /* texto */
  --sk-text: #17150f;
  --sk-text-2: #4a443a;
  --sk-text-3: #6e675a;
  --sk-text-inv: #faf8f3;

  /* bordes */
  --sk-hair: #e4dfd2;
  --sk-edge: #8c8578;

  /* vermellón 朱 */
  --sk-shu: #b3272e;
  --sk-shu-hover: #8e1d23;
  --sk-shu-soft: #f6dcda;
  --sk-on-shu: #ffffff;        /* nunca invierte */

  /* oro 金 */
  --sk-kin: #a8821c;           /* filete/sello */
  --sk-kin-text: #6f5714;      /* legible */
  --sk-kin-soft: #f3e9cc;

  /* apoyos */
  --sk-ai: #245c86;
  --sk-moegi: #4a6321;
  --sk-moegi-soft: #e7efd5;

  /* tipografía */
  --sk-font-display: 'Anton', 'Arial Black', sans-serif;
  --sk-font-body: 'Inter', system-ui, sans-serif;
  --sk-font-mono: 'IBM Plex Mono', ui-monospace, monospace;
  --sk-font-jp: 'Shippori Mincho', 'Noto Serif JP', serif;

  /* espacio */
  --sk-s1: 4px; --sk-s2: 8px; --sk-s3: 12px; --sk-s4: 16px;
  --sk-s6: 24px; --sk-s8: 32px; --sk-s12: 48px; --sk-s16: 64px;

  /* forma */
  --sk-radius: 0;
  --sk-radius-seal: 999px;
  --sk-blade: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
  --sk-hairline: 1px solid var(--sk-hair);
  --sk-foil: linear-gradient(90deg, #a8821c, #d9bd6a 40%, #a8821c);

  /* layout */
  --sk-shell-max: 1120px;
  --sk-navrail-w: 232px;
  --sk-rail-w: 320px;
  --sk-topbar-h: 48px;
  --sk-form-w: 440px;
  --sk-reading: 68ch;

  /* estado */
  --sk-focus: 0 0 0 2px var(--sk-paper), 0 0 0 4px var(--sk-kin-text);
  --sk-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --sk-dur: 160ms;
}

/* breakpoints: crece hacia arriba, min-width (§5.1) */
@media (min-width: 1440px) { :root { --sk-shell-max: 1280px; } }
@media (min-width: 1680px) { :root { --sk-shell-max: 1440px; } }
@media (min-width: 2200px) { :root { --sk-shell-max: 1600px; } }

/* modo tinta: opt-in via [data-theme='tinta'] */
[data-theme='tinta'] {
  --sk-paper: #0a0a0b;
  --sk-panel: #131316;
  --sk-shade: #1c1c21;
  --sk-ink: #f4f1ea;
  --sk-text: #f4f1ea;
  --sk-text-2: #b9b3a6;
  --sk-text-3: #837c6e;
  --sk-text-inv: #0a0a0b;
  --sk-hair: #2a2a31;
  --sk-edge: #6a6a75;
  --sk-shu: #c1272d;
  --sk-shu-hover: #a81f24;
  --sk-shu-soft: #3a0e10;
  --sk-on-shu: #f4f1ea;
  --sk-kin: #c9a227;
  --sk-kin-text: #e8cc6b;
  --sk-kin-soft: #241d0d;
  --sk-ai: #7fa8d6;
  --sk-moegi: #a8c25a;
  --sk-moegi-soft: #1e2a10;
  --sk-focus: 0 0 0 2px var(--sk-paper), 0 0 0 4px var(--sk-kin-text);
}
```

---

## 12. Cablearlo en este repo

- `src/assets/css/tokens.css` — **ya existe** con todos los tokens de §11.
  Las media queries de `--sk-shell-max` van **fuera** del bloque
  `[data-theme='tinta']`: no tienen nada que ver con el tema.
- `src/assets/css/base.css` — **ya existe** con las primitivas `.sk-*` (§10).
- `src/index.css` — **ya importa** `tokens.css` + `base.css` arriba.
- `src/component/` — un componente por archivo. Ojo: la carpeta está en
  **singular** (`component`), no `components`. No hay `src/components`.
- `src/pages/` — `Login.jsx`, `Register.jsx`, `Authenticated.jsx` (o donde
  caiga el router cuando exista). Los nombres de §2.1 son los canónicos.
- `src/layout/` — `AuthLayout.jsx` (panel de marca + formulario) y
  `AuthedShell.jsx` (topbar + `NavRail` + panel + `ContextRail`). Es la carpeta
  que existe para esto y está vacía.
- `src/api/axios.js` — no lo modifiques para el sistema visual, pero es donde
  vive el `timeout: 15000` que el `Button` de carga tiene que respetar.
- `react-refresh/only-export-components` está activo: un componente no puede
  exportar también constantes. Si `Seal` necesita su mapa de roles, va en otro
  archivo (p. ej. `src/component/seal-roles.js`). El mapa de navegación por rol
  de `NavRail` también va aparte, por el mismo motivo.

### Orden de implementación sugerido

Cada paso deja la app usable; no se avanza al siguiente con el anterior a medias.

1. `tokens.css` + `base.css` + `index.css` — el gamut, primitivas y breakpoints.
   Nada visual funciona sin esto.
2. `Field` + `Button` + `sk-gate` — con esto ya se cumple el requisito de no
   ser móvil y tener ancho de formulario.
3. `LoginScreen` (**E2**) completa, con su `AuthLayout`. Es el flujo más corto
   de todo el sistema y el que valida el 403 de verdad.
4. `Alert` con la matriz de §6.4 + `StateBlock` — es donde el diseño se gana o
   se pierde. Entrar aquí, no antes.
5. `RegisterScreen` (**E1**) con validación de cliente idéntica al DTO, que es
   lo que evita el 400 (§2.1).
6. `Seal` + `TokenStrip` + `panel--sealed` — la confirmación de éxito.
7. `AuthedShell` + `NavRail` + `ContextRail` — sólo cuando haya login
   persistente; hoy la sesión se pierde al recargar (§2.4).
8. Textura de fondo y cinta washi — último, y sólo en `panel--sealed`.

### Checklist de cobertura

Antes de dar el sistema por terminado, cada fila debe poder responderse con un
sí:

- [ ] ¿Existe pantalla para **E1** y **E2**? (§2.1)
- [ ] ¿Cada pantalla tiene sus 5 estados, incluido `error` y `reintentar`? (§2.3)
- [ ] ¿`CLIENTE`, `VETERINARIO` y `ADMIN` ven cada uno su fila del §2.2?
- [ ] ¿Ningún copy de error menciona un status HTTP? (§6.4)
- [ ] ¿El layout crece con `min-width` y no tiene ni un `max-width` de diseño?
- [ ] ¿Por debajo de 1024 px se ve `sk-gate` en vez de un formulario roto?
- [ ] ¿Todos los colores vienen de los tokens? (§9)

---

## Nota sobre Stitch

Este documento es la fuente de verdad. Si se sube a Stitch
(`stitch_upload_design_md`), el `customColor` debe ser `--sk-shu` `#c1272d`,
el headline `ANTON`, el body `INTER`, y el label `IBM_PLEX_MONO`, con
`colorMode` DARK y `roundness` `ROUND_FOUR`.