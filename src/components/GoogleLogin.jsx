import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import config from '../config/config.js'

const GoogleLogin = ({ onSuccess, onError }) => {
  const { googleLogin } = useAuth()
  const googleButtonRef = useRef(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState('')

  // Use configuration file for client ID
  const GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleSignIn
    script.onerror = () => {
      console.error('Failed to load Google Sign-In script')
      if (onError) onError('Failed to load Google Sign-In')
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const initializeGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      console.error('❌ Google Client ID not configured')
      if (onError) onError('Google OAuth not configured')
      return
    }
    
    if (window.google && googleButtonRef.current) {
      try {
        console.log('🔐 Initializing Google Sign-In with Client ID:', GOOGLE_CLIENT_ID)
        console.log('📍 Current origin:', window.location.origin)
        
        // Initialize Google Sign-In for web application
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          // Use more compatible settings to avoid Cross-Origin issues
          context: 'signin',
          prompt_parent_id: googleButtonRef.current.id,
          // Use redirect mode for production to avoid Cross-Origin issues
          ux_mode: config.IS_PROD ? 'redirect' : 'popup'
        })

        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: isProcessing ? 'signin_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 300,
          disabled: isProcessing
        })
        
        console.log('✅ Google Sign-In initialized successfully')
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error)
        if (onError) onError('Failed to initialize Google Sign-In')
      }
    }
  }

  const handleCredentialResponse = async (response) => {
    if (isProcessing) {
      console.log('⏳ Google OAuth already processing, ignoring duplicate request')
      return
    }
    
    setIsProcessing(true)
    setCurrentStep('Verifying Google credentials...')
    
    try {
      console.log('🎯 Google credential received:', response)
      console.log('🔑 ID Token length:', response.credential ? response.credential.length : 'No credential')
      
      // Extract the ID token from the response
      const idToken = response.credential
      
      if (!idToken) {
        throw new Error('No ID token received from Google')
      }
      
      setCurrentStep('Sending to backend...')
      console.log('📤 Sending ID token to backend...')
      console.log('🌐 Backend URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001')
      
      // Call our backend with the ID token (increased timeout to 60 seconds)
      const result = await googleLogin(idToken)
      
      setCurrentStep('Authentication successful!')
      console.log('✅ Backend authentication successful:', result)
      
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      setCurrentStep('Authentication failed')
      console.error('❌ Google login failed:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      })
      
      if (onError) {
        onError(error.message || 'Google login failed')
      }
    } finally {
      setIsProcessing(false)
      // Clear step after a delay
      setTimeout(() => setCurrentStep(''), 3000)
    }
  }

  return (
    <div className="w-full">
      {isProcessing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">{currentStep}</span>
          </div>
        </div>
      )}
      
      <div 
        ref={googleButtonRef}
        id="google-signin-button"
        className="w-full flex justify-center"
      />
    </div>
  )
}

export default GoogleLogin
