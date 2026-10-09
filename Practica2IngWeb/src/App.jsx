import { Route, Routes } from 'react-router-dom'
import AuthedShell from './layout/AuthedShell.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Panel from './pages/Panel.jsx'
import ModulePlaceholder from './pages/ModulePlaceholder.jsx'
import NotFound from './pages/NotFound.jsx'
import { NAV_ITEMS } from './lib/roles.js'

const ALL_MODULES = Object.values(NAV_ITEMS)
  .flat()
  .filter((item, index, items) => items.findIndex((i) => i.to === item.to) === index)

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AuthedShell />}>
        <Route path="/" element={<Panel />} />
        <Route path="/panel" element={<Panel />} />
        {ALL_MODULES
          .filter((item) => item.to !== '/panel')
          .map((item) => (
            <Route
              key={item.to}
              path={item.to}
              element={<ModulePlaceholder item={item} />}
            />
          ))}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}