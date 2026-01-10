import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainScreen from '@/pages/MainScreen'
import EditScreen from '@/pages/EditScreen'
import AddScreen from '@/pages/AddScreen'
import LoginScreen from '@/pages/LoginScreen'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <AddScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <EditScreen />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
