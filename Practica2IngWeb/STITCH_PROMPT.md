# STITCH PROMPT — SHINRYŪ-KAI Veterinary Management System

## Contexto del proyecto

Sistema de gestión veterinaria con estética **japonesa serena** ("SHINRYŪ-KAI" = 診療会, "la clínica como un jardín"). Backend: Spring Boot 3.3 (Java 17) con JWT. Frontend: React 19 + Vite 8. **Ya existen landing y registro.** Falta TODO lo autenticado.

**Objetivo**: sistema de gestión veterinaria **medianamente completo** — clientes con mascotas, agenda de consultas, historia clínica, vacunación, inventario, servicios y facturación. La capa visual se diseña completa; los datos que el backend aún no sirve se modelan como **mock tipado** listo para conectar.

**Estética**: papel washi cálido, tinta sumi suave, verde **matcha** como único acento de acción, rojo **beni** suave para error, hilo **kinari** beige. Calma, aire (間), formas redondeadas (8–12px), sin cortes de cuchilla, sin negro puro, sin colores saturados.

**Arquitectura**: Desktop-first (≥1024px). No hay diseño móvil — por debajo de 1024px se muestra aviso `sk-gate`.

---

## Endpoints backend (estado real hoy)

```
POST /api/auth/register → 201 { token, tokenType:"Bearer", id, nombre, email, role }
POST /api/auth/login    → 200 { token, tokenType:"Bearer", id, nombre, email, role }
```

**Roles**: `CLIENTE` (客) | `VETERINARIO` (獣) | `ADMIN` (総)

**Restricciones críticas**:
- No hay filtro JWT aún → rutas protegidas devuelven 403 vacío
- Login incorrecto = **403** (no 401)
- Errores 400 sin detalle de campos → validación 100% en cliente
- Timeout axios = 15s
- Sesión solo en memoria (recargar = logout)

**Endpoints futuros a modelar (contrato objetivo)**: el frontend se diseña como si existieran, consumiendo un `api` que devuelve mocks cuando el backend no responde. Cada screen declara su endpoint objetivo en un comentario `@endpoint`.

---

## Modelo de dominio veterinario

Entidades del sistema. Todas tienen `id`, `createdAt`, `updatedAt`.

### `Mascota` (paciente)
```json
{
  "id": 17,
  "nombre": "Kuro",
  "especie": "PERRO",            // PERRO | GATO | AVE | ROEDOR | REPTIL | OTRO
  "raza": "Shiba Inu",
  "sexo": "MACHO",               // MACHO | HEMBRA
  "fechaNacimiento": "2021-03-14",
  "pesoKg": 11.4,
  "color": "Rojo sesamé",
  "microchip": "985141000123456",
  "esterilizado": true,
  "fotoUrl": "/img/pet-placeholder.svg",
  "estado": "ACTIVO",            // ACTIVO | INACTIVO | FALLECIDO
  "propietarioId": 5,
  "alertas": ["Alergia a penicilina"],
  "notas": "Nervioso con desconocidos."
}
```

### `Propietario` (cliente)
```json
{
  "id": 5,
  "nombre": "María",
  "apellido": "García",
  "email": "maria@mail.com",
  "telefono": "+34 600 111 222",
  "direccion": "Calle Falsa 123",
  "ciudad": "Kioto",
  "documento": "12345678A",
  "mascotas": [17, 18],
  "estado": "ACTIVO",
  "notas": ""
}
```

### `Cita` (consulta agendada)
```json
{
  "id": 301,
  "fechaHora": "2026-10-08T10:30:00",
  "duracionMin": 30,
  "tipo": "CONSULTA",            // CONSULTA | VACUNACION | CIRUGIA | CONTROL | URGENCIA | PELUQUERIA
  "estado": "CONFIRMADA",        // PENDIENTE | CONFIRMADA | EN_CURSO | COMPLETADA | CANCELADA | NO_ASISTIO
  "motivo": "Revisión anual",
  "mascotaId": 17,
  "veterinarioId": 9,
  "sala": "A",
  "notasPrevias": ""
}
```

### `HistoriaClinica` / `Consulta`
```json
{
  "id": 501,
  "citaId": 301,
  "mascotaId": 17,
  "veterinarioId": 9,
  "fecha": "2026-10-08T10:30:00",
  "motivo": "Revisión anual",
  "anamnesis": "Sin incidencias.",
  "temperaturaC": 38.4,
  "pesoKg": 11.6,
  "frecuenciaCardiaca": 90,
  "frecuenciaRespiratoria": 24,
  "diagnostico": "Sano.",
  "tratamiento": "Ninguno.",
  "observaciones": "",
  "adjuntos": [{"nombre": "radiografia.png", "url": "/files/501/radiografia.png"}],
  "proximaRevision": "2027-10-08"
}
```

