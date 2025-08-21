import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { ProjectProvider } from './contexts/ProjectContext.jsx'

function App() {
  return (
    <div className="w-full min-h-screen">
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/project/:projectId" 
        element={isAuthenticated ? <KanbanBoard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
      />
    </Routes>
  )
}

export default App 