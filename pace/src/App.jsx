import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import PhoneFrame from './components/layout/PhoneFrame'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Today from './pages/Today'
import Plans from './pages/Plans'
import Profile from './pages/Profile'
import PlanChat from './pages/PlanChat'
import Admin from './pages/Admin'

function AppRoutes() {
  const user = useStore((s) => s.user)

  if (!user) {
    return (
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/today" replace />} />
      <Route path="/today" element={<Today />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/plans/:planId/chat" element={<PlanChat />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/today" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route
        path="*"
        element={
          <PhoneFrame>
            <AppRoutes />
          </PhoneFrame>
        }
      />
    </Routes>
  )
}