### `Vacuna` (cartilla de vacunación)
```json
{
  "id": 701,
  "mascotaId": 17,
  "nombre": "Rabia",
  "lote": "LOT-2026-44",
  "fechaAplicacion": "2026-03-01",
  "fechaProxima": "2027-03-01",
  "veterinarioId": 9,
  "estado": "AL_DIA"             // AL_DIA | PROXIMA | VENCIDA
}
```

### `Tratamiento` / `Receta`
```json
{
  "id": 601,
  "consultaId": 501,
  "mascotaId": 17,
  "medicamento": "Amoxicilina 250mg",
  "dosis": "1 comprimido",
  "frecuencia": "Cada 12 h",
  "duracionDias": 7,
  "via": "ORAL",
  "estado": "ACTIVO",            // ACTIVO | COMPLETADO | SUSPENDIDO
  "indicaciones": "Con comida."
}
```

### `Servicio` (catálogo)
```json
{
  "id": 3,
  "nombre": "Consulta general",
  "categoria": "CONSULTA",       // CONSULTA | VACUNACION | CIRUGIA | ESTETICA | LABORATORIO
  "precio": 45.00,
  "duracionMin": 30,
  "activo": true,
  "descripcion": ""
}
```

### `Factura`
```json
{
  "id": 9001,
  "numero": "F-2026-0001",
  "fecha": "2026-10-08",
  "clienteId": 5,
  "citaId": 301,
  "lineas": [{"servicioId": 3, "descripcion": "Consulta general", "cantidad": 1, "precio": 45.00}],
  "subtotal": 45.00,
  "impuesto": 9.45,
  "total": 54.45,
  "estado": "PAGADA",            // PENDIENTE | PAGADA | ANULADA
  "metodoPago": "EFECTIVO"       // EFECTIVO | TARJETA | TRANSFERENCIA
}
```

### `ArticuloInventario` (stock)
```json
{
  "id": 41,
  "sku": "MED-AMOX-250",
  "nombre": "Amoxicilina 250mg",
  "categoria": "MEDICAMENTO",    // MEDICAMENTO | VACUNA | ALIMENTO | MATERIAL | HIGIENE
  "stock": 42,
  "stockMinimo": 20,
  "precioUnidad": 3.50,
  "proveedor": "VetSupply",
  "caducidad": "2027-05-01",
  "estado": "OK"                 // OK | BAJO | AGOTADO | CADUCADO
}
```

### `Usuario` (empleados / cuentas)
```json
{
  "id": 9,
  "nombre": "Dr. Kenji",
  "apellido": "Tanaka",
  "email": "kenji@shinryukai.vet",
  "telefono": "+34 600 333 444",
  "role": "VETERINARIO",
  "especialidad": "Cirugía",     // solo VETERINARIO
  "estado": "ACTIVO",            // ACTIVO | INACTIVO
  "createdAt": "2025-01-10T09:00:00",
  "ultimoAcceso": "2026-10-08T08:12:00"
}
```

### Eventos de auditoría (ADMIN)
```json
{
  "id": 1,
  "fecha": "2026-10-08T09:01:00",
  "usuario": "admin@shinryukai.vet",
  "accion": "LOGIN",
  "entidad": "User",
  "entidadId": 9,
  "detalle": "Acceso correcto"
}
```

---

## Mapa de navegación por rol (completo)

El `NavRail` es **dirigido por `role`**: quien llama pasa el rol y la lista sale de un mapa. Nunca un array libre.

| Módulo | Kanji | CLIENTE | VETERINARIO | ADMIN |
|--------|-------|:-------:|:-----------:|:-----:|
| Panel | 盤 | ✓ | ✓ | ✓ |
| Mis mascotas | 獣 | ✓ | — | — |
| Mis citas | 刻 | ✓ | — | — |
| Historial / Cartilla | 歴 | ✓ | — | — |
| Facturas / Recibos | 札 | ✓ | — | — |
| Mi agenda | 刻 | — | ✓ | — |
| Pacientes | 患 | — | ✓ | — |
| Consultas / Historia | 診 | — | ✓ | — |
| Vacunación | 疫 | — | ✓ | — |
| Tratamientos | 薬 | — | ✓ | — |
| Inventario | 庫 | — | ✓ | ✓ |
| Servicios | 役 | — | — | ✓ |
| Usuarios / Personal | 員 | — | — | ✓ |
| Facturación | 円 | — | — | ✓ |
| Reportes | 報 | — | — | ✓ |
| Auditoría | 監 | — | — | ✓ |
| Configuración | 設 | ✓ | ✓ | ✓ |
| Mis datos | 己 | ✓ | ✓ | ✓ |

`Mis datos` + logout al final de todo NavRail, separados por un hilo de kinari de 1px.

**Panel inicial al entrar**:
| Role | Panel inicial |
|------|---------------|
| CLIENTE | Resumen cuenta + próximas citas + alertas de vacunas + `TokenStrip` |
| VETERINARIO | Agenda del día + pacientes en sala + tareas pendientes |
| ADMIN | KPIs del sistema + gráficos + actividad reciente |

---

## Pantallas a generar

### BLOQUE A — Auth (prioridad 1)

#### A1. `LoginScreen` — E2 (valida el 403 real)
- `AuthLayout`: panel marca izq (kanji vertical 診療会, asanoha 4%, hilo de kinari), formulario der (440px centrado)
- 2 campos: email, password
- Estados: vacío · foco · error campo · cargando (15s) · 200 · **403** · red
- Alert matrix: 200 "入場 — Sesión iniciada" + nombre + Seal rol | 403 "拒否 — Credenciales incorrectas" | red "断 — El servidor no responde"
- Botón primario matcha, radio suave, loading = barra matcha scaleX (no spinner)
- Enlace pie a RegisterScreen

#### A2. `RegisterScreen` — E1 (validación cliente idéntica DTO)
- Mismo `AuthLayout`
- 6 campos: nombre (2-50), apellido?, email, password (≥6), telefono?, role? (select: CLIENTE/VETERINARIO/ADMIN, default CLIENTE)
- Validación en cliente = reglas DTO exactas (evita 400 ambiguo)
- Estados idem + 201 · 400
- Alert: 201 "入会 — Bienvenido" + seals datos | 400 "失敗 — No pudimos crear la cuenta" | 400 email duplicado "失敗 — Correo en uso" (solo si cliente lo sabe)

---

### BLOQUE B — Shell (prioridad 2)

#### B1. `AuthedShell` + `NavRail` + `ContextRail`
```
┌──────────────────────────────────────────────────────────────────┐
│ TOPBAR 56px  SHINRYŪ-KAI ▸ [breadcrumb]  [🔔] [Seal rol] [nombre] │
├────────────┬───────────────────────────────────┬─────────────────┤
│ NAVRAIL    │ PANEL (12-col grid)               │ CONTEXT RAIL    │
│ 232px fijo │ flexible, min-width:0             │ 320px ≥1680px   │
│ Por rol    │                                   │ TokenStrip +    │
│            │                                   │ resumen cuenta  │
├────────────┴───────────────────────────────────┴─────────────────┤
│ FOOTER hilo kinari 1px  ·  SHINRYŪ-KAI 診療会  ·  v1.0           │
└──────────────────────────────────────────────────────────────────┘
```
- **Topbar**: logo, breadcrumb `SHINRYŪ-KAI ▸ {módulo}`, campana de notificaciones (badge de pendientes), `Seal` del rol, nombre, botón salir.
- **NavRail**: item = grid `28px 1fr`, kanji + label display. Activo = fondo `--sk-matcha-soft` + barra matcha 3px izq + texto `--sk-text`; resto `--sk-text-2`. Radio 8px. Nunca se colapsa.
- **ContextRail** (≥1680px): `Seal` + nombre + email + `TokenStrip` + bloque "salir" con confirmación.
- **Footer**: hilo de kinari 1px.

---

### BLOQUE C — Paneles iniciales por rol (prioridad 2)

#### C1. `PanelCliente` (盤)
- Tarjeta de bienvenida `panel--sealed`: nombre + `Seal` CLIENTE.
- `StatCard` row: nº mascotas · próximas citas · vacunas por vencer · facturas pendientes.
- Lista "Próximas citas" (máx 3) con `CitaRow` + CTA "Ver todas".
- Bloque "Alertas" (vacunas `VENCIDA` o `PROXIMA`) en `--sk-kinari-soft`/`--sk-beni-soft`.
- `TokenStrip`.

#### C2. `PanelVeterinario` (盤)
- `StatCard` row: citas hoy · pacientes en espera · consultas completadas · urgencias.
- **Columna dual**: izquierda `AgendaDia` (timeline horario con `CitaRow`), derecha "Pacientes en sala" + "Pendientes" (checklist).
- Botón primario "Nueva consulta".

