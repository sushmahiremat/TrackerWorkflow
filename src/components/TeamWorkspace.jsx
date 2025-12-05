import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { teamAPI, activityAPI } from '../services/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import TeamMemberAvatar from './TeamMemberAvatar.jsx'
import ActivityFeed from './ActivityFeed.jsx'
import { Plus, Users, Settings, ArrowLeft, MoreVertical, UserPlus, Trash2, Edit } from 'lucide-react'

const TeamWorkspace = () => {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  
  useEffect(() => {
    if (teamId) {
      loadTeam()
      loadMembers()
    }
  }, [teamId])
  
  const loadTeam = async () => {
    try {
      const data = await teamAPI.getTeam(teamId)
      setTeam(data)
    } catch (err) {
      console.error('Error loading team:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const loadMembers = async () => {
    try {
      const data = await teamAPI.getTeamMembers(teamId)
      setMembers(data || [])
    } catch (err) {
      console.error('Error loading members:', err)
    }
  }
  
  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!newMemberName.trim()) return
    
    try {
      console.log('➕ Adding team member:', { teamId, user_name: newMemberName.trim() })
      await teamAPI.addTeamMember(teamId, {
        user_name: newMemberName.trim(),
        user_email: newMemberEmail.trim() || null,
        role: 'MEMBER',
        status: 'OFFLINE'
      })
      console.log('✅ Team member added successfully')
      setNewMemberName('')
      setNewMemberEmail('')
      setShowAddMember(false)
      loadMembers()
    } catch (err) {
      console.error('❌ Error adding member:', err)
      const errorMessage = err?.data?.detail || err?.message || 'Failed to add member. Please try again.'
      alert(`Failed to add member: ${errorMessage}`)
    }
  }
  
  const handleRemoveMember = async (userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from the team?`)) return
    
    try {
      await teamAPI.removeTeamMember(teamId, userName)
      loadMembers()
    } catch (err) {
      console.error('Error removing member:', err)
      alert('Failed to remove member. Please try again.')
    }
  }
  
  const updateMemberStatus = async (userName, status) => {
    try {
      await teamAPI.updateMemberStatus(teamId, userName, status)
      loadMembers()
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (error || !team) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading team: {error || 'Team not found'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }
  
  const currentMember = members.find(m => m.user_name === user?.name)
  const isOwnerOrAdmin = currentMember?.role === 'OWNER' || currentMember?.role === 'ADMIN'
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            {team.description && (
              <p className="text-gray-600 mt-1">{team.description}</p>
            )}
          </div>
          {isOwnerOrAdmin && (
            <button className="btn-secondary flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Members ({members.length})</span>
              </h2>
              {isOwnerOrAdmin && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {showAddMember && (
              <form onSubmit={handleAddMember} className="mb-4 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Member name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                />
                <div className="flex space-x-2">
                  <button type="submit" className="btn-primary flex-1 text-sm py-1.5">
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMember(false)
                      setNewMemberName('')
                      setNewMemberEmail('')
                    }}
                    className="btn-secondary text-sm py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <TeamMemberAvatar member={member} size="md" showStatus={true} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {member.user_name}
                        {member.role === 'OWNER' && (
                          <span className="ml-2 text-xs text-blue-600 font-normal">(Owner)</span>
                        )}
                        {member.role === 'ADMIN' && (
                          <span className="ml-2 text-xs text-purple-600 font-normal">(Admin)</span>
                        )}
                      </div>
                      {member.user_email && (
                        <div className="text-xs text-gray-500 truncate">{member.user_email}</div>
                      )}
                    </div>
                  </div>
                  {isOwnerOrAdmin && member.user_name !== user?.name && (
                    <button
                      onClick={() => handleRemoveMember(member.user_name)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Activity Feed Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Feed</h2>
            <ActivityFeed teamId={parseInt(teamId)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamWorkspace

