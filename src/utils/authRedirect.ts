const AUTH_REDIRECT_STORAGE_KEY = 'atri_auth_redirect'

export function normalizeAuthRedirect(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/'
  }
  if (value.startsWith('/login') || value.startsWith('/auth/callback')) {
    return '/'
  }
  return value
}

export function saveAuthRedirect(value: string) {
  try {
    sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, normalizeAuthRedirect(value))
  } catch (error) {
    console.error('Failed to save auth redirect:', error)
  }
}

export function consumeAuthRedirect(fallback = '/') {
  try {
    const stored = sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY)
    return normalizeAuthRedirect(stored || fallback)
  } catch (error) {
    console.error('Failed to consume auth redirect:', error)
    return normalizeAuthRedirect(fallback)
  }
}
