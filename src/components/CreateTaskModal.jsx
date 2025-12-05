import React, { useState, useEffect } from 'react'
import { useProject } from '../contexts/ProjectContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { teamAPI } from '../services/api.js'
import AISuggestions from './AISuggestions.jsx'
import TagInput from './TagInput.jsx'
import TeamMemberSelector from './TeamMemberSelector.jsx'
import MentionInput from './MentionInput.jsx'
import { X } from 'lucide-react'

const CreateTaskModal = ({ projectId, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    assignee: '',
    dueDate: '',
    priority: 'MEDIUM',
    tags: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [teamMembers, setTeamMembers] = useState([])
  
  const { addTask, getProjectById } = useProject()
  const { user } = useAuth()
  
  // Set default assignee to current user's name
  const currentUserName = user?.name || user?.email || ''
  
  // Load team members if project has a team
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const project = getProjectById(projectId)
        if (project?.team_id) {
          const members = await teamAPI.getTeamMembers(project.team_id)
          setTeamMembers(members || [])
        }
      } catch (err) {
        console.error('Error loading team members:', err)
      }
    }
    loadTeamMembers()
  }, [projectId, getProjectById])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    setError('')
    
    try {
      // Convert form data to API format
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        assignee: formData.assignee.trim() || null,
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        tags: formData.tags || [],
        project_id: projectId
      }

      await addTask(taskData)
      onClose()
    } catch (error) {
      setError(error.message || 'Failed to create task. Please try again.')
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content-wide" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                id="task-title"
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
              <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-xs text-gray-500">(Type @ to mention team members)</span>
              </label>
              {teamMembers.length > 0 ? (
                <MentionInput
                  value={formData.description}
                  onChange={handleChange}
                  members={teamMembers}
                  placeholder="Enter task description (Type @ to mention team members)"
                  rows={4}
                  disabled={isSubmitting}
                />
              ) : (
                <textarea
                  id="task-description"
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
              <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="task-status"
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
              <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="task-priority"
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
              <label htmlFor="task-assignee" className="block text-sm font-medium text-gray-700 mb-2">
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
                    id="task-assignee"
                    name="assignee"
                    type="text"
                    value={formData.assignee}
                    onChange={handleChange}
                    className="input-field"
                    placeholder={currentUserName ? `Enter assignee name (e.g., ${currentUserName})` : "Enter assignee name"}
                    disabled={isSubmitting}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      💡 Tip: Use the exact name as shown in the user profile
                    </p>
                    {currentUserName && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, assignee: currentUserName }))}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Use my name ({currentUserName})
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            <div>
              <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                id="task-due-date"
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

          <form onSubmit={handleSubmit}>
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="btn-secondary px-6 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.title.trim() || isSubmitting}
                className="btn-primary px-6 py-2"
              >
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTaskModal 