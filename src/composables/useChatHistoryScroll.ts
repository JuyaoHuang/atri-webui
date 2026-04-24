import type { Ref } from 'vue'

import { nextTick, onScopeDispose, readonly, shallowRef, watch } from 'vue'

const TAIL_THRESHOLD = 24

function scheduleAfterLayoutSettles(task: () => void) {
  const requestFrame = globalThis.requestAnimationFrame?.bind(globalThis)
  if (!requestFrame) {
    queueMicrotask(task)
    return
  }

  requestFrame(() => {
    requestFrame(() => {
      task()
    })
  })
}

interface ScrollableChatMessage {
  id?: string
  role?: string
}

interface ChatHistoryScrollOptions<TMessage extends ScrollableChatMessage> {
  containerRef: Ref<HTMLDivElement | undefined>
  messages: Ref<TMessage[]>
  getKey: (message: TMessage, index: number) => string | number
}

export function useChatHistoryScroll<TMessage extends ScrollableChatMessage>({
  containerRef,
  messages,
  getKey
}: ChatHistoryScrollOptions<TMessage>) {
  const isFollowingTail = shallowRef(true)
  const previousLastMessageKey = shallowRef<string | number | null>(null)
  const pendingScrollKey = shallowRef<string | number | null>(null)
  const pendingStreamingFollow = shallowRef(false)
  const didInitialScroll = shallowRef(false)
  const isProgrammaticScroll = shallowRef(false)
  const stopListening = shallowRef<(() => void) | null>(null)

  const getContainer = () => containerRef.value

  const isNearTail = (container: HTMLElement) => {
    return container.scrollTop + container.clientHeight >= container.scrollHeight - TAIL_THRESHOLD
  }

  const updateFollowingTail = () => {
    const container = getContainer()
    if (!container) {
      isFollowingTail.value = true
      return
    }

    isFollowingTail.value = isNearTail(container)
  }

  const scrollToBottom = () => {
    const container = getContainer()
    if (!container) {
      return
    }

    isProgrammaticScroll.value = true
    container.scrollTo({ top: container.scrollHeight })
    nextTick(() => {
      isProgrammaticScroll.value = false
      updateFollowingTail()
    })
  }

  const findMessageElementByKey = (key: string | number) => {
    const container = getContainer()
    if (!container) {
      return null
    }

    const messageElements = Array.from(container.querySelectorAll<HTMLElement>('[data-chat-message-key]'))
    return messageElements.find(element => element.dataset.chatMessageKey === `${key}`) || null
  }

  const bindContainer = (container: HTMLDivElement) => {
    const handleScroll = () => {
      updateFollowingTail()
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    stopListening.value = () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }

  watch(
    containerRef,
    (container) => {
      stopListening.value?.()
      stopListening.value = null

      if (!container) {
        return
      }

      bindContainer(container)
      updateFollowingTail()

      if (!didInitialScroll.value) {
        didInitialScroll.value = true
        nextTick(() => {
          scheduleAfterLayoutSettles(() => {
            scrollToBottom()
          })
        })
      }
    },
    { immediate: true }
  )

  watch(
    messages,
    (currentMessages) => {
      const currentLastIndex = currentMessages.length - 1
      if (currentLastIndex < 0) {
        previousLastMessageKey.value = null
        pendingScrollKey.value = null
        pendingStreamingFollow.value = false
        return
      }

      const currentLastKey = getKey(currentMessages[currentLastIndex], currentLastIndex)
      const previousTailKey = previousLastMessageKey.value
      previousLastMessageKey.value = currentLastKey

      if (previousTailKey == null) {
        pendingScrollKey.value = null
        pendingStreamingFollow.value = currentMessages.length > 0
        return
      }

      if (previousTailKey === currentLastKey) {
        if (isFollowingTail.value) {
          pendingStreamingFollow.value = true
        }
        return
      }

      if (!isFollowingTail.value) {
        pendingScrollKey.value = null
        pendingStreamingFollow.value = false
        return
      }

      pendingScrollKey.value = currentLastKey
      pendingStreamingFollow.value = false
    },
    { deep: false, immediate: true }
  )

  watch(
    pendingScrollKey,
    async (messageKey) => {
      if (messageKey == null) {
        return
      }

      await nextTick()

      const target = findMessageElementByKey(messageKey)
      pendingScrollKey.value = null
      if (!target) {
        return
      }

      isProgrammaticScroll.value = true
      target.scrollIntoView({ block: 'start' })
      nextTick(() => {
        isProgrammaticScroll.value = false
        updateFollowingTail()
      })
    },
    { flush: 'post' }
  )

  watch(
    pendingStreamingFollow,
    async (shouldFollow) => {
      if (!shouldFollow) {
        return
      }

      await nextTick()
      pendingStreamingFollow.value = false
      scrollToBottom()
    },
    { flush: 'post' }
  )

  onScopeDispose(() => {
    stopListening.value?.()
  })

  return {
    isFollowingTail: readonly(isFollowingTail),
    scrollToBottom
  }
}
