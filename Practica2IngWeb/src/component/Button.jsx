export default function Button({
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled = false,
  children,
  className = '',
  onClick,
}) {
  return (
    <button
      type={type}
      className={`sk-btn sk-btn--${variant} ${loading ? 'sk-btn--loading' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="sk-progress" role="progressbar" aria-label="Cargando" />
      ) : (
        children
      )}
    </button>
  )
}