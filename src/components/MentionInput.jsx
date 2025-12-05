import React, { useState, useRef, useEffect } from 'react'
import TeamMemberAvatar from './TeamMemberAvatar.jsx'

const MentionInput = ({ value, onChange, members = [], placeholder = "Type @ to mention someone...", rows = 3, disabled = false }) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [mentionStart, setMentionStart] = useState(-1)
  const textareaRef = useRef(null)
  const suggestionsRef = useRef(null)
  
  const handleChange = (e) => {
    const text = e.target.value
    const cursorPos = e.target.selectionStart
    
    // Find @mention pattern
    const textBeforeCursor = text.substring(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      const start = cursorPos - mentionMatch[0].length
      setMentionStart(start)
      setShowSuggestions(true)
      setSuggestionIndex(0)
    } else {
      setShowSuggestions(false)
      setMentionStart(-1)
    }
    
    onChange(e)
  }
  
  const getMentionQuery = () => {
    if (mentionStart === -1) return ''
    const textBeforeCursor = value.substring(0, textareaRef.current?.selectionStart || 0)
    const match = textBeforeCursor.match(/@(\w*)$/)
    return match ? match[1].toLowerCase() : ''
  }
  
  const getFilteredMembers = () => {
    const query = getMentionQuery()
    if (!query) return members
    
    return members.filter(member =>
      member.user_name?.toLowerCase().includes(query) ||
      member.user_email?.toLowerCase().includes(query)
    )
  }
  
  const insertMention = (member) => {
    if (!textareaRef.current) return
    
    const text = value
    const cursorPos = textareaRef.current.selectionStart
    const textBefore = text.substring(0, mentionStart)
    const textAfter = text.substring(cursorPos)
    const newText = `${textBefore}@${member.user_name} ${textAfter}`
    
    onChange({ target: { value: newText } })
    setShowSuggestions(false)
    setMentionStart(-1)
    
    // Focus back on textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStart + member.user_name.length + 2 // +2 for @ and space
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }
  
  const handleKeyDown = (e) => {
    if (!showSuggestions) return
    
    const filtered = getFilteredMembers()
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSuggestionIndex(prev => (prev + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSuggestionIndex(prev => (prev - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      if (filtered[suggestionIndex]) {
        insertMention(filtered[suggestionIndex])
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }
  
  const renderTextWithMentions = () => {
    if (!value) return null
    
    const parts = []
    const mentionRegex = /@([a-zA-Z0-9\s\-]+)/g
    let lastIndex = 0
    let match
    
    while ((match = mentionRegex.exec(value)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{value.substring(lastIndex, match.index)}</span>)
      }
      
      // Add mention
      const mentionedName = match[1]
      const member = members.find(m => m.user_name === mentionedName)
      parts.push(
        <span key={`mention-${match.index}`} className="bg-blue-100 text-blue-700 px-1 rounded font-medium">
          @{mentionedName}
        </span>
      )
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < value.length) {
      parts.push(<span key={`text-${lastIndex}`}>{value.substring(lastIndex)}</span>)
    }
    
    return parts
  }
  
  const filteredMembers = getFilteredMembers()
  
  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100"
      />
      
      {/* Preview of mentions (optional, can be shown below) */}
      {value && value.includes('@') && (
        <div className="mt-1 text-xs text-gray-500">
          {renderTextWithMentions()}
        </div>
      )}
      
      {showSuggestions && filteredMembers.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto"
          style={{ top: '100%' }}
        >
          {filteredMembers.map((member, index) => (
            <button
              key={member.id || member.user_name}
              type="button"
              onClick={() => insertMention(member)}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                index === suggestionIndex ? 'bg-blue-50' : ''
              }`}
            >
              <TeamMemberAvatar member={member} size="sm" showStatus={false} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{member.user_name}</div>
                {member.user_email && (
                  <div className="text-xs text-gray-500 truncate">{member.user_email}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MentionInput

