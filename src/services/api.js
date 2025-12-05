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
      const error = new Error(data.detail || data?.message || data || 'API request failed')
      error.data = data // Attach full error data for better error handling
      error.status = response.status
      throw error
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

// Comment API functions
export const commentAPI = {
  createComment: async (taskId, commentData) => {
    return await apiCall(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData)
    })
  },

  getComments: async (taskId) => {
    return await apiCall(`/tasks/${taskId}/comments`)
  },

  updateComment: async (commentId, content) => {
    return await apiCall(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    })
  },

  deleteComment: async (commentId) => {
    return await apiCall(`/comments/${commentId}`, {
      method: 'DELETE'
    })
  }
}

// Attachment API functions
export const attachmentAPI = {
  uploadAttachment: async (taskId, file, userName) => {
    const formData = new FormData()
    formData.append('file', file)
    if (userName) {
      formData.append('user_name', userName)
    }

    const url = `${API_BASE_URL}/tasks/${taskId}/attachments`
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to upload attachment')
    }

    return await response.json()
  },

  getAttachments: async (taskId) => {
    return await apiCall(`/tasks/${taskId}/attachments`)
  },

  downloadAttachment: async (attachmentId) => {
    return `${API_BASE_URL}/attachments/${attachmentId}/download`
  },

  deleteAttachment: async (attachmentId) => {
    return await apiCall(`/attachments/${attachmentId}`, {
      method: 'DELETE'
    })
  }
}

// Notification API
export const notificationAPI = {
  getNotifications: async (userName, skip = 0, limit = 100) => {
    return await apiCall(`/notifications/user/${userName}?skip=${skip}&limit=${limit}`)
  },
  
  getUnreadCount: async (userName) => {
    return await apiCall(`/notifications/user/${userName}/unread/count`)
  },
  
  markAsRead: async (notificationId) => {
    return await apiCall(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  },
  
  markAllAsRead: async (userName) => {
    return await apiCall(`/notifications/user/${userName}/read-all`, {
      method: 'PUT'
    })
  },
  
  deleteNotification: async (notificationId) => {
    return await apiCall(`/notifications/${notificationId}`, {
      method: 'DELETE'
    })
  },
  
  createNotification: async (notificationData) => {
    return await apiCall('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    })
  }
}

// Team API
export const teamAPI = {
  createTeam: async (teamData, userName) => {
    const url = userName ? `/teams?user_name=${encodeURIComponent(userName)}` : '/teams'
    return await apiCall(url, {
      method: 'POST',
      body: JSON.stringify(teamData)
    })
  },
  
  getTeams: async (skip = 0, limit = 100) => {
    return await apiCall(`/teams?skip=${skip}&limit=${limit}`)
  },
  
  getUserTeams: async (userName) => {
    return await apiCall(`/teams/user/${userName}`)
  },
  
  getTeam: async (teamId) => {
    return await apiCall(`/teams/${teamId}`)
  },
  
  updateTeam: async (teamId, teamData) => {
    return await apiCall(`/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(teamData)
    })
  },
  
  deleteTeam: async (teamId) => {
    return await apiCall(`/teams/${teamId}`, {
      method: 'DELETE'
    })
  },
  
  getTeamMembers: async (teamId) => {
    return await apiCall(`/teams/${teamId}/members`)
  },
  
  addTeamMember: async (teamId, memberData) => {
    return await apiCall(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData)
    })
  },
  
  updateMemberStatus: async (teamId, userName, status) => {
    return await apiCall(`/teams/${teamId}/members/${userName}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },
  
  updateMemberRole: async (teamId, userName, role) => {
    return await apiCall(`/teams/${teamId}/members/${userName}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    })
  },
  
  removeTeamMember: async (teamId, userName) => {
    return await apiCall(`/teams/${teamId}/members/${userName}`, {
      method: 'DELETE'
    })
  }
}

// Activity API
export const activityAPI = {
  getActivities: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.team_id) params.append('team_id', filters.team_id)
    if (filters.project_id) params.append('project_id', filters.project_id)
    if (filters.task_id) params.append('task_id', filters.task_id)
    if (filters.skip) params.append('skip', filters.skip)
    if (filters.limit) params.append('limit', filters.limit)
    
    return await apiCall(`/activities?${params.toString()}`)
  },
  
  createActivity: async (activityData) => {
    return await apiCall('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData)
    })
  }
}

// Token management
export const tokenService = {
  getToken: () => localStorage.getItem('authToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  removeToken: () => localStorage.removeItem('authToken')
} 