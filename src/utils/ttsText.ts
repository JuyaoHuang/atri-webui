const FULL_WIDTH_PAREN_PATTERN = /（[^（）]*）/g
const HALF_WIDTH_PAREN_PATTERN = /\([^()]*\)/g

function stripParentheticalContent(text: string) {
  let current = text
  let next = current
  do {
    next = current
      .replace(FULL_WIDTH_PAREN_PATTERN, '')
      .replace(HALF_WIDTH_PAREN_PATTERN, '')
    if (next !== current) {
      current = next
    }
  } while (next !== current)

  return current
}

export function cleanAiReplyTextForTts(text: string): string {
  const stripped = stripParentheticalContent(text)
  const segments = stripped
    .split(/\r?\n/)
    .map(segment => segment.trim())
    .filter(Boolean)

  return segments.join('').trim()
}
