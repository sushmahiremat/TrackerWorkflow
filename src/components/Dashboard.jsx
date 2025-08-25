import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useProject } from '../contexts/ProjectContext.jsx'
import { useTopNav } from '../contexts/TopNavContext.jsx'
import CreateProjectModal from './CreateProjectModal.jsx'
import EditProjectModal from './EditProjectModal.jsx'

import { 
  Plus, 
  TrendingUp,
  AlertCircle,
  Clock,
  Star,
  Search,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react'

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [projectTaskCounts, setProjectTaskCounts] = useState({})
  const [openDropdowns, setOpenDropdowns] = useState({})
  const navigate = useNavigate()
  const { user } = useAuth()
  const { projects, tasks, loading, initialLoading, error, loadProjects, loadTasksByProject, deleteProject, getTaskCountByProject } = useProject()
  const { projectSearchTerm, setProjectSearchTerm, setOnAddProjectClick } = useTopNav()

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`)
  }

  const handleEditProject = (e, project) => {
    e.stopPropagation()
    setProjectToEdit(project)
    setShowEditModal(true)
    closeDropdown(project.id)
  }

  const handleDeleteProject = (e, project) => {
    e.stopPropagation()
    setProjectToDelete(project)
    setShowDeleteModal(true)
    closeDropdown(project.id)
  }

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return
    
    try {
      await deleteProject(projectToDelete.id)
      setShowDeleteModal(false)
      setProjectToDelete(null)
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleProjectUpdate = (updatedProject) => {
    // The context will automatically update the projects list
    setShowEditModal(false)
    setProjectToEdit(null)
    setOpenDropdowns({}) // Close all dropdowns
  }

  const toggleDropdown = (e, projectId) => {
    e.stopPropagation()
    setOpenDropdowns(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }))
  }

  const closeDropdown = (projectId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [projectId]: false
    }))
  }

  // Load tasks for all projects when dashboard mounts
  useEffect(() => {
    if (!initialLoading && projects.length > 0) {
      // Load task counts for each project efficiently
      const loadTaskCounts = async () => {
        const counts = {}
        for (const project of projects) {
          try {
            const taskCount = await getTaskCountByProject(project.id)
            counts[project.id] = taskCount
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100))
          } catch (error) {
            console.error(`Failed to get task count for project ${project.id}:`, error)
            counts[project.id] = 0
          }
        }
        setProjectTaskCounts(counts)
      }
      
      loadTaskCounts()
    }
  }, [initialLoading, projects, getTaskCountByProject])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate statistics
  const totalProjects = projects.length

  // Calculate task count for each project
  const getTaskCountForProject = (projectId) => {
    return projectTaskCounts[projectId] || 0
  }

  // Filter projects based on search term from context
  const filteredProjects = React.useMemo(() => {
    if (!projects || projects.length === 0) return []
    
    return projects.filter(project =>
      project.name.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(projectSearchTerm.toLowerCase()))
    )
  }, [projects, projectSearchTerm])

  // Set up Add Project click handler for top navigation
  useEffect(() => {
    setOnAddProjectClick(() => () => setShowCreateModal(true))
    
    // Cleanup function
    return () => setOnAddProjectClick(null)
  }, [setOnAddProjectClick])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdowns({})
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message and Total Projects Row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-gray-600">Here's what's happening with your projects today.</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-xl font-bold text-gray-900">
                  {initialLoading ? '...' : totalProjects}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={loadProjects}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}



        {/* Quick Actions Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer text-left hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Create Project</p>
                  <p className="text-xs text-gray-500">Start a new project</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/recent')}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer text-left hover:border-purple-300 hover:bg-purple-50"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Recent Activity</p>
                  <p className="text-xs text-gray-500">View latest updates</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/starred')}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer text-left hover:border-orange-300 hover:bg-orange-50"
            >
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Starred Items</p>
                  <p className="text-xs text-gray-500">Quick access favorites</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Projects Section */}
        {initialLoading ? (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recently Updated</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recently Updated {projectSearchTerm && `(${filteredProjects.length} found)`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {(projectSearchTerm ? filteredProjects : projects).slice(0, 3).map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 relative group"
                >
                   {/* Three-dots menu */}
                   <div className="absolute top-2 right-2">
                     <div className="relative">
                       <button
                         onClick={(e) => toggleDropdown(e, project.id)}
                         className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                       >
                         <MoreVertical className="h-4 w-4 text-gray-500" />
                       </button>
                       
                       {/* Dropdown menu */}
                       {openDropdowns[project.id] && (
                         <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                           <button
                             onClick={(e) => handleEditProject(e, project)}
                             className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                           >
                             <Edit className="h-4 w-4" />
                             <span>Edit</span>
                           </button>
                           <button
                             onClick={(e) => handleDeleteProject(e, project)}
                             className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                           >
                             <Trash2 className="h-4 w-4" />
                             <span>Delete</span>
                           </button>
                         </div>
                       )}
                     </div>
                   </div>
                  
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 truncate pr-8">{project.name}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-6">
                      {getTaskCountForProject(project.id)} tasks
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description || 'No description'}</p>
                  <div className="text-xs text-gray-500">
                    Updated: {formatDate(project.updated_at || project.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Projects Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              All Projects {projectSearchTerm && `(${filteredProjects.length} found)`}
            </h2>
            <div className="text-sm text-gray-500">
              {initialLoading ? 'Loading...' : 
                projects.length > 0 ? `Showing ${projectSearchTerm ? filteredProjects.length : projects.length} project${(projectSearchTerm ? filteredProjects.length : projects.length) !== 1 ? 's' : ''}` : 'No projects yet'
              }
            </div>
          </div>
        </div>

        {/* Project Cards */}
        {initialLoading ? (
          <div className="dashboard-grid">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="card animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-grid">
            {(projectSearchTerm ? filteredProjects : projects).map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer relative group"
              >
                {/* Three-dots menu */}
                <div className="absolute top-2 right-2">
                  <div className="relative">
                    <button
                      onClick={(e) => toggleDropdown(e, project.id)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    
                    {/* Dropdown menu */}
                    {openDropdowns[project.id] && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                        <button
                          onClick={(e) => handleEditProject(e, project)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(e, project)}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 pr-8">{project.name}</h3>
                  <span className="text-sm text-gray-500 mt-8">{getTaskCountForProject(project.id)} tasks</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description || 'No description'}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Created: {formatDate(project.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!initialLoading && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              {projectSearchTerm ? (
                <Search className="h-6 w-6 text-gray-400" />
              ) : (
                <Plus className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {projectSearchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {projectSearchTerm 
                ? `No projects match "${projectSearchTerm}". Try a different search term.`
                : 'Get started by creating your first project'
              }
            </p>
            {!projectSearchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Project
              </button>
            )}
          </div>
        )}

        {/* Helpful Tips Section */}
        {!initialLoading && (
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Pro Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">• Use the search bar in project pages to quickly find tasks</p>
                <p className="text-blue-700">Navigate to any project and use the search functionality</p>
              </div>
              <div>
                <p className="font-medium mb-1">• Drag and drop tasks between columns</p>
                <p className="text-blue-700">Update task status by moving them across the Kanban board</p>
              </div>
              <div>
                <p className="font-medium mb-1">• AI-powered task suggestions</p>
                <p className="text-blue-700">Get smart summaries and subtask recommendations when creating tasks</p>
              </div>
              <div>
                <p className="font-medium mb-1">• Collapse the sidebar for more workspace</p>
                <p className="text-blue-700">Click the menu button to toggle sidebar visibility</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => {
          setShowCreateModal(false)
          setOpenDropdowns({}) // Close all dropdowns
        }} />
      )}

      {/* Edit Project Modal */}
      {showEditModal && projectToEdit && (
        <EditProjectModal 
          project={projectToEdit}
          onClose={() => {
            setShowEditModal(false)
            setProjectToEdit(null)
            setOpenDropdowns({}) // Close all dropdowns
          }}
          onUpdate={handleProjectUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="modal-overlay" onClick={() => {
          setShowDeleteModal(false)
          setProjectToDelete(null)
          setOpenDropdowns({}) // Close all dropdowns
        }}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Project
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete "<strong>{projectToDelete.name}</strong>"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProject}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

export default Dashboard 