import { useId, useState } from 'react'

export default function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  required = false,
  autoComplete,
  placeholder,
  as = 'input',
  options = [],
  submitted = false,
  className = '',
}) {
  const uid = useId()
  const [touched, setTouched] = useState(false)
  const showError = Boolean(error) && (touched || submitted)

  const shared = {
    id: uid,
    name,
    value,
    onBlur: () => setTouched(true),
    onChange,
    'aria-describedby': hint ? `${uid}-hint` : undefined,
    'aria-invalid': Boolean(error) || undefined,
  }

  let control
  if (as === 'select') {
    control = (
      <select className="sk-field__input" {...shared}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.nombre}
          </option>
        ))}
      </select>
    )
  } else {
    control = (
      <input
        className="sk-field__input"
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        {...shared}
      />
    )
  }

  return (
    <label
      className={`sk-field ${showError ? 'sk-field--invalid' : ''} ${className}`}
    >
      <span className="sk-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : ''}
      </span>
      {control}
      {hint ? (
        <span className="sk-field__hint" id={`${uid}-hint`}>
          {hint}
        </span>
      ) : null}
      {showError ? (
        <span className="sk-field__error" role="alert">
          <span aria-hidden="true">◆</span>
          {error}
        </span>
      ) : null}
    </label>
  )
}