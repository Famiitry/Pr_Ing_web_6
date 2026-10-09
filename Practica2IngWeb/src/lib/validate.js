const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+()\-\s\d]{6,15}$/

export function validateNombre(value) {
  if (!value || !value.trim()) return 'Escribe tu nombre.'
  if (value.trim().length < 2 || value.trim().length > 50) {
    return 'El nombre tiene que tener entre 2 y 50 caracteres.'
  }
  return ''
}

export function validateApellido(value) {
  if (value && value.trim().length > 50) {
    return 'El apellido no puede superar los 50 caracteres.'
  }
  return ''
}

export function validateEmail(value) {
  const v = value.trim()
  if (!v) return 'Escribe tu correo electrónico.'
  if (!EMAIL_RE.test(v)) return 'El correo no tiene un formato válido.'
  return ''
}

export function validatePassword(value) {
  if (!value) return 'Escribe una contraseña.'
  if (value.length < 6) return 'La contraseña necesita al menos 6 caracteres.'
  return ''
}

export function validateTelefono(value) {
  if (!value) return ''
  if (!PHONE_RE.test(value.trim())) return 'Revisa el teléfono (formato 900 123 456).'
  return ''
}

export function validateRole(value) {
  if (!value) return 'Elige un rol.'
  return ''
}