# SHINRYŪ-KAI (診療会) — Sistema de diseño

> *診療* = diagnóstico · *療* = tratamiento · *会* = asociación
> "La clínica como un jardín" (庭). Un lenguaje visual japonés **sereno**: papel
> washi, tinta sumi suave, verde matcha y un hilo cálido de kinari. La calma de
> una sala de espera con luz de mañana, no la tensión de un despacho.

---

## 1. Fundamento

El sistema parte de tres ideas japonesas y las convierte en reglas, no en
decoración:

| Idea | Qué significa | Cómo se ve |
| --- | --- | --- |
| **間 (ma)** | El vacío con intención: el espacio entre cosas es contenido | Márgenes generosos, paneles que respiran, nada pegado |
| **侘寂 (wabi-sabi)** | Belleza de lo natural y lo sobrio, sin brillo | Colores apagados, sin degradados, sin sombras duras |
| **静 (sei)** | Quietud: el movimiento no distrae | Transiciones suaves, un solo acento de color |

El jardín japonés no compite consigo mismo: cada elemento tiene su lugar y el
ojo descansa. Eso es exactamente lo que necesita una clínica veterinaria, donde
la información es mucha y quien la usa ya está cansado.

Qué se toma:

| Se toma | Por qué | Se usa en |
| --- | --- | --- |
| **生成 (washi)** papel crudo | El blanco cálido descansa la vista horas | fondo de página |
| **墨 (sumi)** tinta aguada | Contraste suficiente sin negro puro | texto, paneles oscuros |
| **抹茶 (matcha)** verde | Un único acento orgánico, sereno | acción primaria, éxito |
| **紅 (beni)** rojo suave | Aviso con calidez, no alarma | error, peligro |
| **生成 (kinari)** beige dorado | Hilo fino de rango, sin ostentación | filete, sello |
| 麻の葉 · 市松 · 雷紋 | Textura japonesa, nunca "estilo oriental" | fondos al 4 % de opacidad |
| **落款 (rakkan)** | La marca de que algo está firmado | sellos de rol y confirmación |

Qué **no** se toma, y por qué:

- **Negro puro, rojo saturado, oro brillante**: era el vocabulario del diseño
  anterior (yakuza). Se descarta entero: cansa y tensa. Aquí el contraste se
  logra con sumi aguado y el acento es matcha, no vermellón.
- **Samurái, katanas, cuchillas, dragones**: cliché de plantilla. Si un asset
  necesita una espada para entenderse, el asset está mal.
- **Svástika 卍** en cualquier forma.
- **Estética "wibu"**: kanji decorativo mal usado, kawaii forzado, neón. El
  japonés aquí es *artesanía callada*, no disfraz.

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
tabla es la lista de verificación del sistema.

| # | Endpoint | Pantalla | Estados que hay que diseñar | Notas |
| --- | --- | --- | --- | --- |
| E1 | `POST /api/auth/register` | `RegisterScreen` | vacío · foco · error de campo · cargando · 201 · 400 · red | 6 campos + selector de rol opcional |
| E2 | `POST /api/auth/login` | `LoginScreen` | vacío · foco · error de campo · cargando · 200 · 403 · red | 2 campos, el 403 **no** es 401 |
| E3 | sesión (JWT en memoria, sin endpoint) | `AuthedShell` | cargando sesión · autenticado · expirado | el `role` sale del `AuthResponse` |
| E4 | rutas protegidas (aún no existen) | `AuthedShell` + `Panel` | 403 sin token → fuera | Ver §2.4 |

`RegisterScreen` y `LoginScreen` comparten un `AuthLayout`: panel de marca a la
izquierda (kanji vertical, textura asanoha), formulario a la derecha, ancho
total `min(1120px, 92vw)`. El enlace entre ambas va en el pie del formulario,
nunca en un navbar.

### 2.2 Tres superficies autenticadas, no una

El `AuthResponse` trae `role`, así que el sistema tiene que comportarse distinto
según él.

| Role | Kanji | Navegación del shell | Panel inicial |
| --- | --- | --- | --- |
| `CLIENTE` | 客 | Panel · Mis datos · Citas | Datos de la cuenta + `TokenStrip` |
| `VETERINARIO` | 獣 | Panel · Agenda · Pacientes · Mis datos | Agenda del día |
| `ADMIN` | 総 | Panel · Usuarios · Configuración · Mis datos | Métricas del sistema |

