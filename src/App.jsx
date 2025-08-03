import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { ProjectProvider } from './contexts/ProjectContext.jsx'

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ProjectProvider>
    </AuthProvider>
  )
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  
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