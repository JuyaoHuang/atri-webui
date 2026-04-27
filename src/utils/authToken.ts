export const AUTH_SIGNED_IN_AT_STORAGE_KEY = 'atri_auth_signed_in_at'
const LEGACY_AUTH_TOKEN_STORAGE_KEY = 'atri_auth_token'

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

export function clearStoredAuthState() {
  try {
    localStorage.removeItem(LEGACY_AUTH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(AUTH_SIGNED_IN_AT_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear auth state:', error)
  }
}