Todos los roles ven «Mis datos». La diferencia es **cuántos items de navegación
y qué panel abre**, no un layout distinto: el shell es el mismo y se le pasa el
rol. Así, añadir un rol después no rompe nada.

### 2.3 Estados que ninguna pantalla puede saltarse

Cada pantalla con datos pasa por los cinco, siempre:

`vacío` → `cargando` → `con datos` → `error` → `reintentar`

`error` y `reintento` no son opcionales. La API puede caerse (§2.4), y una
pantalla que sólo sabe mostrar datos es una pantalla rota.

### 2.4 Lo que el backend todavía no sirve (y el diseño debe tolerar)

- **No hay filtro JWT.** `SecurityConfig` no registra ningún filtro con
  `JwtService`, así que `anyRequest().authenticated()` rechaza el token. Hoy no
  hay rutas protegidas y nada se nota; en cuanto haya una, el `AuthedShell` tiene
  que reaccionar a ese 403 y **expulsar a `LoginScreen`**, no mostrar un error.
- **No hay endpoint de «yo».** El perfil sale del `AuthResponse` del login y vive
  en memoria: recargar la página pierde la sesión. El diseño asume sesión en
  memoria; no se dibuja un «estado de carga de perfil» que no existe.

### La restricción que define todo el sistema

**La API no devuelve mensajes ni errores por campo.** El body de error es
literalmente:

```json
{"timestamp":"2026-10-05T21:01:54Z","status":400,"error":"Bad Request","path":"/api/auth/register"}
```

Consecuencias de diseño, no de código:

1. **Todo el copy de error es del cliente**, en español, mapeado por status.
2. **El 400 es ambiguo**: «email duplicado» y «password de 3 letras» producen el
   mismo body. → El formulario **prevenir** los 400 con validación en cliente
   (reglas idénticas a las del DTO). El 400 que se escapa se muestra como copy
   genérico, nunca como «el campo X está mal».
3. **Login con credenciales incorrectas devuelve `403`, no `401`** (no hay
   `AuthenticationEntryPoint`). El copy no puede decir «401» ni el front puede
   ramificar por él.
4. `axios` tiene `timeout: 15000`. El estado de carga tiene que aguantar 15 s sin
   fingir progreso, y el fallo de red merece copy propio: «El servidor no
   responde» ≠ «credenciales incorrectas».

> Deuda de diseño pendiente: un `@ControllerAdvice` que devuelva
> `{field, message}[]` permitiría error por campo y un `401` real. Mientras no
> exista, la validación del cliente es la **única** barrera de calidad de la copia.

---

## 3. Color (chroma)

**Default: modo claro «washi».** El modo oscuro «yoru» (夜) es opt-in vía
`[data-theme='yoru']`. Una gestión veterinaria se usa en salas luminosas todo el
día; un fondo negro cansa. La calma japonesa queda como *artesanía*: el sello
落款, el hilo de kinari, el verde matcha del botón — no como oscuridad.

La paleta es deliberadamente restrictiva: **un acento sereno (抹茶 matcha), un
rojo suave para error (紅 beni), un beige cálido como hilo (生成 kinari), y un
azul índigo para enlaces (藍 ai)**. Todo lo demás es neutro cálido.

### Tokens — modo claro default (washi)

| Token | Hex | Uso |
| --- | --- | --- |
| `--sk-paper` | `#F6F4EC` | Fondo de página — washi, papel crudo |
| `--sk-panel` | `#FFFFFF` | Tarjetas, paneles |
| `--sk-shade` | `#ECE8DC` | Filas alternas, zonas hundidas |
| `--sk-ink` | `#2C3129` | Superficie oscura puntual (nav, footer) |
| `--sk-text` | `#2C3129` | Texto principal (12.08 sobre paper) |
| `--sk-text-2` | `#565C51` | Texto secundario (6.26) |
| `--sk-text-3` | `#6C7266` | Texto muted (4.50 — solo cuerpo grande/labels) |
| `--sk-text-inv` | `#F6F4EC` | Texto sobre `--sk-ink` |
| `--sk-hair` | `#E2DED0` | Decorativo (1.2 — **no** marca controles) |
| `--sk-edge` | `#7E8474` | Con significado (3.86 sobre panel) |
| `--sk-matcha` | `#47694E` | **Único acento de acción**: primario, éxito |
| `--sk-matcha-hover` | `#3A5740` | Primary hover (8.02 sobre panel) |
| `--sk-matcha-soft` | `#E3EDE2` | Fondo de éxito (5.14 con matcha) |
| `--sk-on-matcha` | `#FFFFFF` | Texto **sobre matcha** (6.18) |
| `--sk-beni` | `#9E4A47` | Error / peligro (5.41 sobre paper) |
| `--sk-beni-hover` | `#833D3A` | Error hover |
| `--sk-beni-soft` | `#F6E3E1` | Fondo de error (4.82 con beni) |
| `--sk-on-beni` | `#FFFFFF` | Texto sobre beni (5.96) |
| `--sk-kinari` | `#A98A46` | Hilo 1px / sello (3.28 sobre panel) |
| `--sk-kinari-text` | `#6E5828` | Legible como texto (5.67 sobre kinari-soft) |
| `--sk-kinari-soft` | `#F2EAD6` | Fondo de sello / destacado |
| `--sk-ai` | `#3C5C78` | Enlaces, informativo (7.01 sobre panel) |
| `--sk-ai-soft` | `#E4ECF3` | Fondo informativo |
| `--sk-sakura` | `#C97F8C` | Acento **decorativo**, nunca texto de acción |
| `--sk-sakura-soft` | `#F7E7E9` | Fondo decorativo suave |

### Tokens — modo oscuro opt-in (yoru)

| Token | Hex | Nota |
| --- | --- | --- |
| `--sk-paper` | `#12140F` | Fondo (solo si el usuario fuerza el tema) |
| `--sk-panel` | `#1B1E17` | Panel |
| `--sk-shade` | `#24281E` | Superficie hundida |
| `--sk-text` | `#EDEAE0` | Texto principal (15.40) |
| `--sk-text-2` | `#B7BCAF` | Secundario (9.56) |
| `--sk-text-3` | `#8C9285` | Muted (5.80) |
| `--sk-hair` | `#2C3026` | Decorativo |
| `--sk-edge` | `#6A7061` | Con significado (3.30) |
| `--sk-matcha` | `#9CC4A3` | Matcha claro (9.57 sobre paper) |
| `--sk-on-matcha` | `#12140F` | **Invierte en yoru** |
| `--sk-beni` | `#E2A09C` | Beni claro (8.60) |
| `--sk-ai` | `#9DBDD8` | Índigo claro (9.45) |
| `--sk-kinari` | `#C9A968` | Hilo cálido |
| `--sk-kinari-text` | `#E8CF8F` | Legible sobre kinari-soft oscuro |

### Contrato de contraste (medido con la fórmula WCAG 2.1)

| Par | Ratio | Veredicto |
| --- | --- | --- |
| `--sk-text` sobre `--sk-paper` | 12.08 | AAA |
| `--sk-text-2` sobre `--sk-paper` | 6.26 | AA |
| `--sk-text-3` sobre `--sk-paper` | 4.50 | AA |
| `--sk-matcha` sobre `--sk-paper` | 5.61 | AA (texto de acción) |
| `--sk-on-matcha` sobre `--sk-matcha` | 6.18 | AA (**botón primario**) |
| `--sk-on-matcha` sobre `--sk-matcha-hover` | 8.02 | AAA |
| `--sk-matcha` sobre `--sk-matcha-soft` | 5.14 | AA (éxito) |
| `--sk-beni` sobre `--sk-paper` | 5.41 | AA (texto de error) |
| `--sk-beni` sobre `--sk-beni-soft` | 4.82 | AA |
| `--sk-on-beni` sobre `--sk-beni` | 5.96 | AA |
| `--sk-kinari-text` sobre `--sk-kinari-soft` | 5.67 | AA |
| `--sk-ai` sobre `--sk-panel` | 7.01 | AAA |
| `--sk-edge` sobre `--sk-panel` | 3.86 | ≥3:1 (borde con significado) |
| `--sk-kinari` hilo sobre `--sk-panel` | 3.28 | ≥3:1 (sólo hilo) |
| **yoru** `--sk-text` sobre `--sk-paper` | 15.40 | AAA |
| **yoru** `--sk-on-matcha` sobre `--sk-matcha` | 9.57 | AAA |

### Reglas de croma (hard rules)

- **Un acento de acción por pantalla**: `--sk-matcha`. Nunca matcha + beni
  compitiendo por atención.
