import { useCallback, useState } from 'react'
import { SessionContext } from './session.js'

export default function SessionProvider({ children }) {
  const [session, setSession] = useState(null)

  const login = useCallback((data) => setSession(data), [])
  const logout = useCallback(() => setSession(null), [])

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  )
}