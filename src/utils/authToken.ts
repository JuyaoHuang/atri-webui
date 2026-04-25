export const AUTH_TOKEN_STORAGE_KEY = 'atri_auth_token'
export const AUTH_SIGNED_IN_AT_STORAGE_KEY = 'atri_auth_signed_in_at'

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to read auth token:', error)
    return null
  }
}

export function setStoredAuthToken(token: string) {
  try {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  } catch (error) {
    console.error('Failed to save auth token:', error)
  }
}

export function getStoredSignedInAt(): string | null {
  try {
    return localStorage.getItem(AUTH_SIGNED_IN_AT_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to read auth sign-in time:', error)
    return null
  }
}

export function setStoredSignedInAt(value: string) {
  try {
    localStorage.setItem(AUTH_SIGNED_IN_AT_STORAGE_KEY, value)
  } catch (error) {
    console.error('Failed to save auth sign-in time:', error)
  }
}

export function clearStoredAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(AUTH_SIGNED_IN_AT_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear auth token:', error)
  }
}
