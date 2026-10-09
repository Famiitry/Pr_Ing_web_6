export default function AuthLayout({ children, footer }) {
  return (
    <div className="sk-auth">
      <div className="sk-auth__brand">
        <span className="sk-auth__texture" aria-hidden="true" />
        <span className="sk-auth__kanji" aria-hidden="true">
          診療会
        </span>
        <div className="sk-auth__brand-copy">
          <p className="sk-label">診療 — tratamiento clínico</p>
          <h1>SHINRYŪ-KAI</h1>
          <p className="sk-prose">
            Gestión veterinaria con la calma de un jardín de té.
          </p>
        </div>
        <div className="sk-auth__thread" aria-hidden="true" />
      </div>
      <div className="sk-auth__form">
        <div className="sk-auth__card">
          {children}
          {footer ? <div className="sk-auth__footer">{footer}</div> : null}
        </div>
      </div>
      <div className="sk-gate" aria-hidden="true">
        <div className="sk-gate__inner">
          <span className="sk-gate__kanji">診療会</span>
          <p className="sk-prose">Esta pantalla está pensada para escritorio.</p>
          <p className="sk-prose">Mínimo 1024&nbsp;px de ancho.</p>
        </div>
      </div>
    </div>
  )
}