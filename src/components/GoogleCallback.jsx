import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const GoogleCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { googleLogin } = useAuth()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get the credential from URL parameters
        const credential = searchParams.get('credential')
        
        if (!credential) {
          setError('No credential received from Google')
          setLoading(false)
          return
        }

        console.log('Processing Google callback with credential:', credential)

        // Call our backend with the credential
        const result = await googleLogin(credential)
        
        console.log('Google login successful:', result)
        
        // Redirect to dashboard on success
        navigate('/dashboard', { replace: true })
        
      } catch (error) {
        console.error('Google callback error:', error)
        setError(error.message || 'Google login failed')
        setLoading(false)
      }
    }

    handleGoogleCallback()
  }, [searchParams, googleLogin, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Processing Google Login...</h2>
            <p className="mt-2 text-gray-600">Please wait while we complete your sign-in.</p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-600">Login Failed</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default GoogleCallback
