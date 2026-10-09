import { ROLES } from '../lib/roles.js'

const SEAL_TEMPERA = Object.freeze({
  CLIENTE: 'kinari',
  VETERINARIO: 'matcha',
  ADMIN: 'beni',
})

export default function Seal({ role, size = 28, className = '' }) {
  const cfg = ROLES[role] ?? { kanji: '●', nombre: role }
  const tempera = SEAL_TEMPERA[role] ?? 'kinari'
  return (
    <span
      className={`sk-seal sk-seal--${tempera} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Rol: ${cfg.nombre}`}
      title={cfg.nombre}
    >
      <span aria-hidden="true">{cfg.kanji}</span>
    </span>
  )
}