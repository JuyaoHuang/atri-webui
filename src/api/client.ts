import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { clearStoredAuthToken, getStoredAuthToken } from '@/utils/authToken'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8430',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredAuthToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (window.location.pathname === '/login' || window.location.pathname === '/auth/callback') {
    return
  }

  window.location.assign(`/login?redirect=${encodeURIComponent(currentPath)}`)
}

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const message = (error.response.data as { detail?: string })?.detail || 'Request failed'

      console.error(`API Error [${status}]:`, message)

      switch (status) {
        case 400:
          console.error('Bad request:', message)
          break
        case 401:
          if (!error.config?.url?.startsWith('/api/auth')) {
            clearStoredAuthToken()
            redirectToLogin()
          }
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error, please retry later')
          break
        default:
          console.error(message)
      }
    } else if (error.request) {
      console.error('Network request failed')
    } else {
      console.error('Request failed')
    }

    return Promise.reject(error)
  }
)

export default client
