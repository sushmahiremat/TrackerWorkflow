import React, { useState } from 'react'
import { teamAPI } from '../services/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

const CreateTeamModal = ({ onClose, onTeamCreated }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    setError('')
    
    try {
      const userName = user?.name || user?.email || 'Anonymous'
      const team = await teamAPI.createTeam({
        name: name.trim(),
        description: description.trim() || null
      }, userName)
      // Call onTeamCreated callback if provided, otherwise navigate
      if (onTeamCreated) {
        onTeamCreated(team)
      } else {
        navigate(`/team/${team.id}`)
      }
      onClose()
    } catch (error) {
      setError(error.message || 'Failed to create team. Please try again.')
      console.error('Error creating team:', error)
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
      <div className="modal-content-medium" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Team</h2>
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
          <div>
            <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-2">
              Team Name *
            </label>
            <input
              id="team-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter team name"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="team-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              rows="4"
              placeholder="Enter team description (optional)"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
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
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTeamModal

