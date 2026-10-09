import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { login } from '../api/auth.js'
import { useSession } from '../store/session.js'
import { PANEL_PATH } from '../lib/roles.js'
import { validateEmail, validatePassword } from '../lib/validate.js'
import AuthLayout from '../layout/AuthLayout.jsx'
import Field from '../component/Field.jsx'
import Button from '../component/Button.jsx'
import Alert from '../component/Alert.jsx'

function describeError(error) {
  if (!error.response) {
    return {
      title: 'No se pudo conectar con el servidor.',
      detail: 'Comprueba que auth-service esté encendido (puerto 8081).',
      tone: 'net',
      meta: { phase: 'conexión' },
    }
  }
  if (error.response.status === 403) {
    return {
      title: 'Credenciales incorrectas.',
      detail: 'Revisa el correo y la contraseña.',
      tone: 'denied',
      meta: { phase: '403 sin autenticar' },
    }
  }
  if (error.response.status === 400) {
    return {
      title: 'No se pudo iniciar sesión.',
      detail: 'Revisa los campos e inténtalo de nuevo.',
      tone: 'fail',
      meta: { phase: '400' },
    }
  }
  return {
    title: 'Algo salió mal al iniciar sesión.',
    detail: `Código ${error.response.status ?? 'desconocido'}.`,
    tone: 'fail',
    meta: { phase: 'otro código' },
  }
}

export default function Login() {
  const { session, login: setSession } = useSession()
  const navigate = useNavigate()

  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState(null)

  if (session) {
    return <Navigate to={PANEL_PATH} replace />
  }

  function setField(name) {
    return (event) => {
      setValues((prev) => ({ ...prev, [name]: event.target.value }))
      setErrors((prev) => ({ ...prev, [name]: '' }))
      setFailure(null)
    }
  }

  async function submit(event) {
    event.preventDefault()
    const next = {
      email: !values.email.trim() ? 'Escribe tu correo electrónico.' : validateEmail(values.email),
      password: !values.password ? 'Escribe una contraseña.' : validatePassword(values.password),
    }
    const hasErrors = Object.values(next).some(Boolean)
    setErrors(next)
    setSubmitted(true)
    if (hasErrors) return

    setBusy(true)
    setFailure(null)
    try {
      const res = await login(values.email.trim(), values.password)
      setSession({
        token: res.data.token,
        id: res.data.id,
        nombre: res.data.nombre,
        email: res.data.email,
        role: res.data.role,
      })
      navigate(PANEL_PATH, { replace: true })
    } catch (error) {
      setFailure(describeError(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      footer={
        <>
          <span className="sk-auth__sep" aria-hidden="true" />
          <p className="sk-prose">
            ¿No tienes cuenta? <Link to="/register" className="sk-link">Crea una aquí</Link>
          </p>
        </>
      }
    >
      <header className="sk-form__head">
        <p className="sk-label">Entrada al recinto</p>
        <h2>Iniciar sesión</h2>
      </header>
      {failure ? (
        <Alert tone={failure.tone} title={failure.title} meta={failure.meta}>
          {failure.detail}
        </Alert>
      ) : null}
      <form className="sk-form" onSubmit={submit} noValidate>
        <Field
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={setField('email')}
          error={errors.email}
          submitted={submitted}
          required
        />
        <Field
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={setField('password')}
          error={errors.password}
          submitted={submitted}
          required
        />
        <Button type="submit" variant="primary" loading={busy} disabled={busy}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}