import React, { useState, useEffect } from 'react'
import { useProject } from '../contexts/ProjectContext.jsx'
import { X } from 'lucide-react'

const EditProjectModal = ({ project, onClose, onUpdate }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const { updateProject } = useProject()

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      setName(project.name || '')
      setDescription(project.description || '')
    }
  }, [project])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    setError('')
    
    try {
      const updatedProject = await updateProject(project.id, {
        name: name.trim(),
        description: description.trim()
      })
      
      if (onUpdate) {
        onUpdate(updatedProject)
      }
      onClose()
    } catch (error) {
      setError(error.message || 'Failed to update project. Please try again.')
      console.error('Error updating project:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!project) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content-medium" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Enter project name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field resize-none"
                rows="5"
                placeholder="Enter project description"
                disabled={isSubmitting}
              />
            </div>
          </div>

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
              disabled={!name.trim() || isSubmitting}
              className="btn-primary px-6 py-2"
            >
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProjectModal
