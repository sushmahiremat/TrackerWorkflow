import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { projectAPI, taskAPI } from '../services/api.js'

// Initial state
const initialState = {
  projects: [],
  tasks: [],
  loading: false,
  initialLoading: true, // New state for initial projects load
  error: null
}

// Action types
const PROJECT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_INITIAL_LOADING: 'SET_INITIAL_LOADING', // New action for initial loading
  SET_ERROR: 'SET_ERROR',
  SET_PROJECTS: 'SET_PROJECTS',
  SET_TASKS: 'SET_TASKS',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  MOVE_TASK: 'MOVE_TASK'
}

// Reducer function
const projectReducer = (state, action) => {
  switch (action.type) {
    case PROJECT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    
    case PROJECT_ACTIONS.SET_INITIAL_LOADING:
      return {
        ...state,
        initialLoading: action.payload
      }
    
    case PROJECT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      }
    
    case PROJECT_ACTIONS.SET_PROJECTS:
      return {
        ...state,
        projects: action.payload
      }
    
    case PROJECT_ACTIONS.SET_TASKS:
      return {
        ...state,
        tasks: action.payload
      }
    
    case PROJECT_ACTIONS.ADD_PROJECT:
      return {
        ...state,
        projects: [...state.projects, action.payload]
      }
    
    case PROJECT_ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        )
      }
    
    case PROJECT_ACTIONS.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        tasks: state.tasks.filter(task => task.project_id !== action.payload)
      }
    
    case PROJECT_ACTIONS.ADD_TASK:
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      }
    
    case PROJECT_ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      }
    
    case PROJECT_ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      }
    
    case PROJECT_ACTIONS.MOVE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId 
            ? { ...task, status: action.payload.newStatus }
            : task
        )
      }
    
    default:
      return state
  }
}

// Create context
const ProjectContext = createContext()

// Provider component
export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState)

  // Load projects from API
  const loadProjects = useCallback(async () => {
    dispatch({ type: PROJECT_ACTIONS.SET_INITIAL_LOADING, payload: true })
    dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: null })
    
    try {
      console.log('🔄 ProjectContext: Loading projects...')
      const projects = await projectAPI.getProjects()
      console.log('✅ ProjectContext: Projects loaded:', projects?.length || 0, 'projects')
      console.log('📋 ProjectContext: Projects data:', projects)
      dispatch({ type: PROJECT_ACTIONS.SET_PROJECTS, payload: projects || [] })
    } catch (error) {
      console.error('❌ ProjectContext: Error loading projects:', error)
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      dispatch({ type: PROJECT_ACTIONS.SET_PROJECTS, payload: [] }) // Set empty array on error
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_INITIAL_LOADING, payload: false })
    }
  }, [])

  // Load tasks for a specific project
  const loadTasksByProject = useCallback(async (projectId) => {
    console.log('loadTasksByProject called with projectId:', projectId)
    // Remove loading state changes to prevent re-renders
    dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: null })
    
    try {
      const tasks = await taskAPI.getTasksByProject(projectId)
      console.log('Tasks loaded successfully:', tasks.length)
      dispatch({ type: PROJECT_ACTIONS.SET_TASKS, payload: tasks })
    } catch (error) {
      console.error('Error loading tasks:', error)
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
    }
  }, [])

  // Load all tasks from all projects
  const loadAllTasks = useCallback(async () => {
    dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: null })
    
    try {
      const allTasks = await taskAPI.getTasks()
      dispatch({ type: PROJECT_ACTIONS.SET_TASKS, payload: allTasks })
      return allTasks
    } catch (error) {
      console.error('Error loading all tasks:', error)
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      return []
    }
  }, [])

  // Get task count for a specific project (without loading into state)
  const getTaskCountByProject = useCallback(async (projectId) => {
    try {
      const tasks = await taskAPI.getTasksByProject(projectId)
      return tasks.length
    } catch (error) {
      console.error('Error getting task count for project:', projectId, error)
      return 0
    }
  }, [])

  // Load projects on component mount
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Actions
  const addProject = useCallback(async (project) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: null })
    
    try {
      const newProject = await projectAPI.createProject(project)
      dispatch({ type: PROJECT_ACTIONS.ADD_PROJECT, payload: newProject })
      return newProject
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      console.error('Error creating project:', error)
      throw error
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  const updateProject = useCallback(async (projectId, projectData) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: null })
    
    try {
      const updatedProject = await projectAPI.updateProject(projectId, projectData)
      dispatch({ type: PROJECT_ACTIONS.UPDATE_PROJECT, payload: updatedProject })
      return updatedProject
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      console.error('Error updating project:', error)
      throw error
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  const deleteProject = useCallback(async (projectId) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: null })
    
    try {
      await projectAPI.deleteProject(projectId)
      dispatch({ type: PROJECT_ACTIONS.DELETE_PROJECT, payload: projectId })
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      console.error('Error deleting project:', error)
      throw error
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  const addTask = useCallback(async (task) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: null })
    
    try {
      const newTask = await taskAPI.createTask(task)
      dispatch({ type: PROJECT_ACTIONS.ADD_TASK, payload: newTask })
      return newTask
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      console.error('Error creating task:', error)
      throw error
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  const updateTask = useCallback(async (taskId, taskData) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: null })
    
    try {
      const updatedTask = await taskAPI.updateTask(taskId, taskData)
      dispatch({ type: PROJECT_ACTIONS.UPDATE_TASK, payload: updatedTask })
      return updatedTask
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      console.error('Error updating task:', error)
      throw error
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  const deleteTask = useCallback(async (taskId) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: null })
    
    try {
      await taskAPI.deleteTask(taskId)
      dispatch({ type: PROJECT_ACTIONS.DELETE_TASK, payload: taskId })
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      console.error('Error deleting task:', error)
      throw error
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  const moveTask = useCallback(async (taskId, newStatus) => {
    try {
      const task = state.tasks.find(t => t.id === taskId)
      if (task) {
        await updateTask(taskId, { ...task, status: newStatus })
      }
    } catch (error) {
      console.error('Error moving task:', error)
      throw error
    }
  }, [state.tasks, updateTask])

  // Selectors
  const getProjects = useCallback(() => state.projects, [state.projects])

  const getProjectById = useCallback((projectId) => {
    return state.projects.find(project => project.id === parseInt(projectId))
  }, [state.projects])

  const getTasksByProject = useCallback((projectId) => {
    return state.tasks.filter(task => task.project_id === parseInt(projectId))
  }, [state.tasks])

  const getTasksByStatus = useCallback((projectId, status) => {
    return state.tasks.filter(task => 
      task.project_id === parseInt(projectId) && task.status === status
    )
  }, [state.tasks])

  const value = {
    projects: state.projects,
    tasks: state.tasks,
    loading: state.loading,
    initialLoading: state.initialLoading, // Add initialLoading to context
    error: state.error,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getProjects,
    getProjectById,
    getTasksByProject,
    getTasksByStatus,
    loadProjects,
    loadTasksByProject,
    loadAllTasks,
    getTaskCountByProject
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

// Custom hook to use project context
export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
} 