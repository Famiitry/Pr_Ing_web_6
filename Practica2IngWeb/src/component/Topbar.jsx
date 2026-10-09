import { useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../lib/roles.js'
import Seal from './Seal.jsx'

export default function Topbar({ session }) {
  const location = useLocation()
  const items = NAV_ITEMS[session.role] ?? []
  const current = items.find((item) =>
    item.to === '/panel'
      ? location.pathname === '/' || location.pathname === '/panel'
      : location.pathname === item.to,
  )

  return (
    <header className="sk-topbar">
      <span className="sk-topbar__brand" aria-hidden="true">
        SHINRYŪ-KAI
      </span>
      <span className="sk-topbar__crumb">
        ▸ <span aria-hidden="true">{current ? current.kanji : '—'}</span>{' '}
        {current ? current.label : 'Sistema'}
      </span>
      <div className="sk-topbar__right">
        <span className="sk-topbar__name">{session.nombre}</span>
        <Seal role={session.role} />
      </div>
    </header>
  )
}