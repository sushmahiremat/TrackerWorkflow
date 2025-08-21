// Configuration file for environment variables and app settings

// Debug: Log all environment variables
console.log('🔍 All import.meta.env:', import.meta.env)
console.log('🔍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('🔍 VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)

const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com',
  
  // App Configuration
  APP_ENV: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.MODE === 'development',
  IS_PROD: import.meta.env.MODE === 'production',
}

// Log configuration in development mode
if (config.IS_DEV) {
  console.log('🔧 App Configuration:', config)
}

export default config
