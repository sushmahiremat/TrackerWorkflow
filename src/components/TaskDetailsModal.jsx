import React, { useState, useEffect } from 'react'
import { useProject } from '../contexts/ProjectContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { teamAPI } from '../services/api.js'
import { format } from 'date-fns'
import { X, Edit, Trash2, Calendar, User, AlertCircle, Tag } from 'lucide-react'
import AISuggestions from './AISuggestions.jsx'
import TagInput from './TagInput.jsx'
import Comments from './Comments.jsx'
import Attachments from './Attachments.jsx'
import MentionInput from './MentionInput.jsx'
import TeamMemberSelector from './TeamMemberSelector.jsx'
import ActivityFeed from './ActivityFeed.jsx'

const TaskDetailsModal = ({ task, onClose }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    assignee: task.assignee,
    dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    priority: task.priority,
    tags: task.tags || []
  })
  
  const { updateTask, deleteTask, getProjectById } = useProject()
  const { user } = useAuth()
  const userName = user?.name || user?.email || 'User'
  const [teamMembers, setTeamMembers] = useState([])
  
  // Load team members if project has a team
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const project = getProjectById(task.project_id)
        if (project?.team_id) {
          const members = await teamAPI.getTeamMembers(project.team_id)
          setTeamMembers(members || [])
        }
      } catch (err) {
        console.error('Error loading team members:', err)
      }
    }
    loadTeamMembers()
  }, [task.project_id, getProjectById])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      // Convert form data to API format
      const taskData = {
        ...task,
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        assignee: formData.assignee.trim(),
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        tags: formData.tags || [],
        project_id: task.project_id
      }
      
      await updateTask(task.id, taskData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    setIsSubmitting(true)
    try {
      await deleteTask(task.id)
      onClose()
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'DONE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch (error) {
      console.warn('Invalid date:', dateString)
      return 'Invalid date'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-wide" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center space-x-2"
                  disabled={isSubmitting}
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-danger flex items-center space-x-2"
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter task title"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-xs text-gray-500">(Type @ to mention team members)</span>
                </label>
                {teamMembers.length > 0 ? (
                  <MentionInput
                    value={formData.description}
                    onChange={(e) => {
                      const value = e.target ? e.target.value : e
                      setFormData(prev => ({ ...prev, description: value }))
                    }}
                    members={teamMembers}
                    placeholder="Enter task description (Type @ to mention team members)"
                    rows={4}
                    disabled={isSubmitting}
                  />
                ) : (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field resize-none"
                    rows="4"
                    placeholder="Enter task description"
                    disabled={isSubmitting}
                  />
                )}
                
                {/* AI Suggestions */}
                <AISuggestions
                  description={formData.description}
                  onSubtaskSelect={(subtask) => {
                    // Check if this is a summary selection
                    if (subtask.startsWith('[SUMMARY] ')) {
                      // Replace the description with the summary (remove the [SUMMARY] prefix)
                      const summary = subtask.replace('[SUMMARY] ', '')
                      setFormData(prev => ({
                        ...prev,
                        description: summary
                      }))
                    } else {
                      // Add subtask to existing description
                      setFormData(prev => ({
                        ...prev,
                        description: prev.description + (prev.description ? '\n\n' : '') + '• ' + subtask
                      }))
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="dropdown"
                  disabled={isSubmitting}
                >
                  <option value="TODO">TO DO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="dropdown"
                  disabled={isSubmitting}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee <span className="text-xs text-gray-500">(User will receive notification)</span>
                </label>
                {teamMembers.length > 0 ? (
                  <TeamMemberSelector
                    members={teamMembers}
                    value={formData.assignee}
                    onChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
                    placeholder="Select team member"
                    disabled={isSubmitting}
                  />
                ) : (
                  <>
                    <input
                      name="assignee"
                      type="text"
                      value={formData.assignee || ''}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter assignee name (e.g., sushma Hiremath)"
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 Tip: Changing assignee will send a notification to the new assignee
                    </p>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="input-field"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <TagInput
                tags={formData.tags}
                onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                placeholder="Add tags (e.g., frontend, bug, urgent)"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
                className="btn-secondary px-6 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title.trim() || isSubmitting}
                className="btn-primary px-6 py-2"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                <p className="text-gray-600">{task.description || 'No description'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{task.assignee || 'Unassigned'}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Due: {formatDate(task.due_date)}
                </span>
              </div>

              {task.tags && task.tags.length > 0 && (
                <div className="flex items-start space-x-3">
                  <Tag className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => {
                      const tagColors = [
                        'bg-blue-100 text-blue-800 border-blue-200',
                        'bg-purple-100 text-purple-800 border-purple-200',
                        'bg-pink-100 text-pink-800 border-pink-200',
                        'bg-green-100 text-green-800 border-green-200',
                        'bg-yellow-100 text-yellow-800 border-yellow-200',
                        'bg-indigo-100 text-indigo-800 border-indigo-200',
                        'bg-red-100 text-red-800 border-red-200',
                        'bg-orange-100 text-orange-800 border-orange-200',
                      ]
                      const tagColor = tagColors[index % tagColors.length]
                      return (
                        <span
                          key={index}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${tagColor}`}
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <AlertCircle className="h-4 w-4" />
                <span>Created on {formatDate(task.created_at)}</span>
              </div>
            </div>

            {/* Comments and Attachments Section - Compact */}
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <Comments taskId={task.id} userName={userName} />
              <Attachments taskId={task.id} userName={userName} />
            </div>
            
            {/* Activity Feed */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Feed</h3>
              <ActivityFeed projectId={task.project_id} taskId={task.id} limit={20} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskDetailsModal 