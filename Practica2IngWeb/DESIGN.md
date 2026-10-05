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

La firma es **tinta + vermellón + oro**. Todo lo demás son apoyos.

### Tokens — modo oscuro (default, «tinta»)

| Token | Hex | Uso |
| --- | --- | --- |
| `--sk-ink` | `#0A0A0B` | Fondo de página |
| `--sk-sumigata` | `#131316` | Panel, tarjeta, superficie |
| `--sk-iro` | `#1C1C21` | Input, campo elevado |
| `--sk-edge` | `#2A2A31` | Borde **decorativo** |
| `--sk-edge-strong` | `#6A6A75` | Borde con significado, ≥3:1 |
| `--sk-shu` | `#C1272D` | Acción primaria, acento de marca |
| `--sk-shu-hover` | `#A81F24` | Primary hover |
| `--sk-shu-active` | `#8A1A1E` | Primary pressed |
| `--sk-on-shu` | `#F4F1EA` | Texto **sobre** vermellón. No invierte en modo claro |
| `--sk-aka` | `#FF6B5A` | **Texto** de error/urgente (el rojo puro no llega a 4.5) |
| `--sk-aka-bg` | `#3A0E10` | Fondo de alerta |
| `--sk-kin` | `#C9A227` | Acento dorado, foil |
| `--sk-kin-bright` | `#E8CC6B` | Texto dorado, anillo de foco en oscuro |
| `--sk-kin-deep` | `#8A6D1F` | Oro en borde/filete **nunca** como texto en oscuro |
| `--sk-ai` | `#7FA8D6` | Texto informativo (aizome, índigo diluido) |
| `--sk-mochi` | `#B9B3A6` | Texto secundario |
| `--sk-kusu` | `#837C6E` | Texto muted (4.78 — sólo cuerpo grande o labels) |
| `--sk-moegi` | `#A8C25A` | Texto de éxito (herbal) |
| `--sk-moegi-bg` | `#1E2A10` | Fondo de éxito |
| `--sk-washi` | `#F4F1EA` | Texto principal |

### Tokens — modo claro («washi»)

| Token | Hex | Nota |
| --- | --- | --- |
| `--sk-ink` | `#EDE7DA` | Fondo (papel 生成) |
| `--sk-sumigata` | `#F7F4ED` | Panel (胡粉) |
| `--sk-iro` | `#FFFFFF` | Input |
| `--sk-washi` | `#14100C` | Texto principal (15.37 sobre papel) |
| `--sk-mochi` | `#4A443A` | Secundario (8.77 sobre panel) |
| `--sk-kusu` | `#6E675A` | Muted (4.54) |
| `--sk-edge` | `#D8D0BE` | Decorativo (1.25) |
| `--sk-edge-strong` | `#7A7263` | Con significado (3.86) |
| `--sk-shu` | `#9E1F24` | Acción primaria, más apagada que en oscuro |
| `--sk-on-shu` | `#F4F1EA` | Texto sobre vermellón (6.96) |
| `--sk-aka` / `--sk-aka-bg` | `#9E1F24` / `#F7DEDC` | Error (6.14) |
| `--sk-ai` | `#2A5A8A` | Texto informativo (6.53) |
| `--sk-moegi` / `--sk-moegi-bg` | `#4A6321` / `#E4ECD0` | Éxito (5.55) |
| `--sk-kin-text` | `#6F5714` | **Oro como texto**: `#8A6D1F` da 3.97 y falla |
| anillo de foco | `#6F5714` | `#E8CC6B` da 1.28 sobre papel: no sirve |

Los tokens de modo claro **sobrescriben los mismos nombres** (`--sk-ink`,
`--sk-washi`, `--sk-shu`…) en `[data-theme='washi']`, no crean sufijos `-inv`.
Un componente no sabe en qué modo está: hereda.

### Contrato de contraste (medido, no estimado)

Todas las cifras salen de la fórmula WCAG 2.1, verificadas con script.

| Par | Ratio | Veredicto |
| --- | --- | --- |
| `--sk-washi` sobre `--sk-ink` | 17.54 | AAA |
| `--sk-kin-bright` sobre `--sk-ink` | 12.52 | AAA |
| `--sk-kin` sobre `--sk-ink` | 8.18 | AAA |
| `--sk-ai` sobre `--sk-ink` | 7.99 | AAA |
| `--sk-mochi` sobre `--sk-sumigata` | 8.88 | AAA |
| `--sk-aka` sobre `--sk-aka-bg` | 8.21 | AAA |
| `--sk-on-shu` sobre `--sk-shu` | 5.18 | AA — **el botón primario lleva texto claro** |
| `--sk-kusu` sobre `--sk-ink` | 4.78 | AA, justo |
| `--sk-shu` (washi) sobre `--sk-ink` (washi) | 4.74 | AA |
| `--sk-kin-text` sobre papel | 5.59 | AA |
| `--sk-kin-deep` sobre `--sk-ink` | 4.04 | **FALLA** → sólo decorativo |
| texto oscuro `#14100C` sobre `--sk-shu` (washi) | 2.41 | **FALLA** → de ahí el token `--sk-on-shu` |
| texto oscuro `#14100C` sobre `--sk-shu` (oscuro) | 3.24 | **FALLA** → nunca texto oscuro en vermellón |
| `--sk-ai` oscuro `#2E5C8A` | 2.84 | **FALLA** → usar `--sk-ai` claro |
| `--sk-edge` sobre `--sk-ink` | 1.39 | Decorativo; para borde real, `--sk-edge-strong` |

