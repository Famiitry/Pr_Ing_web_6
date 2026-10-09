import { useOutletContext } from 'react-router-dom'
import Seal from '../component/Seal.jsx'

const KPI = Object.freeze({
  CLIENTE: Object.freeze([
    Object.freeze({ label: 'Mascotas registradas', value: '—' }),
    Object.freeze({ label: 'Próximas citas', value: '—' }),
    Object.freeze({ label: 'Historial', value: '—' }),
  ]),
  VETERINARIO: Object.freeze([
    Object.freeze({ label: 'Citas hoy', value: '—' }),
    Object.freeze({ label: 'Pacientes activos', value: '—' }),
    Object.freeze({ label: 'Vacunas esta semana', value: '—' }),
  ]),
  ADMIN: Object.freeze([
    Object.freeze({ label: 'Usuarios', value: '—' }),
    Object.freeze({ label: 'Citas hoy', value: '—' }),
    Object.freeze({ label: 'Facturación del mes', value: '—' }),
  ]),
})

const SUB = Object.freeze({
  CLIENTE: 'Tu rincón del recinto',
  VETERINARIO: 'Situación de hoy en la clínica',
  ADMIN: 'Métricas del sistema',
})

export default function Panel() {
  const { session } = useOutletContext()
  const cards = KPI[session.role] ?? []
  const sub = SUB[session.role] ?? ''

  return (
    <section className="sk-module" aria-labelledby="panel-title">
      <header className="sk-module__head">
        <div>
          <p className="sk-label">Panel</p>
          <h1 id="panel-title" className="sk-module__title">
            {sub}
          </h1>
          <p className="sk-prose">Sesión iniciada como {session.email}.</p>
        </div>
        <Seal role={session.role} size={48} />
      </header>

      <div className="sk-kpis">
        {cards.map((card) => (
          <article className="sk-kpi" key={card.label}>
            <p className="sk-label">{card.label}</p>
            <p className="sk-kpi__value">{card.value}</p>
          </article>
        ))}
      </div>

      <p className="sk-panel-hint">
        Los módulos diseñados en Stitch se irán conectando uno a uno. El token de
        sesión está a la derecha para probar la API desde el navegador.
      </p>
    </section>
  )
}