- **`--sk-beni` solo para error/peligro**, jamás decorativo.
- **`--sk-sakura` es decorativo**: nunca texto, nunca botón, nunca estado.
- **Kinari solo como hilo (1–2 px) o sello**. No es color de texto en modo claro.
- **`--sk-text-3` (4.50) solo en labels grandes o ayuda**; nunca en párrafo largo.
- **Bordes que significan** (input, foco, estado) usan `--sk-edge` (3.86).
  `--sk-hair` (~1.2) es decoración pura.
- Sin degradados salvo `--sk-foil` (hilo cálido) — **máximo 1 por pantalla**.
- Sin negro puro (`#000`) ni blanco puro como fondo de página: siempre washi.

---

## 4. Tipografía

| Rol | Stack | Uso |
| --- | --- | --- |
| Display | `'Zen Maru Gothic', system-ui` | Títulos y sellos. **Redondeada y cálida**, nunca mayúsculas forzadas |
| Body | `'Zen Kaku Gothic New', system-ui` | Todo el texto corrido |
| Mono | `'IBM Plex Mono', ui-monospace` | JWT, `id`, SKU, email — el token **parece** un token |
| Mincho | `'Shippori Mincho', 'Noto Serif JP', serif` | Kanji ornamentales, texto vertical |

Escala (base 16):

```
--sk-fs-display: clamp(1.75rem, 3vw, 2.5rem)  /* 庭 - títulos serenos */
--sk-fs-h1:      1.75rem
--sk-fs-h2:      1.5rem
--sk-fs-body:    1rem
--sk-fs-small:   0.875rem
--sk-fs-micro:   0.75rem    /* labels, mayúsculas, tracking +0.1em */
```

- Display en **mayúsculas solo para labels/eyebrows** (§`.sk-label`), no para
  títulos. Un título en Zen Maru Gothic se lee suave, en caja natural.
- Peso display 500; nunca 700 en bloques largos (pesa de más para "chill").
- Texto en japonés: `writing-mode: vertical-rl` sólo como adorno en columnas
  laterales de ≥120 px, `max-height: 60vh`, `opacity: 0.45`.
- `line-height` generoso (1.6–1.75): el aire es parte del estilo.

---

## 5. Layout — desktop-first responsive

**No es mobile-first.** Es una aplicación de escritorio, se usa en laptop y
monitor, y el sistema se adapta **hacia arriba** con `min-width`. No existe
layout de teléfono, ni hamburger, ni bottom-nav. Una hoja de estilos con
`max-width` de diseño aquí es un error de concepto.

### 5.1 Rango soportado

| Rango | Viewport objetivo | Qué cambia |
| --- | --- | --- |
| Pantalla estrecha | `< 1024px` | **Fuera de rango.** Se muestra un aviso (§5.5) |
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
Entre bloques de contenido, `gap: 24–32px`: el ma (間) se respeta.

### 5.3 El shell autenticado

```
┌──────────────────────────────────────────────────────────────────┐
│  TOPBAR  56px   SHINRYŪ-KAI ▸ panel     [Seal rol]  [nombre]  ⏻  │
├────────────┬───────────────────────────────────┬─────────────────┤
│            │                                   │                 │
│  NAVRAIL   │   PANEL (contenido)               │  RAIL CONTEXTO  │
│  232px     │   flexible                        │  320px          │
│            │                                   │  ≥1680px        │
│  Por rol   │   grid 12 col dentro              │  oculta < 1680  │
│            │                                   │                 │
├────────────┴───────────────────────────────────┴─────────────────┤
│  FOOTER  hilo de kinari, 1px                                      │
└──────────────────────────────────────────────────────────────────┘
```

- **`NavRail`**: ancho fijo, `border-right: 1px solid var(--sk-hair)`. Cada item
  es un bloque suave con el kanji del módulo a la izquierda y el label en la
  tipografía display. El item activo lleva una barra de matcha de 3 px a la
  izquierda y un fondo `--sk-matcha-soft` muy tenue. Nunca se colapsa a iconos.
- **Rail de contexto**: `display: none` por debajo de 1680 px, `display: block`
  a partir de ahí. Lleva `TokenStrip`, resumen de rol y datos de la cuenta.
- **Panel**: `min-width: 0` en el contenedor flex, o el contenido desborda.

### 5.4 Layout de auth

