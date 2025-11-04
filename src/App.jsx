import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ModernLogin from './components/login'
import Dashboard from './components/Dashboard'
import RequireAuth from './components/RequireAuth'



function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de login accesible siempre */}
        <Route path="/" element={<ModernLogin />} />

        {/* Rutas protegidas (requieren estar autenticado) */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
