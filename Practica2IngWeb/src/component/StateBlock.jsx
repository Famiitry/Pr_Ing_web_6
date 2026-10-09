import Button from './Button.jsx'

export default function StateBlock({ variant = 'loading', kanji = '', title, body, onRetry }) {
  if (variant === 'loading') {
    return (
      <div className="sk-block" aria-live="polite">
        <span className="sk-block__bar">
          <span className="sk-progress" role="progressbar" aria-label="Cargando" />
        </span>
      </div>
    )
  }

  if (variant === 'empty') {
    return (
      <div className="sk-block sk-block--empty">
        {kanji ? (
          <span className="sk-block__kanji" aria-hidden="true">
            {kanji}
          </span>
        ) : null}
        <h3>{title}</h3>
        {body ? <p className="sk-prose">{body}</p> : null}
      </div>
    )
  }

  return (
    <div className="sk-block">
      <div className="sk-alert sk-alert--error" role="alert">
        <span className="sk-alert__glyph" aria-hidden="true">
          ◆
        </span>
        <div>
          <p className="sk-alert__title">{title ?? 'El servidor no responde'}</p>
          {body ? <p className="sk-alert__body">{body}</p> : null}
        </div>
      </div>
      {onRetry ? (
        <Button variant="ghost" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}