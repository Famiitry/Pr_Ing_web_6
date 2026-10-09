import { useOutletContext } from 'react-router-dom'
import { NAV_ITEMS } from '../lib/roles.js'
import StateBlock from '../component/StateBlock.jsx'
import ActionChip from '../component/ActionChip.jsx'

export default function ModulePlaceholder({ item }) {
  const { session } = useOutletContext()
  const allowed = (NAV_ITEMS[session.role] ?? []).some((i) => i.to === item.to)

  if (!allowed) {
    return (
      <section className="sk-module">
        <StateBlock
          variant="denied"
          title="No tienes acceso a este módulo."
          body={`El rol ${session.role} no puede ver «${item.label}».`}
        />
      </section>
    )
  }

  return (
    <section className="sk-module">
      <header className="sk-module__head">
        <div>
          <p className="sk-label">Módulo</p>
          <h1 className="sk-module__title">{item.label}</h1>
        </div>
        <span className="sk-module__kanji" aria-hidden="true">
          {item.kanji}
        </span>
      </header>
      <StateBlock
        variant="empty"
        kanji={item.kanji}
        title="En construcción"
        body="Esta pantalla ya está diseñada en Stitch (project 568074681588512332); pendiente de implementar contra la API."
      />
      <ActionChip />
    </section>
  )
}