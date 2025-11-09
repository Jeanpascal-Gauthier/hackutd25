import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useReducedMotion } from '../hooks/useReducedMotion'

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ')
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase()
      }
      return user.name.charAt(0).toUpperCase()
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getRoleLabel = () => {
    if (user?.role === 'engineer') return 'Database Engineer'
    if (user?.role === 'technician') return 'Database Technician'
    return 'User'
  }

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center text-sm font-medium hover:bg-accent-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {getInitials()}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              ref={menuRef}
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: -10 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: -10 }
              }
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-bg-elevated border border-border rounded-lg shadow-lg z-50 overflow-hidden max-h-[calc(100vh-5rem)] overflow-y-auto"
            >
              {/* User Info Header */}
              <div className="p-4 border-b border-border bg-bg-secondary">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center text-lg font-medium flex-shrink-0">
                      {getInitials()}
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 border-2 border-bg-elevated rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {user?.name || user?.username || 'User'}
                      </p>
                      {user?.role === 'engineer' && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-accent-500/20 text-accent-600 dark:text-accent-400 rounded">
                          Engineer
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate">
                      {user?.email || 'No email'}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      {getRoleLabel()}
                      {user?.team && ` • ${user.team.charAt(0).toUpperCase() + user.team.slice(1)} Team`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {/* Account Details */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs font-medium text-text-secondary mb-3 uppercase tracking-wide">
                    Account Details
                  </p>
                  <div className="space-y-2.5 text-sm">
                    {user?.username && (
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-text-tertiary">Username:</span>
                        </div>
                        <span className="text-text-primary font-mono text-right">{user.username}</span>
                      </div>
                    )}
                    {user?.email && (
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-text-tertiary">Email:</span>
                        </div>
                        <span className="text-text-primary text-right break-all">{user.email}</span>
                      </div>
                    )}
                    {user?.team && (
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-text-tertiary">Team:</span>
                        </div>
                        <span className="text-text-primary capitalize text-right">{user.team}</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-text-tertiary">Role:</span>
                      </div>
                      <span className="text-text-primary text-right">{getRoleLabel()}</span>
                    </div>
                    {user?.id && (
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          <span className="text-text-tertiary">User ID:</span>
                        </div>
                        <span className="text-text-primary font-mono text-right text-xs">{user.id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Management Section */}
                <div className="px-2 py-2">
                  <p className="px-3 py-1.5 text-xs font-medium text-text-secondary mb-1 uppercase tracking-wide">
                    Account Management
                  </p>
                  
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      // Navigate to account settings page (if exists)
                      // navigate('/settings')
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 2.926.186 2.926 1.235 0 1.07-.927 1.94-2.07 2.06-.83.12-1.624.38-2.348.748-.595.23-1.223.4-1.872.518a7.577 7.577 0 01-1.436-.086 4.331 4.331 0 01-1.719-1.023 4.33 4.33 0 01-1.023-1.719 7.516 7.516 0 01-.086-1.436c.118-.65.288-1.277.518-1.872.368-.724.628-1.519.748-2.348.12-1.143.99-2.07 2.06-2.07 1.049 0 2.175 1.383 1.235 2.926a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.186 2.926-1.235 2.926-1.07 0-1.94-.927-2.06-2.07-.12-.83-.38-1.624-.748-2.348a7.516 7.516 0 01-.518-1.872 7.577 7.577 0 01.086-1.436c.65-.118 1.277-.288 1.872-.518z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false)
                      // Navigate to profile page (if exists)
                      // navigate('/profile')
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false)
                      // Navigate to preferences (if exists)
                      // navigate('/preferences')
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    <span>Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false)
                      // Navigate to security settings (if exists)
                      // navigate('/security')
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Security & Privacy</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="px-2 pt-2 border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-sm text-danger-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserMenu

