import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import GoogleCallback from './components/GoogleCallback.jsx'
import Dashboard from './components/Dashboard.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'
import Recent from './components/Recent.jsx'
import Starred from './components/Starred.jsx'
import TeamWorkspace from './components/TeamWorkspace.jsx'
import TeamsList from './components/TeamsList.jsx'
import Layout from './components/Layout.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { ProjectProvider } from './contexts/ProjectContext.jsx'
import { TopNavProvider } from './contexts/TopNavContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'

function App() {
  return (
    <div className="w-full min-h-screen">
      <AuthProvider>
        <ProjectProvider>
          <TopNavProvider>
            <NotificationProvider>
              <Router>
                <AppRoutes />
              </Router>
            </NotificationProvider>
          </TopNavProvider>
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
        path="/auth/google/callback" 
        element={<GoogleCallback />} 
      />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? (
          <Layout>
            <Dashboard />
          </Layout>
        ) : <Navigate to="/login" />} 
      />
      <Route 
        path="/project/:projectId" 
        element={isAuthenticated ? (
          <Layout>
            <KanbanBoard />
          </Layout>
        ) : <Navigate to="/login" />} 
      />
      <Route 
        path="/recent" 
        element={isAuthenticated ? (
          <Layout>
            <Recent />
          </Layout>
        ) : <Navigate to="/login" />} 
      />
      <Route 
        path="/starred" 
        element={isAuthenticated ? (
          <Layout>
            <Starred />
          </Layout>
        ) : <Navigate to="/login" />} 
      />
      <Route 
        path="/teams" 
        element={isAuthenticated ? (
          <Layout>
            <TeamsList />
          </Layout>
        ) : <Navigate to="/login" />} 
      />
      <Route 
        path="/team/:teamId" 
        element={isAuthenticated ? (
          <Layout>
            <TeamWorkspace />
          </Layout>
        ) : <Navigate to="/login" />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
      />
    </Routes>
  )
}

export default App 