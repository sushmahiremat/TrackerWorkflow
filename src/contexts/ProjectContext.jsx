import React, { createContext, useContext, useReducer } from 'react'

// Initial state with dummy data
const initialState = {
  projects: [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Redesign the company website with modern UI/UX',
      createdAt: '2024-01-15',
      tasksCount: 8
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Develop a cross-platform mobile application',
      createdAt: '2024-01-20',
      tasksCount: 12
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate legacy database to new cloud infrastructure',
      createdAt: '2024-01-25',
      tasksCount: 5
    }
  ],
  tasks: [
    {
      id: 1,
      projectId: 1,
      title: 'Design Homepage Layout',
      description: 'Create wireframes and mockups for the homepage',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignee: 'John Doe',
      dueDate: '2024-02-15',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      projectId: 1,
      title: 'Implement Navigation Menu',
      description: 'Build responsive navigation with mobile support',
      status: 'TODO',
      priority: 'MEDIUM',
      assignee: 'Jane Smith',
      dueDate: '2024-02-20',
      createdAt: '2024-01-16'
    },
    {
      id: 3,
      projectId: 2,
      title: 'Setup React Native Project',
      description: 'Initialize React Native project with TypeScript',
      status: 'DONE',
      priority: 'HIGH',
      assignee: 'Mike Johnson',
      dueDate: '2024-01-30',
      createdAt: '2024-01-20'
    },
    {
      id: 4,
      projectId: 2,
      title: 'Design App Icons',
      description: 'Create app icons for different platforms',
      status: 'REVIEW',
      priority: 'LOW',
      assignee: 'Sarah Wilson',
      dueDate: '2024-02-10',
      createdAt: '2024-01-22'
    }
  ]
}

// Action types
const PROJECT_ACTIONS = {
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
        tasks: state.tasks.filter(task => task.projectId !== action.payload)
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

  // Actions
  const addProject = (project) => {
    const newProject = {
      ...project,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      tasksCount: 0
    }
    dispatch({ type: PROJECT_ACTIONS.ADD_PROJECT, payload: newProject })
  }

  const updateProject = (project) => {
    dispatch({ type: PROJECT_ACTIONS.UPDATE_PROJECT, payload: project })
  }

  const deleteProject = (projectId) => {
    dispatch({ type: PROJECT_ACTIONS.DELETE_PROJECT, payload: projectId })
  }

  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    dispatch({ type: PROJECT_ACTIONS.ADD_TASK, payload: newTask })
  }

  const updateTask = (task) => {
    dispatch({ type: PROJECT_ACTIONS.UPDATE_TASK, payload: task })
  }

  const deleteTask = (taskId) => {
    dispatch({ type: PROJECT_ACTIONS.DELETE_TASK, payload: taskId })
  }

  const moveTask = (taskId, newStatus) => {
    dispatch({ 
      type: PROJECT_ACTIONS.MOVE_TASK, 
      payload: { taskId, newStatus } 
    })
  }

  // Selectors
  const getProjects = () => state.projects

  const getProjectById = (projectId) => {
    return state.projects.find(project => project.id === parseInt(projectId))
  }

  const getTasksByProject = (projectId) => {
    return state.tasks.filter(task => task.projectId === parseInt(projectId))
  }

  const getTasksByStatus = (projectId, status) => {
    return state.tasks.filter(task => 
      task.projectId === parseInt(projectId) && task.status === status
    )
  }

  const value = {
    projects: state.projects,
    tasks: state.tasks,
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
    getTasksByStatus
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