// API configuration and service functions
import config from '../config/config.js'

const API_BASE_URL = config.API_BASE_URL

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  console.log('🌐 API Call:', { url, method: options.method || 'GET', endpoint })
  
  const config = {
    credentials: 'include', // Include credentials for CORS
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    console.log('📤 Making API request to:', url)
    const response = await fetch(url, config)
    console.log('📥 API response received:', { status: response.status, ok: response.ok })
    
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      console.error('❌ API request failed:', { status: response.status, data })
      throw new Error(data.detail || data || 'API request failed')
    }
    
    console.log('✅ API request successful:', data)
    return data
  } catch (error) {
    console.error('❌ API call error:', error)
    throw new Error(error.message || 'Network error')
  }
}

// Auth API functions
export const authAPI = {
  login: async (email, password) => {
    return await apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },

  register: async (email, password) => {
    return await apiCall('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },

  googleLogin: async (idToken) => {
    return await apiCall('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken })
    })
  },

  getGoogleAuthUrl: async () => {
    return await apiCall('/auth/google/url')
  },

  getCurrentUser: async (token) => {
    return await apiCall('/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }
}

// Project API functions
export const projectAPI = {
  createProject: async (projectData) => {
    return await apiCall('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    })
  },

  getProjects: async () => {
    return await apiCall('/projects')
  },

  getProjectById: async (id) => {
    return await apiCall(`/projects/${id}`)
  },

  updateProject: async (id, projectData) => {
    return await apiCall(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    })
  },

  deleteProject: async (id) => {
    return await apiCall(`/projects/${id}`, {
      method: 'DELETE'
    })
  }
}

// Task API functions
export const taskAPI = {
  createTask: async (taskData) => {
    return await apiCall('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    })
  },

  getTasks: async () => {
    return await apiCall('/tasks')
  },

  getTaskById: async (id) => {
    return await apiCall(`/tasks/${id}`)
  },

  getTasksByProject: async (projectId) => {
    return await apiCall(`/tasks/project/${projectId}`)
  },

  updateTask: async (id, taskData) => {
    return await apiCall(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    })
  },

  deleteTask: async (id) => {
    return await apiCall(`/tasks/${id}`, {
      method: 'DELETE'
    })
  }
}

// AI API functions
export const aiAPI = {
  summarizeTask: async (description) => {
    return await apiCall('/ai/summarize-task', {
      method: 'POST',
      body: JSON.stringify({ description })
    })
  }
}

// Token management
export const tokenService = {
  getToken: () => localStorage.getItem('authToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  removeToken: () => localStorage.removeItem('authToken')
} 