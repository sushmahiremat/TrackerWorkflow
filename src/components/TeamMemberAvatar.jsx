import React from 'react'
import { Circle } from 'lucide-react'

const TeamMemberAvatar = ({ member, size = 'md', showStatus = true, showName = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
    xl: 'h-12 w-12 text-lg'
  }
  
  const statusColors = {
    ONLINE: 'bg-green-500',
    OFFLINE: 'bg-gray-400',
    AWAY: 'bg-yellow-500',
    BUSY: 'bg-red-500'
  }
  
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  
  const avatarUrl = member?.avatar_url || member?.user_avatar
  const userName = member?.user_name || member?.name || 'Unknown'
  const status = member?.status || 'OFFLINE'
  
  return (
    <div className="relative inline-flex items-center">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={userName}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium border-2 border-white`}>
          {getInitials(userName)}
        </div>
      )}
      
      {showStatus && (
        <span className={`absolute bottom-0 right-0 ${size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'} ${statusColors[status]} rounded-full border-2 border-white`} />
      )}
      
      {showName && (
        <span className="ml-2 text-sm text-gray-700">{userName}</span>
      )}
    </div>
  )
}

export default TeamMemberAvatar

