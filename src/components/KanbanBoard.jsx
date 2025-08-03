import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../contexts/ProjectContext.jsx'
import TaskCard from './TaskCard.jsx'
import CreateTaskModal from './CreateTaskModal.jsx'
import TaskDetailsModal from './TaskDetailsModal.jsx'
import { 
  ArrowLeft, 
  Plus, 
  Filter,
  Search,
  MoreVertical
} from 'lucide-react'

const KanbanBoard = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { getProjectById, getTasksByStatus, moveTask } = useProject()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const project = getProjectById(projectId)
  
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
    
    if (searchTerm) {
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'ALL' && statusFilter !== status) {
      return []
    }
    
    return tasks
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-600">{project.description}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="dropdown"
              >
                <option value="ALL">All Status</option>
                {columns.map(column => (
                  <option key={column.id} value={column.id}>{column.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-white rounded-lg shadow-sm border"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={`p-4 ${column.color} rounded-t-lg`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="text-sm text-gray-600">
                    {filteredTasks(column.id).length}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3 min-h-[400px]">
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