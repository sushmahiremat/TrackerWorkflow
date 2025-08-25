// Configuration file for environment variables and app settings

// Debug: Log all environment variables
console.log('🔍 All import.meta.env:', import.meta.env)
console.log('🔍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('🔍 VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)

const config = {
  // API Configuration - Auto-detect production vs development
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:8001' 
      : 'https://your-backend-domain.com'), // This will be set via Vercel environment variables
  
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

// Log configuration in development mode
if (config.IS_DEV) {
  console.log('🔧 App Configuration:', config)
}

export default config
