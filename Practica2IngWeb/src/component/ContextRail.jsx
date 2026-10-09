import Seal from './Seal.jsx'
import TokenStrip from './TokenStrip.jsx'

export default function ContextRail({ session }) {
  return (
    <aside className="sk-rail" aria-label="Sesión">
      <Seal role={session.role} size={48} />
      <div>
        <p className="sk-label">Sesión</p>
        <h2 className="sk-rail__name">{session.nombre}</h2>
        <p className="sk-rail__email">{session.email}</p>
      </div>
      <TokenStrip token={session.token} />
    </aside>
  )
}