```
┌───────────────────────────┬──────────────────────────────────┐
│                           │                                  │
│   PANEL DE MARCA          │   Formulario                     │
│   flex: 1                 │   ancho fijo 440px               │
│                           │   centrado vertical              │
│   診療会 vertical         │                                  │
│   asanoha 4 %             │   Field... Field...              │
│   hilo de kinari          │   [ Botón primario ]             │
│                           │   enlace al otro formulario      │
└───────────────────────────┴──────────────────────────────────┘
```

El panel de marca **no se oculta** en laptop: es la mitad de la identidad del
sistema. Si algún día hay que quitar algo, se quita el rail de contexto, no esto.

### 5.5 Por debajo de 1024 px

No hay diseño móvil y no se va a inventar uno ahora. Lo honesto es decirlo en
la pantalla:

```css
@media (max-width: 1023px) {
  #root { display: grid; place-items: center; min-height: 100vh; }
  .sk-gate { display: grid; }   /* único bloque visible */
}
```

El aviso (`sk-gate`) es un `Panel` con el kanji, un texto de una línea
(«Esta pantalla está pensada para escritorio») y el ancho mínimo requerido.

### 5.6 Formas

- **Radios suaves**: `12px` en paneles, `8px` en inputs/botones, `999px` sólo en
  sellos circulares y el avatar. La suavidad es el look; **no hay cortes de
  cuchilla** (eso era del sistema anterior).
- **Hilo de kinari (foil)**: filete de 1–2 px con
  `linear-gradient(90deg, #B9963F, #E6D29A 45%, #B9963F)` para separar secciones
  de jerarquía alta. **Máximo 1 por pantalla.**
- **Textura**: asanoha, ichimatsu o raimon en SVG a `opacity: 0.04` detrás de
  paneles grandes. Nunca sobre texto pequeño.
- **Sombra**: sólo para overlays (modal/drawer), con
  `--sk-shadow-overlay`. El resto de la profundidad viene del borde suave.

---

## 6. Componentes

### 6.1 `Seal` (落款) — badge de rol

El componente de firma. Cada `Role` es un sello con su tinta:

| Role | Kanji | Tinta | Fondo |
| --- | --- | --- | --- |
| `CLIENTE` | 客 | `--sk-kinari-text` | `--sk-kinari-soft` |
| `VETERINARIO` | 獣 | `--sk-matcha` | `--sk-matcha-soft` |
| `ADMIN` | 総 | `--sk-beni` | `--sk-beni-soft` |

Cuadrado 28 px, `border-radius: 999px`, kanji centrado, glifo a la derecha en
`--sk-fs-micro` + tracking. El kanji **nunca** sustituye al texto: siempre
`aria-label` con el rol.

### 6.2 `Field` (input)

- Alto 44 px, fondo `--sk-panel`, `border: 1px solid var(--sk-edge)`,
  `border-radius: var(--sk-radius-sm)`.
- Foco: `box-shadow: var(--sk-focus)` (doble anillo washi + matcha).
- Label arriba, `micro` en mayúsculas, `--sk-text-3`. El error va **debajo**, con
  icono, en `--sk-beni`, y el input pasa a `border-color: var(--sk-beni)`.
- El error **solo aparece tras blur o submit**, nunca mientras se escribe.

### 6.3 `Button`

- Primario: fondo `--sk-matcha`, texto `--sk-on-matcha` (6.18 ✓), radio 8 px,
  tipografía display peso 500. Sin clip-path.
- Secundario/ghost: fondo transparente, borde `--sk-edge` 1px, texto `--sk-text`;
  hover `--sk-shade`.
- Carga: el label se sustituye por una barra de progreso de matcha (`scaleX`) —
  no un spinner. Tiene que aguantar los 15 s del timeout sin fingir avance.
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

El JWT en `--sk-font-mono`, 12 px, `word-break: break-all`, sobre `--sk-shade`
con hilo de kinari a la izquierda, label `TOKEN (24 h)` en matcha. Es una
**insignia**, no texto de debug. Botón copiar con confirmación de 2 s.

### 6.6 `Panel`

Fondo `--sk-panel`, borde 1 px `--sk-hair`, `border-radius: 12px`. Variante
`.panel--sealed` con **hilo de kinari** superior — se reserva para **una** por
pantalla: la confirmación de éxito.

### 6.7 `NavRail` — navegación por rol

Sólo en escritorio y sólo en `AuthedShell`. Es un componente **dirigido por
`role`**: quien llama pasa el rol y la lista sale de un mapa (§2.2). Así es
imposible mostrarle «Usuarios» a un `CLIENTE`.

