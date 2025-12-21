import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, tokenService } from '../services/api.js'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = tokenService.getToken()
    if (token) {
      loadCurrentUser(token)
    } else {
      setLoading(false)
    }
  }, [])

  const loadCurrentUser = async (token) => {
    console.log('👤 AuthContext: Loading current user with token')
    try {
      const userData = await authAPI.getCurrentUser(token)
      console.log('✅ AuthContext: User data received:', userData)
      setUser(userData)
    } catch (error) {
      console.error('❌ AuthContext: Error loading current user:', error)
      tokenService.removeToken()
    } finally {
      setLoading(false)
      console.log('🏁 AuthContext: User loading completed')
    }
  }

  const login = async (email, password) => {
    console.log('🔐 AuthContext: Starting login process')
    setLoading(true)
    setError(null)
    
    try {
      console.log('📤 AuthContext: Calling backend API')
      const response = await authAPI.login(email, password)
      console.log('✅ AuthContext: Backend response received:', response)
      
      tokenService.setToken(response.access_token)
      console.log('💾 AuthContext: Token stored in localStorage')
      
      await loadCurrentUser(response.access_token)
      console.log('👤 AuthContext: Current user loaded')
      
      return response
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
      console.log('🏁 AuthContext: Login process completed')
    }
  }

  const googleLogin = async (idToken) => {
    console.log('🔐 AuthContext: Starting Google OAuth login process')
    console.log('🔑 ID Token received, length:', idToken ? idToken.length : 'No token')
    setLoading(true)
    setError(null)
    
    try {
      console.log('📤 AuthContext: Calling backend Google OAuth API')
      
      // Remove timeout - let the backend take as long as it needs
      const response = await authAPI.googleLogin(idToken)
      
      console.log('✅ AuthContext: Google OAuth backend response received:', response)
      
      tokenService.setToken(response.access_token)
      console.log('💾 AuthContext: Google OAuth token stored in localStorage')
      
      await loadCurrentUser(response.access_token)
      console.log('👤 AuthContext: Google OAuth current user loaded')
      
      return response
    } catch (error) {
      console.error('❌ AuthContext: Google OAuth login error:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
      console.log('🏁 AuthContext: Google OAuth login process completed')
    }
  }

  const register = async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await authAPI.register(email, password)
      // After registration, automatically log in
      await login(email, password)
      return response
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setError(null)
    tokenService.removeToken()
  }

  const clearError = () => {
    setError(null)
  }

  // Compute authentication status
  const isAuthenticated = !!user

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    googleLogin,
    register,
    logout,
    clearError,
    loadCurrentUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 