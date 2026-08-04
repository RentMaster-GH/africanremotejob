import { Routes, Route } from 'react-router-dom'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <Routes>
      {/* Your home or landing page component goes here */}
      <Route path="/" element={<div>Welcome to African Remote Job</div>} />

      {/* Auth Callback Route */}
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  )
}

export default App