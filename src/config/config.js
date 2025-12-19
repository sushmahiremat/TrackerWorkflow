// Configuration file for environment variables and app settings

// Debug: Log all environment variables
console.log('🔍 All import.meta.env:', import.meta.env)
console.log('🔍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('🔍 VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)

// Determine API Base URL
const getApiBaseUrl = () => {
  // Priority 1: Explicitly set environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL.trim()
    // Safety check: Never use frontend URL as API URL
    if (apiUrl.includes('y55dfkjshm')) {
      console.error('❌ ERROR: VITE_API_BASE_URL cannot be the frontend URL!')
      console.error('Frontend URL:', window.location.origin)
      console.error('Backend URL should be: https://9cqn6rispm.us-west-2.awsapprunner.com')
    }
    return apiUrl
  }
  
  // Priority 2: Local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8001'
  }
  
  // Priority 3: Production fallback - BACKEND URL (not frontend!)
  // Frontend: y55dfkjshm.us-west-2.awsapprunner.com
  // Backend: 9cqn6rispm.us-west-2.awsapprunner.com
  const backendUrl = 'https://9cqn6rispm.us-west-2.awsapprunner.com'
  console.warn('⚠️ VITE_API_BASE_URL not set, using fallback backend URL:', backendUrl)
  return backendUrl
}

const config = {
  // API Configuration - Auto-detect production vs development
  API_BASE_URL: getApiBaseUrl(),
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // AI Configuration (Hugging Face)
  HUGGINGFACE_API_KEY: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
  

  
  // App Configuration
  APP_ENV: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.MODE === 'development',
  IS_PROD: import.meta.env.MODE === 'production',
  
  // Get current domain for OAuth
  CURRENT_DOMAIN: window.location.origin,
}

// Always log configuration in production to debug
console.log('🔧 App Configuration:', config)
console.log('🔧 API_BASE_URL:', config.API_BASE_URL)
console.log('🔧 GOOGLE_CLIENT_ID:', config.GOOGLE_CLIENT_ID ? config.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'NOT SET')

export default config
