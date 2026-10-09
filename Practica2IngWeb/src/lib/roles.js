export const ROLES = Object.freeze({
  CLIENTE: { kanji: '客', nombre: 'Cliente' },
  VETERINARIO: { kanji: '獣', nombre: 'Veterinario' },
  ADMIN: { kanji: '総', nombre: 'Administrador' },
})

export const ROLE_LIST = Object.freeze([
  Object.freeze({ value: 'CLIENTE', ...ROLES.CLIENTE }),
  Object.freeze({ value: 'VETERINARIO', ...ROLES.VETERINARIO }),
  Object.freeze({ value: 'ADMIN', ...ROLES.ADMIN }),
])

export const NAV_ITEMS = Object.freeze({
  CLIENTE: Object.freeze([
    Object.freeze({ to: '/panel', kanji: '盤', label: 'Panel' }),
    Object.freeze({ to: '/mascotas', kanji: '獣', label: 'Mis mascotas' }),
    Object.freeze({ to: '/citas', kanji: '刻', label: 'Mis citas' }),
    Object.freeze({ to: '/historial', kanji: '歴', label: 'Historial' }),
    Object.freeze({ to: '/facturas', kanji: '札', label: 'Facturas' }),
    Object.freeze({ to: '/mis-datos', kanji: '己', label: 'Mis datos' }),
  ]),
  VETERINARIO: Object.freeze([
    Object.freeze({ to: '/panel', kanji: '盤', label: 'Panel' }),
    Object.freeze({ to: '/agenda', kanji: '刻', label: 'Mi agenda' }),
    Object.freeze({ to: '/pacientes', kanji: '患', label: 'Pacientes' }),
    Object.freeze({ to: '/consultas', kanji: '診', label: 'Consultas' }),
    Object.freeze({ to: '/vacunas', kanji: '疫', label: 'Vacunación' }),
    Object.freeze({ to: '/tratamientos', kanji: '薬', label: 'Tratamientos' }),
    Object.freeze({ to: '/inventario', kanji: '庫', label: 'Inventario' }),
    Object.freeze({ to: '/mis-datos', kanji: '己', label: 'Mis datos' }),
  ]),
  ADMIN: Object.freeze([
    Object.freeze({ to: '/panel', kanji: '盤', label: 'Panel' }),
    Object.freeze({ to: '/usuarios', kanji: '員', label: 'Usuarios' }),
    Object.freeze({ to: '/servicios', kanji: '役', label: 'Servicios' }),
    Object.freeze({ to: '/facturacion', kanji: '円', label: 'Facturación' }),
    Object.freeze({ to: '/inventario', kanji: '庫', label: 'Inventario' }),
    Object.freeze({ to: '/reportes', kanji: '報', label: 'Reportes' }),
    Object.freeze({ to: '/auditoria', kanji: '監', label: 'Auditoría' }),
    Object.freeze({ to: '/configuracion', kanji: '設', label: 'Configuración' }),
    Object.freeze({ to: '/mis-datos', kanji: '己', label: 'Mis datos' }),
  ]),
})

export const PANEL_PATH = '/panel'