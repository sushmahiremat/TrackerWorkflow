import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { teamAPI, activityAPI } from '../services/api.js'
import TeamMemberAvatar from './TeamMemberAvatar.jsx'
import ActivityFeed from './ActivityFeed.jsx'
import CreateTeamModal from './CreateTeamModal.jsx'
import { Users, Plus, ArrowRight, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'

const TeamsList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamMembers, setTeamMembers] = useState({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  useEffect(() => {
    loadTeams()
  }, [user])
  
  const loadTeams = async () => {
    if (!user?.name && !user?.email) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const userName = user.name || user.email || 'Anonymous'
      console.log('🔍 Loading teams for user:', userName)
      const userTeams = await teamAPI.getUserTeams(userName)
      console.log('✅ Teams loaded:', userTeams?.length || 0, 'teams')
      setTeams(userTeams || [])
      
      // Load members for each team
      const membersPromises = userTeams.map(async (team) => {
        try {
          const members = await teamAPI.getTeamMembers(team.id)
          return { teamId: team.id, members }
        } catch (err) {
          console.error(`Error loading members for team ${team.id}:`, err)
          return { teamId: team.id, members: [] }
        }
      })
      
      const membersResults = await Promise.all(membersPromises)
      const membersMap = {}
      membersResults.forEach(({ teamId, members }) => {
        membersMap[teamId] = members
      })
      setTeamMembers(membersMap)
    } catch (err) {
      console.error('Error loading teams:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleTeamClick = (teamId) => {
    navigate(`/team/${teamId}`)
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch (error) {
      return 'N/A'
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading teams: {error}</p>
        <button
          onClick={loadTeams}
          className="mt-4 btn-secondary"
        >
          Try Again
        </button>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Teams</h1>
        <p className="text-gray-600">Manage your teams and view team activity</p>
      </div>
      
      {teams.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
          <p className="text-gray-500 mb-4">Create your first team to get started with collaboration</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Team</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Teams ({teams.length})</span>
                </h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Create new team"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {teams.map((team) => {
                  const members = teamMembers[team.id] || []
                  const memberCount = members.length
                  
                  return (
                    <div
                      key={team.id}
                      onClick={() => handleTeamClick(team.id)}
                      onMouseEnter={() => setSelectedTeam(team.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedTeam === team.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{team.name}</h3>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      
                      {team.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{team.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(team.created_at)}</span>
                        </div>
                      </div>
                      
                      {/* Show first 3 members */}
                      {members.length > 0 && (
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                          {members.slice(0, 3).map((member) => (
                            <TeamMemberAvatar
                              key={member.id}
                              member={member}
                              size="sm"
                              showStatus={true}
                            />
                          ))}
                          {members.length > 3 && (
                            <span className="text-xs text-gray-500">+{members.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Activity Feed</h2>
              {selectedTeam ? (
                <ActivityFeed teamId={selectedTeam} limit={50} />
              ) : teams.length > 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Hover over a team to view its activity feed</p>
                  <p className="text-xs text-gray-400 mt-1">Or click to open the team workspace</p>
                </div>
              ) : (
                <ActivityFeed limit={50} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <CreateTeamModal 
          onClose={() => setShowCreateModal(false)}
          onTeamCreated={(team) => {
            setShowCreateModal(false)
            loadTeams() // Refresh teams list after creating
            // Optionally navigate to the team workspace
            // navigate(`/team/${team.id}`)
          }}
        />
      )}
    </div>
  )
}

export default TeamsList

