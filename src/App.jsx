import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ModernLogin from './components/login'
import Dashboard from './components/Dashboard'



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ModernLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