- Ancho fijo `232px`, `border-right: 1px solid var(--sk-hair)`.
- Item: `display: grid; grid-template-columns: 28px 1fr; gap: 12px`, alto 40 px,
  `border-radius: 8px`. Kanji del módulo (`--sk-font-jp`), label display.
- Item activo: `background: var(--sk-matcha-soft)` + barra matcha de 3 px a la
  izquierda + texto `--sk-text`. El resto, `--sk-text-2`.
- Item de cierre de sesión al final, separado por un hilo de kinari de 1 px.

### 6.8 `ContextRail`

La tercera columna, `320px`, `display: none` por debajo de 1680 px. Contenido en
este orden: `Seal` del rol + `nombre` + `email`, `TokenStrip`, y un bloque de
"salir" con confirmación. Aparece **al crecer la pantalla**, no al encoger.

### 6.9 `StateBlock` — vacío, cargando, error, reintento

Un solo componente para los cuatro estados no-afectivos.

| Variante | Contenido | Acción |
| --- | --- | --- |
| `empty` | kanji contextual + una línea de copy | el CTA de la pantalla |
| `loading` | barra de progreso de matcha, sin texto de «cargando» | ninguna |
| `error` | icono + `Alert` (§6.4) + `path`/status sólo en `console` | botón reintentar |
| `forbidden` | `Panel` con `Seal` de acceso denegado | volver a `LoginScreen` |

`forbidden` existe por §2.4: cuando se añada el filtro JWT y devuelva 403 sin
token, el shell expulsa en vez de mostrar un error genérico.

---

## 7. Movimiento

- `ease-out` suave `cubic-bezier(0.25, 0.8, 0.25, 1)`, duraciones 180 ms
  (estado), 260 ms (entrada), 360 ms (sello). Todo un punto más lento que un
  sistema agresivo: la calma se transmite en el tiempo.
- Los sellos entran con un **golpe suave**: `scale(1.25) → scale(1)` en 360 ms,
  con `opacity 0 → 1`. Sin rebotes ni exageración.
- `@media (prefers-reduced-motion: reduce)` → `animation: none !important;
  transition-duration: 1ms !important`. El sello aparece sin golpe, pero aparece.

---

## 8. Accesibilidad

- Todo texto ≥4.5:1; bordes con significado ≥3:1. Cifras medidas en §3.
- El kanji del `Seal` es decorativo: `aria-hidden` en el glifo, el texto del rol
  siempre presente.
- Foco visible en todos los interactivos, nunca `outline: none` sin reemplazo.
- Los estados de error se anuncian (`role="alert"`), no sólo se pintan.
- Orden de tabulación = orden visual, siempre.
- **Reflow**: como no hay diseño bajo 1024 px, WCAG 1.4.10 no aplica, pero sí
  1.4.4 — el texto debe subir al 200 % sin perder contenido. El layout de
  escritorio aguanta zooming.
- Sin scroll horizontal en 1024 px.

---

## 9. Prohibido

### Estilo

- Negro puro (`#000`) o blanco puro como fondo de página.
- Rojo saturado tipo alarma; el error es `--sk-beni`, suave.
- Amarillo/oro brillante. El kinari es apagado y solo hilo/sello.
- Degradados radiales, glassmorphism, sombras difusas (salvo
  `--sk-shadow-overlay` en overlays).
- Cortes de cuchilla (`clip-path` tipo espada) o radios >14 px en paneles.
- Emoji como icono de estado.
- Mostrar `400` / `403` / `path` / `timestamp` en pantalla.
- Svástika en cualquier forma.
- Kanji decorativo mal usado o kawaii forzado.

### Responsive

- **Media queries en `max-width`.** El sistema es desktop-first: se escribe en
  `min-width` y **crece** sumando la columna de contexto.
- **Layout móvil**: hamburger, bottom-nav, drawer, `100vw` para el ancho de un
  panel, `flex-wrap` en la navegación.
- Colapsar el `NavRail` a iconos.
- Ocultar el panel de marca de `AuthLayout` para «ganar espacio».

### Sistema

- Un endpoint sin pantalla diseñada (§2.1) ni un rol sin fila en el mapa de
  navegación (§2.2).
- Colores, radios o sombras fuera de los tokens de §11.

---

## 10. Esqueleto — archivos listos para usar

