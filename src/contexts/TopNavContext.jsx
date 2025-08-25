import React, { createContext, useContext, useState } from 'react'

const TopNavContext = createContext()

export const useTopNav = () => {
  const context = useContext(TopNavContext)
  if (!context) {
    throw new Error('useTopNav must be used within a TopNavProvider')
  }
  return context
}

export const TopNavProvider = ({ children }) => {
  const [taskSearchTerm, setTaskSearchTerm] = useState('')
  const [onAddTaskClick, setOnAddTaskClick] = useState(null)
  
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [onAddProjectClick, setOnAddProjectClick] = useState(null)

  const value = {
    taskSearchTerm,
    setTaskSearchTerm,
    onAddTaskClick,
    setOnAddTaskClick,
    projectSearchTerm,
    setProjectSearchTerm,
    onAddProjectClick,
    setOnAddProjectClick
  }

  return (
    <TopNavContext.Provider value={value}>
      {children}
    </TopNavContext.Provider>
  )
}