#### C3. `PanelAdmin` (盤)
- `StatCard` row: usuarios activos · citas semana · ingresos mes · artículos bajo stock.
- Gráfico de barras "Citas por día" (7 días) y doughnut "Distribución por tipo" — SVG puro con tokens, sin librería.
- Tabla "Actividad reciente" (últimos 10 eventos) + CTA "Ver auditoría".

---

### BLOQUE D — Módulos CLIENTE (prioridad 3)

#### D1. `MisMascotas` (獣)
- Grid de `MascotaCard`: avatar/placeholder circular 999px, nombre, especie·raza, edad, `Seal` estado, alertas (badge beni).
- Buscador de texto + filtro por especie + botón primario "Añadir mascota".
- `StateBlock` empty: kanji 獣 + "Aún no tienes mascotas registradas" + CTA.

#### D2. `MascotaDetalle` (獣)
- Cabecera: avatar grande, nombre, especie·raza·sexo·edad·peso, `Seal` estado, botones "Editar" / "Agendar cita".
- `Tabs`: Datos · Historial · Vacunas · Tratamientos · Facturas.
  - **Datos**: grid de campos + alertas + notas.
  - **Historial**: timeline de `Consulta` con `TimelineItem`.
  - **Vacunas**: tabla de `Vacuna` con `Badge` estado + botón "Añadir vacuna".
  - **Tratamientos**: tabla de `Tratamiento` con estado.
  - **Facturas**: tabla de `Factura` del cliente para esa mascota.

#### D3. `MisCitas` (刻)
- Vista `Tabs`: Próximas · Historial · Canceladas.
- `CitaCard`: fecha/hora, tipo (`Badge` por tipo), mascota, vet, sala, estado (`Seal`), acciones "Cancelar" / "Reprogramar".
- Filtro por estado y rango de fechas.
- CTA "Solicitar cita" → `ModalNuevaCita`.

#### D4. `MiHistorial` (歴)
- Vista consolidada de todas las consultas de todas las mascotas.
- Filtro por mascota + rango de fechas + tipo.
- Exportar cartilla (botón ghost, descarga simulada).

#### D5. `MisFacturas` (札)
- Tabla: número, fecha, mascota, total, estado (`Badge`), acción "Ver".
- Filtro por estado. `StateBlock` empty "Sin facturas".

#### D6. `ModalNuevaCita`
- Campos: mascota (select), tipo (select), fecha (date), hora (time), motivo (textarea), vet preferido (select opcional).
- Validación cliente. Confirmación `panel--sealed` con kanji 刻.

---

### BLOQUE E — Módulos VETERINARIO (prioridad 3)

#### E1. `MiAgenda` (刻)
- Selector de fecha (día/semana). Vista por defecto: **día** en timeline de horas 08:00–20:00.
- Cada `CitaBlock`: hora, mascota + propietario, tipo, estado, sala. Click → `DrawerConsulta`.
- Vista semana: grid 7 columnas con bloques compactos.
- `StateBlock` empty "Sin citas este día".

#### E2. `Pacientes` (患)
- Tabla: mascota, especie, propietario, teléfono, última visita, estado.
- Buscador por mascota/propietario/microchip + filtros especie/estado.
- Acciones por fila: "Ver ficha", "Nueva consulta".
- Paginación.

#### E3. `HistoriaClinica` / `Consultas` (診)
- Tabla de consultas: fecha, mascota, vet, diagnóstico, próxima revisión.
- Filtro por mascota/vet/rango.
- Click → `ConsultaDetalle` con todos los campos clínicos + adjuntos + tratamientos.

#### E4. `NuevaConsulta` (formulario largo)
Secciones en `Panel`:
1. **Contexto**: mascota (o cita origen), vet, fecha, motivo.
2. **Constantes**: temperatura, peso, FC, FR.
3. **Anamnesis** (textarea).
4. **Diagnóstico** (textarea).
5. **Tratamiento** (textarea) + botón "Añadir receta" (líneas de medicamento).
6. **Adjuntos** (upload simulado).
7. **Próxima revisión** (date).
8. Acciones: "Guardar borrador" (ghost) / "Cerrar consulta" (primario).

