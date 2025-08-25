import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../contexts/ProjectContext.jsx'
import { useTopNav } from '../contexts/TopNavContext.jsx'
import TaskCard from './TaskCard.jsx'
import CreateTaskModal from './CreateTaskModal.jsx'
import TaskDetailsModal from './TaskDetailsModal.jsx'
import { 
  Plus, 
  Search,
  CheckCircle,
  Clock,
  Calendar
} from 'lucide-react'

const KanbanBoard = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { getProjectById, getTasksByStatus, moveTask, loadTasksByProject, loading, error, tasks } = useProject()
  const { taskSearchTerm, setTaskSearchTerm, setOnAddTaskClick } = useTopNav()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [tasksLoaded, setTasksLoaded] = useState(false)

  const project = getProjectById(projectId)
  
  // Calculate task statistics
  const totalTasks = tasks.length
  const todoTasks = getTasksByStatus(projectId, 'TODO').length
  const inProgressTasks = getTasksByStatus(projectId, 'IN_PROGRESS').length
  const reviewTasks = getTasksByStatus(projectId, 'REVIEW').length
  const completedTasks = getTasksByStatus(projectId, 'DONE').length
  
  // Load tasks when component mounts or projectId changes
  useEffect(() => {
    console.log('KanbanBoard useEffect triggered:', { projectId, tasksLoaded, loading })
    if (projectId && !tasksLoaded && !loading) {
      console.log('Loading tasks for project:', projectId)
      setTasksLoaded(true)
      loadTasksByProject(parseInt(projectId))
    }
  }, [projectId, tasksLoaded, loading, loadTasksByProject])

  // Set up Add Task click handler for top navigation
  useEffect(() => {
    setOnAddTaskClick(() => () => setShowCreateModal(true))
    
    // Cleanup function
    return () => setOnAddTaskClick(null)
  }, [setOnAddTaskClick])
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const columns = [
    { id: 'TODO', title: 'TO DO', color: 'bg-gray-100' },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS', color: 'bg-blue-100' },
    { id: 'REVIEW', title: 'REVIEW', color: 'bg-yellow-100' },
    { id: 'DONE', title: 'DONE', color: 'bg-green-100' }
  ]

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, status) => {
    e.preventDefault()
    const taskId = parseInt(e.dataTransfer.getData('taskId'))
    moveTask(taskId, status)
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  const filteredTasks = (status) => {
    let tasks = getTasksByStatus(projectId, status)
    
    if (taskSearchTerm) {
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(taskSearchTerm.toLowerCase())) ||
        (task.assignee && task.assignee.toLowerCase().includes(taskSearchTerm.toLowerCase()))
      )
    }
    
    if (statusFilter !== 'ALL' && statusFilter !== status) {
      return []
    }
    
    return tasks
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Project Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-600">{project.description || 'No description'}</p>
          </div>
          
          {/* All Status Button moved to right end */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            {columns.map(column => (
              <option key={column.id} value={column.id}>{column.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Removed old filters section - now integrated into header */}

      {/* Task Statistics */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-gray-600" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-sm font-bold text-gray-900">{totalTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-600">In Progress</p>
                <p className="text-sm font-bold text-gray-900">{inProgressTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-600">Review</p>
                <p className="text-sm font-bold text-gray-900">{reviewTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-600">Completed</p>
                <p className="text-sm font-bold text-gray-900">{completedTasks}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <div className="h-6 w-6 bg-gray-400 rounded"></div>
            </div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {!loading && (
        <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="kanban-grid">
            {columns.map((column) => (
              <div
                key={column.id}
                className="bg-white rounded-lg shadow-sm border min-w-0 flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className={`p-4 ${column.color} rounded-t-lg flex-shrink-0`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 truncate">{column.title}</h3>
                    <span className="text-sm text-gray-600 flex-shrink-0">
                      {filteredTasks(column.id).length}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3 min-h-[400px] flex-1 overflow-y-auto">
                  {filteredTasks(column.id).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onClick={() => handleTaskClick(task)}
                    />
                  ))}
                  {filteredTasks(column.id).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          projectId={parseInt(projectId)}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}

export default KanbanBoard 