**Regla dura**: el rojo de la paleta de marca (`#C1272D`) nunca es texto de
error sobre fondo oscuro. Para texto de error, `--sk-aka`.

### Reglas de croma

- Un borde que **significa** algo (input en foco, control deshabilitado que hay
  que explicar) necesita ≥3:1. `1px solid var(--sk-edge)` es invisible y no
  cuenta como borde.
- El oro se usa en ≤5 % de la superficie. Si todo es dorado, nada es dorado.
- Rojo + verde nunca se distinguen solo por color: siempre llevan icono o texto.
- Sin degradados salvo en el filete de oro (`foil`), que es el único elemento
  con brillo.

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

## 5. Layout y formas

- **Rejilla**: 12 col, `gap: 16px`, `max-width: 1120px`, márgenes fluidos
  `clamp(16px, 4vw, 48px)`. Formularios: una columna, `max-width: 440px`.
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

---

## 9. Prohibido

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

---

## 10. Export de tokens

Copiar en `src/assets/css/tokens.css` (la carpeta existe y está vacía) e
importar desde `src/index.css`.

```css
:root {
  /* superficies */
  --sk-ink: #0a0a0b;
  --sk-sumigata: #131316;
  --sk-iro: #1c1c21;
  --sk-edge: #2a2a31;
  --sk-edge-strong: #6a6a75;

  /* vermellón 朱 */
  --sk-shu: #c1272d;
  --sk-shu-hover: #a81f24;
  --sk-shu-active: #8a1a1e;
  --sk-on-shu: #f4f1ea;
  --sk-aka: #ff6b5a;
  --sk-aka-bg: #3a0e10;

  /* oro 金 */
  --sk-kin: #c9a227;
  --sk-kin-bright: #e8cc6b;
  --sk-kin-deep: #8a6d1f;
  --sk-foil: linear-gradient(90deg, #8a6d1f, #e8cc6b 35%, #8a6d1f 70%, #e8cc6b);

  /* apoyos */
  --sk-ai: #7fa8d6;
  --sk-moegi: #a8c25a;
  --sk-moegi-bg: #1e2a10;

  /* texto */
  --sk-washi: #f4f1ea;
  --sk-mochi: #b9b3a6;
  --sk-kusu: #837c6e;

  /* tipografía */
  --sk-font-display: 'Anton', 'Arial Black', sans-serif;
  --sk-font-body: 'Inter', system-ui, sans-serif;
  --sk-font-mono: 'IBM Plex Mono', ui-monospace, monospace;
  --sk-font-jp: 'Shippori Mincho', 'Noto Serif JP', serif;

  /* formas */
  --sk-radius: 0;
  --sk-radius-seal: 999px;
  --sk-blade: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);
  --sk-ease: cubic-bezier(0.16, 1, 0.3, 1);

  --sk-focus-dark: 0 0 0 3px var(--sk-ink), 0 0 0 5px var(--sk-kin-bright);
}

[data-theme='washi'] {
  --sk-ink: #ede7da;
  --sk-sumigata: #f7f4ed;
  --sk-iro: #ffffff;
  --sk-edge: #d8d0be;
  --sk-edge-strong: #7a7263;
  --sk-washi: #14100c;
  --sk-mochi: #4a443a;
  --sk-kusu: #6e675a;
  --sk-shu: #9e1f24;
  --sk-on-shu: #f4f1ea;
  --sk-aka: #9e1f24;
  --sk-aka-bg: #f7dedc;
  --sk-kin-text: #6f5714;
  --sk-moegi: #4a6321;
  --sk-moegi-bg: #e4ecd0;
  --sk-ai: #2a5a8a;
  --sk-focus-dark: 0 0 0 3px var(--sk-ink), 0 0 0 5px #6f5714;
}
```

---

## 11. Cablearlo en este repo

- `src/assets/css/tokens.css` — los tokens de arriba. La carpeta ya existe.
- `src/component/` — un componente por archivo. Ojo: la carpeta está en
  **singular** (`component`), no `components`. No hay `src/components`.
- `src/pages/` — `Login.jsx`, `Register.jsx`, `Authenticated.jsx` (o donde
  caiga el router cuando exista).
- `src/api/axios.js` — no lo modifiques para el sistema visual, pero es donde
  vive el `timeout: 15000` que el `Button` de carga tiene que respetar.
- `react-refresh/only-export-components` está activo: un componente no puede
  exportar también constantes. Si `Seal` necesita su mapa de roles, va en otro
  archivo (p. ej. `src/component/seal-roles.js`).

### Orden de implementación sugerido

1. `tokens.css` + `index.css` — la base del gamut.
2. `Field` + `Button` — cubren el 90 % de la pantalla de login.
3. `Alert` con la matriz de la §6.4 — es donde el diseño se gana o se pierde.
4. `Seal` + `TokenStrip` — la confirmación de éxito.
5. Textura de fondo y cinta washi — último, y sólo en `panel--sealed`.

---

## Nota sobre Stitch

Este documento es la fuente de verdad. Si se sube a Stitch
(`stitch_upload_design_md`), el `customColor` debe ser `--sk-shu` `#c1272d`,
el headline `ANTON`, el body `INTER`, y el label `IBM_PLEX_MONO`, con
`colorMode` DARK y `roundness` `ROUND_FOUR`.