#### E5. `Vacunacion` (疫)
- Tabla de vacunas aplicadas + próximas.
- Filtro por estado (`AL_DIA`/`PROXIMA`/`VENCIDA`) y mascota.
- Formulario "Registrar vacuna": mascota, vacuna, lote, fecha aplicación, próxima.
- Alerta destacada de vacunas `VENCIDA` (`--sk-beni-soft`).

#### E6. `Tratamientos` (薬)
- Tabla: mascota, medicamento, dosis, frecuencia, duración, estado, vet.
- Filtro por estado. Acciones "Completar" / "Suspender".

#### E7. `Inventario` (庫) (compartido con ADMIN)
- Tabla: SKU, nombre, categoría, stock, stock mínimo, precio, caducidad, estado (`Badge`).
- Filas con `estado !== OK` resaltadas (beni-soft para agotado/caducado, kinari-soft para bajo).
- Acciones: "Añadir stock", "Editar". `ModalArticulo`.

---

### BLOQUE F — Módulos ADMIN (prioridad 3)

#### F1. `Usuarios` (員)
- Tabla: id, nombre, email, teléfono, rol (`Seal`), especialidad, estado, último acceso.
- Buscador + filtro por rol/estado.
- Acciones: "Editar", "Activar/Desactivar", "Resetear contraseña" (confirmación).
- `ModalUsuario` (crear/editar). No permite auto-desactivarse.

#### F2. `Servicios` (役)
- Tabla catálogo: nombre, categoría (`Badge`), precio, duración, activo.
- `ModalServicio` con toggle activo.

#### F3. `Facturacion` (円)
- Tabla: número, fecha, cliente, total, estado (`Badge`), método.
- KPIs: pendiente de cobro · cobrado mes · nº facturas.
- `ModalFactura`: cliente + cita + líneas de servicio (cantidad × precio), cálculo automático subtotal/IVA/total.
- Acciones: "Marcar pagada", "Anular" (confirmación).

#### F4. `Reportes` (報)
- Selector de rango de fechas.
- `StatCard` de resumen.
- Gráficos SVG con tokens: ingresos por mes (barras), citas por tipo (doughnut), nuevos clientes (línea).
- Tabla "Top servicios". Botón "Exportar CSV" (ghost).

#### F5. `Auditoria` (監)
- Tabla de eventos: fecha, usuario, acción, entidad, entidadId, detalle.
- Filtro por usuario/acción/rango. Paginación.

#### F6. `Configuracion` (設) (compartido con todos)
- `Tabs`: General · Horario · Notificaciones · Apariencia · Seguridad.
  - **General**: nombre clínica, dirección, teléfono, email, moneda, IVA%.
  - **Horario**: días de apertura + hora inicio/fin + duración por defecto.
  - **Notificaciones**: toggles (email, recordatorio, vacuna por vencer).
  - **Apariencia**: selector tema `washi` (default) / `yoru` — único lugar donde se cambia.
  - **Seguridad**: cambio de contraseña (actual, nueva, repetir).

---

### BLOQUE G — Común a todos los roles

#### G1. `MisDatos` (己)
- Panel con datos del `AuthResponse` (id, nombre, apellido, email, telefono, role).
- `TokenStrip` destacado (JWT mono, label "TOKEN (24 h)", copiar 2s).
- Botón editar → form inline con `Field` validados.
- `Seal` del rol.

#### G2. `NotFound` (不存在)
- `Panel` centrado, kanji 404 estilizado, copy "Este pasillo no existe" + botón "Volver al panel".

---

## Componentes del sistema (además de las primitivas `.sk-*`)

