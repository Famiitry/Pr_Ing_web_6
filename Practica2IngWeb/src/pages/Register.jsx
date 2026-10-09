import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { register } from '../api/auth.js'
import { useSession } from '../store/session.js'
import { PANEL_PATH, ROLE_LIST } from '../lib/roles.js'
import {
  validateApellido,
  validateEmail,
  validateNombre,
  validatePassword,
  validateRole,
  validateTelefono,
} from '../lib/validate.js'
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
  if (error.response.status === 409) {
    return {
      title: 'Ese correo ya está registrado.',
      detail: 'Prueba a iniciar sesión o usa otro correo.',
      tone: 'denied',
      meta: { phase: '409 duplicado' },
    }
  }
  return {
    title: 'No se pudo crear la cuenta.',
    detail: 'Revisa los datos e inténtalo de nuevo (código ' +
      `${error.response.status ?? 'desconocido'}).`,
    tone: 'fail',
    meta: { phase: `registro ${error.response.status ?? '?'}` },
  }
}

const EMPTY = { nombre: '', apellido: '', email: '', password: '', telefono: '', role: 'CLIENTE' }

export default function Register() {
  const { session, login: setSession } = useSession()
  const navigate = useNavigate()

  const [values, setValues] = useState(EMPTY)
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
      nombre: validateNombre(values.nombre),
      apellido: validateApellido(values.apellido),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      telefono: validateTelefono(values.telefono),
      role: validateRole(values.role),
    }
    const hasErrors = Object.values(next).some(Boolean)
    setErrors(next)
    setSubmitted(true)
    if (hasErrors) return

    setBusy(true)
    setFailure(null)
    try {
      const payload = {
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim() || null,
        email: values.email.trim(),
        password: values.password,
        telefono: values.telefono.trim() || null,
        role: values.role,
      }
      const res = await register(payload)
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
            ¿Ya tienes cuenta? <Link to="/login" className="sk-link">Entra aquí</Link>
          </p>
        </>
      }
    >
      <header className="sk-form__head">
        <p className="sk-label">Alta en el recinto</p>
        <h2>Crear cuenta</h2>
      </header>
      {failure ? (
        <Alert tone={failure.tone} title={failure.title} meta={failure.meta}>
          {failure.detail}
        </Alert>
      ) : null}
      <form className="sk-form" onSubmit={submit} noValidate>
        <Field
          label="Nombre"
          name="nombre"
          value={values.nombre}
          onChange={setField('nombre')}
          error={errors.nombre}
          submitted={submitted}
          required
        />
        <Field
          label="Apellido"
          name="apellido"
          value={values.apellido}
          onChange={setField('apellido')}
          error={errors.apellido}
          submitted={submitted}
        />
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
          autoComplete="new-password"
          value={values.password}
          onChange={setField('password')}
          error={errors.password}
          hint="Al menos 6 caracteres."
          submitted={submitted}
          required
        />
        <Field
          label="Teléfono"
          name="telefono"
          type="tel"
          autoComplete="tel"
          value={values.telefono}
          onChange={setField('telefono')}
          error={errors.telefono}
          submitted={submitted}
        />
        <Field
          label="Rol"
          name="role"
          as="select"
          value={values.role}
          onChange={setField('role')}
          error={errors.role}
          options={ROLE_LIST}
          submitted={submitted}
          required
        />
        <Button type="submit" variant="primary" loading={busy} disabled={busy}>
          Crear cuenta
        </Button>
      </form>
    </AuthLayout>
  )
}