```
src/assets/css/
├── tokens.css   # variables CSS (§3, §11) — washi default + [data-theme='yoru']
└── base.css     # reset, tipografía, primitivas (.sk-*)
src/index.css    # importa ambos arriba; mantiene estilos starter por compatibilidad
```

**`tokens.css`** — fuente de verdad del color/tipo/espacio/layout. Washi default,
`[data-theme='yoru']` opt-in.

**`base.css`** — primitivas listas:
| Clase | Qué hace | § ref |
|---|---|---|
| `.sk-shell` | `min-height:100vh`, fondo paper | 5.1 |
| `.sk-container` | `max-width: var(--sk-shell-max)`, márgenes fluidos | 5.2 |
| `.sk-panel` | panel blanco, borde hairline, radio 12px | 6.6 |
| `.sk-panel--sealed` | + hilo de kinari arriba (1 sola por pantalla) | 6.6 |
| `.sk-field` / `__input` / `--invalid` / `__error` | input 44px, estados | 6.2 |
| `.sk-btn` / `--primary` / `--ghost` / `[disabled]` | 44px, radio suave, loading | 6.3 |
| `.sk-alert` / `--error` / `--ok` | traductor HTTP → español | 6.4 |
| `.sk-token` | JWT mono, word-break, label «TOKEN (24h)» | 6.5 |
| `.sk-seal` | sello circular 28px, kanji del rol | 6.1 |
| `.sk-gate` | aviso «pantalla para escritorio» <1024px | 5.5 |
| `.sk-label` / `.sk-prose` / `.sk-mono` / `.sk-jp` | utilidades de texto | 4 |

### Fuentes

Se cargan en `index.html` desde Google Fonts:
`Zen Maru Gothic` (display), `Zen Kaku Gothic New` (body), `IBM Plex Mono`
(mono), `Shippori Mincho` (jp). Si no cargan, los stacks de `tokens.css` caen a
sans/serif del sistema sin romper el layout.

### Cómo activar modo yoru (opt-in)

```js
// en el entry point (main.jsx) o donde decidas la preferencia
document.documentElement.dataset.theme = 'yoru';
```

No uses `prefers-color-scheme`: una clínica no cambia de tema sola.

---

## 11. Export de tokens (referencia rápida)

