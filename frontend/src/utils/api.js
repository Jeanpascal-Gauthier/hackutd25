/**
 * Helper function to make authenticated API calls
 * Automatically includes JWT token from localStorage
 */
export async function apiCall(url, options = {}) {
  const token = localStorage.getItem('auth_token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  return response
}

