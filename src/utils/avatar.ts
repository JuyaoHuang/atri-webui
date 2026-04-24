const ABSOLUTE_URL_RE = /^(?:https?:)?\/\//

export function resolveAvatarUrl(
  avatar?: string | null,
  avatarUrl?: string | null,
): string | null {
  const candidate = avatarUrl ?? avatar
  if (!candidate) {
    return null
  }

  if (
    ABSOLUTE_URL_RE.test(candidate)
    || candidate.startsWith('/')
    || candidate.startsWith('data:')
    || candidate.startsWith('blob:')
  ) {
    return candidate
  }

  return `/avatars/${candidate}`
}