| Componente | Descripción |
|------------|-------------|
| `Topbar` | 56px, logo, breadcrumb, campana, Seal, nombre, logout |
| `NavRail` | Navegación dirigida por role (§mapa) |
| `ContextRail` | 320px ≥1680px: cuenta + TokenStrip + logout |
| `Panel` | Contenedor blanco, borde hairline, radio 12px; `--sealed` con hilo kinari |
| `Seal` | Badge circular kanji por rol/estado, 28px, 999px |
| `Field` | Input 44px, label micro, error bajo blur/submit |
| `Button` | primary (matcha) / ghost / loading (barra matcha) |
| `Alert` | Traductor HTTP → español, `role="alert"` |
| `TokenStrip` | JWT mono en insignia, copiar |
| `StateBlock` | empty / loading / error / forbidden |
| `StatCard` | KPI: kanji + label micro + número display + delta |
| `DataTable` | Tabla head sticky, filas alternas `--sk-shade`, sort, paginación |
| `Badge` | Estado textual color-coded (usa tokens, no emoji) |
| `Tabs` | Navegación horizontal con barra matcha en activa |
| `Modal` | Overlay + Panel centrado, cierre Esc/overlay, focus trap, `--sk-shadow-overlay` |
| `Drawer` | Panel lateral derecho 480px para detalle rápido |
| `Timeline` / `TimelineItem` | Línea vertical + nodos para historial/agenda |
| `Calendar` | Mes/día, celdas con conteo de citas |
| `ChartBars` / `ChartDoughnut` / `ChartLine` | Gráficos SVG puros con tokens |
| `EmptyState` | Wrapper de `StateBlock` empty con kanji contextual |
| `Stepper` | Pasos (para factura / consulta) |
| `AvatarMascota` | Círculo 999px con inicial/placeholder + Seal especie |
| `Toast` | Confirmaciones efímeras, esquina inferior derecha |
| `ConfirmDialog` | Confirmación destructiva (cancelar, anular, eliminar) |
| `Pagination` | Anterior/siguiente + nº página |
| `Breadcrumb` | `SHINRYŪ-KAI ▸ módulo ▸ detalle` |
| `Textarea` | Variante multilínea de `Field` |
| `Select` | Select estilizado, mismo tratamiento que `Field` |
| `Checkbox` / `Toggle` | Controles de configuración |

**Iconografía**: kanji por módulo (tabla de navegación). Estados sin emoji — iconos SVG inline o glifos kanji. Todo icono semántico lleva `aria-label`.

---

## Reglas de estado (toda pantalla con datos)

`vacío` → `cargando` → `con datos` → `error` → `reintentar` — siempre. `error` y `reintentar` no son opcionales.

| Variante | Contenido | Acción |
|----------|-----------|--------|
| `empty` | kanji contextual + 1 línea copy | CTA de la pantalla |
| `loading` | barra progreso matcha (scaleX), sin texto "cargando" | ninguna |
| `error` | icono + Alert + path/status solo console | botón reintentar |
| `forbidden` | Panel con Seal acceso denegado | volver a LoginScreen |

---

## Sistema de diseño (tokens obligatorios)

**Archivos existentes**: `src/assets/css/tokens.css`, `src/assets/css/base.css`, `src/index.css` (importa ambos).

### Colores (modo claro default "washi")
```
--sk-paper: #F6F4EC       --sk-shade: #ECE8DC      --sk-ink: #2C3129
--sk-panel: #FFFFFF       --sk-text: #2C3129       --sk-text-2: #565C51
--sk-text-3: #6C7266      --sk-edge: #7E8474       --sk-hair: #E2DED0
--sk-matcha: #47694E (ÚNICO acento de acción)      --sk-matcha-hover: #3A5740
--sk-matcha-soft: #E3EDE2 --sk-on-matcha: #FFFFFF
--sk-beni: #9E4A47 (error) --sk-beni-hover: #833D3A --sk-beni-soft: #F6E3E1
--sk-on-beni: #FFFFFF
--sk-kinari: #A98A46 (hilo/sello) --sk-kinari-text: #6E5828 --sk-kinari-soft: #F2EAD6
--sk-ai: #3C5C78 (enlaces) --sk-ai-soft: #E4ECF3
--sk-sakura: #C97F8C (decorativo) --sk-sakura-soft: #F7E7E9
```

### Semántica de estado clínico (usar tokens existentes, sin colores nuevos)
| Semántica | Token |
|-----------|-------|
| Éxito / sano / AL_DIA / PAGADA / COMPLETADA / ACTIVO | `--sk-matcha` / `--sk-matcha-soft` |
| Alerta / PROXIMA / BAJO / PENDIENTE | `--sk-kinari-text` / `--sk-kinari-soft` |
| Peligro / VENCIDA / AGOTADO / CADUCADO / URGENCIA / CANCELADA | `--sk-beni` / `--sk-beni-soft` |
| Neutro / info / enlaces | `--sk-ai` sobre `--sk-panel` |

### Tipografía
- Display: `'Zen Maru Gothic', system-ui` — redondeada y cálida, peso 500, **sin mayúsculas forzadas**
- Body: `'Zen Kaku Gothic New', system-ui` — `line-height: 1.6`
- Mono: `'IBM Plex Mono', ui-monospace` — JWT, SKU, nº factura, IDs
- Mincho: `'Shippori Mincho', 'Noto Serif JP', serif` — kanji ornamental
- Labels/eyebrows: micro, mayúsculas, tracking +0.1em (único uso de mayúsculas)

### Espacio / Layout
- Grid 12 col, gap 16px, márgenes `clamp(24px, 3vw, 56px)`; entre bloques 24–32px (respirar = 間)
- `--sk-shell-max`: 1120px (1024-1439) → 1280px (1440-1679) → 1440px (1680-2199) → 1600px (≥2200)
- `--sk-navrail-w: 232px`, `--sk-rail-w: 320px`, `--sk-form-w: 440px`, `--sk-topbar-h: 56px`
- **Solo `min-width` media queries**. NUNCA `max-width` para encoger.

### Formas
- Radius: `12px` paneles, `8px` inputs/botones, `999px` sellos/avatar. **Sin cortes de cuchilla.**
- Hilo de kinari: `linear-gradient(90deg, #B9963F, #E6D29A 45%, #B9963F)` 1–2px, **máx 1 por pantalla**
- Textura asanoha/ichimatsu SVG opacity 0.04 detrás de paneles grandes
- Sombra solo en overlays: `--sk-shadow-overlay`

---

## Movimiento

- Ease: `cubic-bezier(0.25, 0.8, 0.25, 1)` (suave)
- Duraciones: 180ms estado, 260ms entrada, 360ms sello
- Sellos: `scale(1.25) → scale(1)` 360ms + opacity 0→1 (golpe suave, sin rebote)
- Modal/Drawer: entrada 260ms, overlay fade 180ms
- `prefers-reduced-motion: reduce` → animation none, transition 1ms

---

## Accesibilidad

- Contraste ≥4.5:1 texto, ≥3:1 bordes con significado
- Kanji decorativo = `aria-hidden`, texto siempre presente
- Foco visible siempre (doble anillo: washi + matcha)
- Errores `role="alert"`; Modal con focus trap y cierre Esc
- Tab order = orden visual
- Zoom 200% sin pérdida; sin scroll horizontal en 1024px
- `DataTable` usa `<table>` real con `scope` en cabeceras

---

## Prohibido (hard rules)

### Estilo
- Negro puro `#000` o blanco puro como fondo de página
- Rojo saturado tipo alarma; el error es `--sk-beni`, suave
- Oro/amarillo brillante; kinari solo como hilo o sello
- Texto de acción con `--sk-sakura` (es decorativo)
- Cortes de cuchilla (`clip-path` tipo espada) o radios >14px
- Degradados radiales, glassmorphism, sombras difusas (salvo `--sk-shadow-overlay`)
- Emoji como icono de estado o de módulo
- Mostrar 400/403/path/timestamp en pantalla
- Svástika en cualquier forma
- Librerías de gráficos (usar SVG puro con tokens)

### Responsive
- **Media queries `max-width`** — solo `min-width`, crece sumando columna
- **Layout móvil**: hamburger, bottom-nav, drawer de nav, 100vw, flex-wrap nav
- Colapsar `NavRail` a iconos
- Ocultar panel de marca de `AuthLayout`
- Segundo patrón de breakpoints

### Sistema
- Endpoint sin pantalla diseñada
- Rol sin fila en el mapa de navegación
- Colores/radios/sombras fuera de tokens
- Un spinner genérico donde va la barra de matcha
- Un componente exportando constantes (`react-refresh/only-export-components`)

---

## Entregables esperados de Stitch

Screens completas listas para copiar a:

