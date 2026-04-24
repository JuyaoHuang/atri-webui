export function createTemporaryChatTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/\s+/g, ' ').trim()
  if (!cleaned) {
    return '新对话'
  }

  const firstSentence = cleaned.split(/[。！？!?；;\n\r]/)[0]?.trim() || cleaned
  return firstSentence.slice(0, 8) || '新对话'
}
