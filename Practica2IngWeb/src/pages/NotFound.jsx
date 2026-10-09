import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="sk-404">
      <div className="sk-gate-ok">
        <p className="sk-404__code">404</p>
        <p className="sk-label">Registro no encontrado</p>
        <h1 className="sk-module__title">La página no existe en el recinto.</h1>
        <p className="sk-prose">
          Puede que la dirección haya cambiado o que el enlace esté roto.
        </p>
        <Link to="/" className="sk-btn sk-btn--primary">
          Volver al inicio
        </Link>
      </div>
      <div className="sk-gate" aria-hidden="true">
        <div className="sk-gate__inner">
          <p className="sk-prose">Esta pantalla está pensada para escritorio.</p>
          <p className="sk-prose">Mínimo 1024&nbsp;px de ancho.</p>
        </div>
      </div>
    </div>
  )
}