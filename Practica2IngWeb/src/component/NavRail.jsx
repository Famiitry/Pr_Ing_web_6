import { NavLink, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from '../lib/roles.js'
import { useSession } from '../store/session.js'

export default function NavRail({ role }) {
  const { logout } = useSession()
  const navigate = useNavigate()
  const items = NAV_ITEMS[role] ?? []

  function signOut() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="sk-navrail" aria-label="Navegación principal">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/panel'}
          className={({ isActive }) =>
            `sk-navrail__item${isActive ? ' sk-navrail__item--active' : ''}`
          }
        >
          <span className="sk-navrail__kanji" aria-hidden="true">
            {item.kanji}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
      <hr className="sk-navrail__sep" aria-hidden="true" />
      <button type="button" className="sk-navrail__item sk-navrail__item--logout" onClick={signOut}>
        <span className="sk-navrail__kanji" aria-hidden="true">
          退
        </span>
        <span>Cerrar sesión</span>
      </button>
    </nav>
  )
}