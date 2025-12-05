import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, User } from 'lucide-react'
import TeamMemberAvatar from './TeamMemberAvatar.jsx'

const TeamMemberSelector = ({ members = [], value, onChange, placeholder = "Select team member", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  
  const filteredMembers = members.filter(member =>
    member.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const selectedMember = members.find(m => m.user_name === value)
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  const handleSelect = (member) => {
    onChange(member.user_name)
    setIsOpen(false)
    setSearchTerm('')
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {selectedMember ? (
            <>
              <TeamMemberAvatar member={selectedMember} size="sm" showStatus={false} />
              <span className="text-gray-700 truncate">{selectedMember.user_name}</span>
            </>
          ) : (
            <>
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">{placeholder}</span>
            </>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          
          <div className="py-1">
            {filteredMembers.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">No members found</div>
            ) : (
              filteredMembers.map((member) => (
                <button
                  key={member.id || member.user_name}
                  type="button"
                  onClick={() => handleSelect(member)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <TeamMemberAvatar member={member} size="sm" showStatus={true} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{member.user_name}</div>
                    {member.user_email && (
                      <div className="text-xs text-gray-500 truncate">{member.user_email}</div>
                    )}
                  </div>
                  {value === member.user_name && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamMemberSelector

