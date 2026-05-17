import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { clearStoredAuthState } from '@/utils/authToken'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8430',
  timeout: 12000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config
})

type ApiValidationDetail = {
  loc?: Array<string | number>
  msg?: string
}

type ApiErrorData = {
  detail?: string | ApiValidationDetail[]
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorData | undefined
    const detail = data?.detail

    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }

    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0]
      const fieldPath = Array.isArray(first.loc) ? first.loc.slice(1).join('.') : ''
      const message = first.msg?.trim() || 'Request failed'
      return fieldPath ? `${fieldPath}: ${message}` : message
    }

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return '请求失败'
}

function redirectToLogin(reason = 'expired') {
  if (typeof window === 'undefined') {
    return
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (window.location.pathname === '/login' || window.location.pathname === '/auth/callback') {
    return
  }

  window.location.assign(
    `/login?redirect=${encodeURIComponent(currentPath)}&reason=${encodeURIComponent(reason)}`
  )
}

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const message = getApiErrorMessage(error)

      console.error(`API Error [${status}]:`, message)

      switch (status) {
        case 400:
          console.error('Bad request:', message)
          break
        case 401:
          if (!error.config?.url?.startsWith('/api/auth')) {
            clearStoredAuthState()
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