```
src/pages/
├── Login.jsx              (A1)
├── Register.jsx           (A2)
├── Authenticated.jsx      (B1 — shell + outlet)
├── NotFound.jsx           (G2)
├── MisDatos.jsx           (G1)
├── Configuracion.jsx      (F6)
├── cliente/
│   ├── Panel.jsx          (C1)
│   ├── MisMascotas.jsx    (D1)
│   ├── MascotaDetalle.jsx (D2)
│   ├── MisCitas.jsx       (D3)
│   ├── MiHistorial.jsx    (D4)
│   └── MisFacturas.jsx    (D5)
├── veterinario/
│   ├── Panel.jsx          (C2)
│   ├── MiAgenda.jsx       (E1)
│   ├── Pacientes.jsx      (E2)
│   ├── HistoriaClinica.jsx(E3)
│   ├── NuevaConsulta.jsx  (E4)
│   ├── Vacunacion.jsx     (E5)
│   ├── Tratamientos.jsx   (E6)
│   └── Inventario.jsx     (E7)
└── admin/
    ├── Panel.jsx          (C3)
    ├── Usuarios.jsx       (F1)
    ├── Servicios.jsx      (F2)
    ├── Facturacion.jsx    (F3)
    ├── Reportes.jsx       (F4)
    ├── Auditoria.jsx      (F5)
    └── Inventario.jsx     (E7 compartido)

src/layout/
├── AuthLayout.jsx
├── AuthedShell.jsx
├── NavRail.jsx            (+ nav-map.js mapa por rol)
├── ContextRail.jsx
└── Topbar.jsx

src/component/
├── Seal.jsx               (+ seal-roles.js / seal-estados.js)
├── Field.jsx · Textarea.jsx · Select.jsx · Checkbox.jsx · Toggle.jsx
├── Button.jsx · ConfirmDialog.jsx
├── Alert.jsx · Toast.jsx
├── TokenStrip.jsx · Panel.jsx · StateBlock.jsx
├── StatCard.jsx · DataTable.jsx · Pagination.jsx · Badge.jsx · Tabs.jsx
├── Modal.jsx · Drawer.jsx · Stepper.jsx
├── Timeline.jsx · TimelineItem.jsx · Calendar.jsx
├── ChartBars.jsx · ChartDoughnut.jsx · ChartLine.jsx
├── AvatarMascota.jsx · Breadcrumb.jsx
└── (seal-roles, nav-map, seal-estados NO exportan componentes)

src/api/
├── axios.js               (existente — no tocar)
└── mocks/                 (datos de ejemplo por entidad del §modelo)
```

Cada screen declara `@endpoint` objetivo en comentario y usa `StateBlock` para los 4 estados no-afectivos.

---

## Convenciones de código

- Un componente por archivo en `src/component/` (singular).
- `react-refresh/only-export-components`: mapas de constantes (`nav-map.js`, `seal-roles.js`, `seal-estados.js`) van en archivo aparte.
- Estilos con clases `.sk-*` de `base.css` + CSS por componente. No librerías de UI ni CSS-in-JS.
- Nombres de página canónicos = los del `DESIGN.md`.
- Todo texto de UI en **español**; kanji solo como ornamento.

---

## Configuración Stitch

El enum de fuentes de Stitch no incluye Zen Maru Gothic ni Zen Kaku Gothic New, así que se usan las más cercanas (redondeadas/geométricas):

- `customColor`: `#47694E` (--sk-matcha)
- `headlineFont`: `MANROPE`
- `bodyFont`: `NUNITO_SANS`
- `labelFont`: `JETBRAINS_MONO`
- `colorMode`: `LIGHT` (washi es el default)
- `roundness`: `ROUND_EIGHT`

---

## Orden de implementación

1. `tokens.css` + `base.css` + `index.css` (gamut, primitivas, breakpoints).
2. `Field` + `Button` + `sk-gate`.
3. `LoginScreen` (E2) + `AuthLayout` — valida el 403 real.
4. `Alert` + `StateBlock`.
5. `RegisterScreen` (E1).
6. `Seal` + `TokenStrip` + `Panel--sealed`.
7. `AuthedShell` + `NavRail` + `ContextRail` + `Topbar`.
8. Paneles por rol (C1–C3).
9. Módulos de datos: `DataTable`, `Badge`, `StatCard`, `Tabs`, `Modal`, `Drawer`, `Timeline`, `Calendar`, `Chart*`.
10. Módulos CLIENTE → VETERINARIO → ADMIN.
11. Textura de fondo e hilo de kinari (último).

---

## Checklist de cobertura

- [ ] ¿Cada rol ve exactamente su fila del mapa de navegación?
- [ ] ¿Cada pantalla con datos tiene los 4 estados + reintentar?
- [ ] ¿Ningún copy de error menciona un status HTTP?
- [ ] ¿El layout crece con `min-width` y no tiene `max-width` de diseño?
- [ ] ¿Por debajo de 1024px se ve `sk-gate`?
- [ ] ¿Todos los colores vienen de los tokens?
- [ ] ¿Los estados clínicos usan la semántica matcha/beni/kinari?
- [ ] ¿Los gráficos son SVG con tokens, sin librería?
- [ ] ¿Las tablas usan `<table>` semántico con `scope`?
- [ ] ¿Ningún componente exporta constantes además del componente?

---

## Nota final

El `DESIGN.md` en `Practica2IngWeb/DESIGN.md` es la **fuente de verdad absoluta**. Este prompt lo amplía al dominio veterinario completo. Si hay conflicto, gana `DESIGN.md`.

**Genera primero LoginScreen + AuthLayout** (valida el 403 real), luego RegisterScreen, luego AuthedShell + NavRail + paneles por rol, y por último los módulos de datos. Cada paso deja la app usable.
