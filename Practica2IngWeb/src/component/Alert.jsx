const GLYPH = Object.freeze({
  ok: '入',
  denied: '拒',
  fail: '敗',
  net: '断',
})

export default function Alert({ tone = 'error', title, children, meta }) {
  if (meta) {
    console.info('[sk-alert] para soporte:', meta)
  }
  return (
    <div className={`sk-alert sk-alert--${tone === 'ok' ? 'ok' : 'error'}`} role="alert">
      <span className="sk-alert__glyph" aria-hidden="true">
        {GLYPH[tone] ?? '告'}
      </span>
      <div>
        <p className="sk-alert__title">{title}</p>
        {children ? <p className="sk-alert__body">{children}</p> : null}
      </div>
    </div>
  )
}