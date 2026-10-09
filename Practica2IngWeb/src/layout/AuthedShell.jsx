import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../store/session.js'
import Topbar from '../component/Topbar.jsx'
import NavRail from '../component/NavRail.jsx'
import ContextRail from '../component/ContextRail.jsx'

export default function AuthedShell() {
  const { session } = useSession()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="sk-shell">
      <Topbar session={session} />
      <div className="sk-shell__body">
        <NavRail role={session.role} />
        <main className="sk-shell__content">
          <Outlet context={{ session }} />
        </main>
        <ContextRail session={session} />
      </div>
      <footer className="sk-shell__footer" aria-hidden="true" />
      <div className="sk-gate" aria-hidden="true">
        <div className="sk-gate__inner">
          <p className="sk-prose">Esta pantalla está pensada para escritorio.</p>
          <p className="sk-prose">Mínimo 1024&nbsp;px de ancho.</p>
        </div>
      </div>
    </div>
  )
}