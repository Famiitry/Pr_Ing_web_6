import { PANEL_PATH } from '../lib/roles.js'
import { Link } from 'react-router-dom'

export default function ActionChip({ to = PANEL_PATH, children }) {
  return (
    <Link to={to} className="sk-chip">
      <span className="sk-chip__kanji" aria-hidden="true">
        戻
      </span>
      {children ?? 'Volver al panel'}
    </Link>
  )
}