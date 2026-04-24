const EXPRESSION_TAG_PATTERN = /\[expression:([^[\]]+)\]/i

export function extractLive2dExpression(text: string) {
  const match = text.match(EXPRESSION_TAG_PATTERN)
  const expression = match?.[1]?.trim() || null
  const content = text.replace(EXPRESSION_TAG_PATTERN, '').trimStart()

  return {
    expression,
    content
  }
}