```css
:root {
  /* superficies */
  --sk-paper: #f6f4ec;
  --sk-panel: #ffffff;
  --sk-shade: #ece8dc;
  --sk-ink: #2c3129;

  /* texto */
  --sk-text: #2c3129;
  --sk-text-2: #565c51;
  --sk-text-3: #6c7266;
  --sk-text-inv: #f6f4ec;

  /* bordes */
  --sk-hair: #e2ded0;
  --sk-edge: #7e8474;

  /* matcha 抹茶 */
  --sk-matcha: #47694e;
  --sk-matcha-hover: #3a5740;
  --sk-matcha-soft: #e3ede2;
  --sk-on-matcha: #ffffff;

  /* beni 紅 */
  --sk-beni: #9e4a47;
  --sk-beni-hover: #833d3a;
  --sk-beni-soft: #f6e3e1;
  --sk-on-beni: #ffffff;

  /* kinari 生成 */
  --sk-kinari: #a98a46;
  --sk-kinari-text: #6e5828;
  --sk-kinari-soft: #f2ead6;

  /* apoyos */
  --sk-ai: #3c5c78;
  --sk-ai-soft: #e4ecf3;
  --sk-sakura: #c97f8c;
  --sk-sakura-soft: #f7e7e9;

  /* tipografía */
  --sk-font-display: 'Zen Maru Gothic', system-ui, sans-serif;
  --sk-font-body: 'Zen Kaku Gothic New', system-ui, sans-serif;
  --sk-font-mono: 'IBM Plex Mono', ui-monospace, monospace;
  --sk-font-jp: 'Shippori Mincho', 'Noto Serif JP', serif;

  /* espacio */
  --sk-s1: 4px; --sk-s2: 8px; --sk-s3: 12px; --sk-s4: 16px;
  --sk-s6: 24px; --sk-s8: 32px; --sk-s12: 48px; --sk-s16: 64px;

  /* forma */
  --sk-radius: 12px;
  --sk-radius-sm: 8px;
  --sk-radius-seal: 999px;
  --sk-hairline: 1px solid var(--sk-hair);
  --sk-foil: linear-gradient(90deg, #b9963f, #e6d29a 45%, #b9963f);
  --sk-shadow-overlay: 0 12px 40px rgba(44, 49, 41, 0.12);

  /* layout */
  --sk-shell-max: 1120px;
  --sk-navrail-w: 232px;
  --sk-rail-w: 320px;
  --sk-topbar-h: 56px;
  --sk-form-w: 440px;
  --sk-reading: 68ch;

  /* estado */
  --sk-focus: 0 0 0 2px var(--sk-paper), 0 0 0 4px var(--sk-matcha);
  --sk-ease: cubic-bezier(0.25, 0.8, 0.25, 1);
  --sk-dur: 180ms;
}

/* breakpoints: crece hacia arriba, min-width (§5.1) */
@media (min-width: 1440px) { :root { --sk-shell-max: 1280px; } }
@media (min-width: 1680px) { :root { --sk-shell-max: 1440px; } }
@media (min-width: 2200px) { :root { --sk-shell-max: 1600px; } }

/* modo yoru: opt-in via [data-theme='yoru'] */
[data-theme='yoru'] {
  --sk-paper: #12140f;
  --sk-panel: #1b1e17;
  --sk-shade: #24281e;
  --sk-ink: #edeae0;
  --sk-text: #edeae0;
  --sk-text-2: #b7bcaf;
  --sk-text-3: #8c9285;
  --sk-text-inv: #12140f;
  --sk-hair: #2c3026;
  --sk-edge: #6a7061;
  --sk-matcha: #9cc4a3;
  --sk-matcha-hover: #b0d2b6;
  --sk-matcha-soft: #1e2a1e;
  --sk-on-matcha: #12140f;
  --sk-beni: #e2a09c;
  --sk-beni-hover: #edb4b0;
  --sk-beni-soft: #33191a;
  --sk-on-beni: #12140f;
  --sk-kinari: #c9a968;
  --sk-kinari-text: #e8cf8f;
  --sk-kinari-soft: #2a2416;
  --sk-ai: #9dbdd8;
  --sk-ai-soft: #182431;
  --sk-sakura: #e2a9b2;
  --sk-sakura-soft: #2e1d20;
  --sk-shadow-overlay: 0 12px 40px rgba(0, 0, 0, 0.55);
  --sk-focus: 0 0 0 2px var(--sk-paper), 0 0 0 4px var(--sk-matcha);
}
```

---

## 12. Cablearlo en este repo

- `src/assets/css/tokens.css` — **ya existe** con los tokens de §11. Las media
  queries de `--sk-shell-max` van **fuera** del bloque `[data-theme='yoru']`.
- `src/assets/css/base.css` — **ya existe** con las primitivas `.sk-*` (§10).
- `src/index.css` — **ya importa** `tokens.css` + `base.css` arriba.
- `src/component/` — un componente por archivo. Ojo: la carpeta está en
  **singular** (`component`), no `components`.
- `src/pages/` — `Login.jsx`, `Register.jsx`, `Authenticated.jsx`.
- `src/layout/` — `AuthLayout.jsx` y `AuthedShell.jsx`.
- `src/api/axios.js` — no lo modifiques para el sistema visual; ahí vive el
  `timeout: 15000` que el `Button` de carga tiene que respetar.
- `react-refresh/only-export-components` está activo: un componente no puede
  exportar también constantes. Los mapas van en archivo aparte (p. ej.
  `src/component/seal-roles.js`).

### Orden de implementación sugerido

1. `tokens.css` + `base.css` + `index.css` — el gamut y las primitivas.
2. `Field` + `Button` + `sk-gate`.
3. `LoginScreen` (**E2**) completa, con su `AuthLayout`.
4. `Alert` con la matriz de §6.4 + `StateBlock`.
5. `RegisterScreen` (**E1**) con validación de cliente idéntica al DTO.
6. `Seal` + `TokenStrip` + `panel--sealed`.
7. `AuthedShell` + `NavRail` + `ContextRail`.
8. Textura de fondo y hilo de kinari — último.

### Checklist de cobertura

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
(`stitch_upload_design_md`), como el enum de fuentes de Stitch no incluye Zen
Maru Gothic ni Zen Kaku Gothic New, se usan las más cercanas:
`customColor` = `--sk-matcha` `#47694E`, headline `MANROPE`, body `NUNITO_SANS`,
label `JETBRAINS_MONO`, `colorMode` `LIGHT`, `roundness` `ROUND_EIGHT`.
