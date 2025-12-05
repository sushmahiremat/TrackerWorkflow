import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useProject } from '../contexts/ProjectContext.jsx'
import { useTopNav } from '../contexts/TopNavContext.jsx'
import { useTaskNotifications } from '../hooks/useTaskNotifications.js'
import UserProfile from './UserProfile.jsx'
import NotificationCenter from './NotificationCenter.jsx'
import { 
  Home,
  FolderOpen,
  Folder,
  Clock,
  Star,
  Settings,
  Users,
  BarChart3,
  Search,
  Plus,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Filter,
  MoreHorizontal
} from 'lucide-react'

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [projectsExpanded, setProjectsExpanded] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { projects, tasks, loadAllTasks } = useProject()
  const { taskSearchTerm, setTaskSearchTerm, onAddTaskClick, projectSearchTerm, setProjectSearchTerm, onAddProjectClick } = useTopNav()

  // Load all tasks for notifications
  useEffect(() => {
    if (loadAllTasks) {
      loadAllTasks()
    }
  }, [loadAllTasks])

  // Set up task notifications
  useTaskNotifications({
    enabled: true,
    checkInterval: 60000, // Check every minute
    notifyOverdue: true,
    notifyDueToday: true,
    notifyDueSoon: true,
    daysAhead: 1,
    onTaskClick: (task) => {
      // Navigate to the task's project when notification is clicked
      if (task.project_id) {
        navigate(`/project/${task.project_id}`)
        window.focus()
      }
    }
  })

  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      action: () => navigate('/dashboard')
    },
    {
      title: 'Recent',
      icon: Clock,
      path: '/recent',
      action: () => navigate('/recent')
    },
    {
      title: 'Starred',
      icon: Star,
      path: '/starred',
      action: () => navigate('/starred')
    }
  ]

  // Use actual projects from context
  const projectItems = projects.slice(0, 10) // Limit to 10 projects for sidebar

  const bottomItems = [
    {
      title: 'Team',
      icon: Users,
      path: '/teams',
      action: () => navigate('/teams')
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      action: () => console.log('Analytics clicked')
    },
    {
      title: 'Settings',
      icon: Settings,
      action: () => console.log('Settings clicked')
    }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-lg font-bold text-blue-600">Workflow Tracker</h1>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded hover:bg-gray-100"
            >
              {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="p-2">
            {sidebarItems.map((item) => (
              <button
                key={item.title}
                onClick={item.action}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md mb-1 transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="ml-3">{item.title}</span>}
              </button>
            ))}
          </div>

          {/* Projects Section */}
          {!sidebarCollapsed && (
            <div className="mt-4">
              <div className="px-3 py-2">
                <button
                  onClick={() => setProjectsExpanded(!projectsExpanded)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  <div className="flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Projects
                  </div>
                  {projectsExpanded ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </button>
              </div>
              
              {projectsExpanded && (
                <div className="px-2 space-y-1">
                  {projectItems.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => navigate(`/project/${project.id}`)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md text-left transition-colors ${
                        location.pathname === `/project/${project.id}`
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Folder className="h-4 w-4 mr-2 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{project.name}</div>
                        <div className="truncate text-xs text-gray-500">{project.description || 'No description'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Bottom */}
        <div className="border-t border-gray-200 p-2">
          {bottomItems.map((item) => (
            <button
              key={item.title}
              onClick={item.action}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3">{item.title}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
                 <header className="bg-white border-b border-gray-200 px-6 py-3">
           <div className="flex items-center justify-between">
             {/* Left section - Breadcrumbs */}
             <div className="flex items-center space-x-4">
               <nav className="flex items-center space-x-2 text-sm text-gray-600">
                 <button 
                   onClick={() => navigate('/dashboard')}
                   className="hover:text-gray-900"
                 >
                   Dashboard
                 </button>
                 {location.pathname.includes('/project/') && (
                   <>
                     <ChevronRight className="h-4 w-4" />
                     <span className="text-gray-900">Project</span>
                   </>
                 )}
               </nav>
             </div>

             {/* Center section - Search and Add buttons for different pages */}
             {location.pathname.includes('/project/') && (
               <div className="flex items-center space-x-4">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                   <input
                     type="text"
                     placeholder="Search tasks..."
                     value={taskSearchTerm}
                     onChange={(e) => setTaskSearchTerm(e.target.value)}
                     className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-96"
                   />
                 </div>
                 <button 
                   onClick={() => {
                     if (onAddTaskClick) {
                       onAddTaskClick()
                     }
                   }}
                   className="btn-primary flex items-center space-x-2 px-4 py-2"
                 >
                   <Plus className="h-4 w-4" />
                   <span>Add Task</span>
                 </button>
               </div>
             )}

             {/* Center section - Search and Add Project for Dashboard page */}
             {location.pathname === '/dashboard' && (
               <div className="flex items-center space-x-4">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                   <input
                     type="text"
                     placeholder="Search projects..."
                     value={projectSearchTerm}
                     onChange={(e) => setProjectSearchTerm(e.target.value)}
                     className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-96"
                   />
                 </div>
                 <button 
                   onClick={() => {
                     if (onAddProjectClick) {
                       onAddProjectClick()
                     }
                   }}
                   className="btn-primary flex items-center space-x-2 px-4 py-2"
                 >
                   <Plus className="h-4 w-4" />
                   <span>Add Project</span>
                 </button>
               </div>
             )}

             {/* Right section - Notifications and User Profile */}
             <div className="flex items-center space-x-3">
               <NotificationCenter />
               <UserProfile />
             </div>
           </div>
         </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
