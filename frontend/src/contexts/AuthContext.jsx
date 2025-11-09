import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error('Error parsing user data:', err)
      }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    const userWithRole = {
      ...userData,
      role: userData.role || 'technician', // Default to technician if not provided
    }
    setUser(userWithRole)
    localStorage.setItem('user', JSON.stringify(userWithRole))
    localStorage.setItem('auth_token', userData.token || 'demo_token')
    
    // Store token in Authorization header format for future API calls
    if (userData.token) {
      // Token will be sent via fetch headers in API calls
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
  }

  const isEngineer = () => user?.role === 'engineer'
  const isTechnician = () => user?.role === 'technician'

  return (
    <AuthContext.Provider value={{ user, login, logout, isEngineer, isTechnician, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

