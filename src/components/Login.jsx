import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { tokenService } from '../services/api.js'
import { LogIn, User, Lock, X } from 'lucide-react'
import GoogleLogin from './GoogleLogin.jsx'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const { login, error, clearError, loadCurrentUser } = useAuth()

  // Handle OAuth callback - backend redirects here with token
  useEffect(() => {
    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')
    
    if (errorParam) {
      console.error('OAuth error:', errorParam)
      // Error will be displayed by the error state
      // Clean up URL
      navigate('/login', { replace: true })
      return
    }
    
    if (token) {
      console.log('✅ OAuth token received from backend callback')
      // Store token
      tokenService.setToken(token)
      // Load user data
      loadCurrentUser(token).then(() => {
        // Redirect to dashboard
        navigate('/dashboard', { replace: true })
      }).catch((err) => {
        console.error('Failed to load user after OAuth:', err)
        // Clean up URL
        navigate('/login', { replace: true })
      })
    }
  }, [searchParams, navigate, loadCurrentUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    clearError()
    
    console.log('🔐 Attempting login with email:', email)
    
    try {
      const result = await login(email, password)
      console.log('✅ Login successful:', result)
      // The redirect will happen automatically via the App component
      // since the user state will be updated in AuthContext
    } catch (error) {
      console.error('❌ Login failed:', error)
      // Error is already set in context
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = (errorMessage) => {
    console.error('Google login error:', errorMessage)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gray-100/50"></div>

      {/* Popup Modal */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
          
          {/* Close Button (Optional) */}
          <div className="absolute top-4 right-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm mb-6">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Workflow Tracker
            </h2>
            <p className="text-gray-600">
              Sign in to your account
            </p>
          </div>
          
          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-colors"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 transition-colors shadow-sm flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/95 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth Login */}
          <GoogleLogin 
            onError={handleGoogleError}
          />
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
