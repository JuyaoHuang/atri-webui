import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useWebSocketStore } from '@/stores/websocket'
import { useCharactersStore } from '@/stores/characters'
import { chatsApi } from '@/api/chats'

export function useChat() {
  const chatStore = useChatStore()
  const wsStore = useWebSocketStore()
  const charactersStore = useCharactersStore()

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const { currentChatId, currentCharacterId } = chatStore

    if (!currentCharacterId) {
      console.error('No character selected')
      return
    }

    // 添加用户消息到本地状态
    chatStore.addMessage({
      id: `msg_${Date.now()}`,
      chat_id: currentChatId || '',
      role: 'human',
      content: text,
      timestamp: new Date().toISOString()
    })

    // 通过 WebSocket 发送
    wsStore.send({
      type: 'input:text',
      data: {
        text,
        chat_id: currentChatId,
        character_id: currentCharacterId
      }
    })

    // 标记为流式输出中
    chatStore.isStreaming = true
  }

  const loadHistory = async (chatId: string) => {
    try {
      const response = await chatsApi.get({ chat_id: chatId })
      chatStore.messages = response.messages.map((msg, index) => {
        // 如果是 AI 消息且有 name，从 characters store 获取 avatar
        let avatar: string | undefined
        if (msg.role === 'ai' && msg.name) {
          const character = charactersStore.characters.find((c) => c.id === msg.name)
          avatar = character?.avatar
        }

        return {
          id: `msg_${index}`,
          chat_id: chatId,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          name: msg.name,
          avatar
        }
      })
    } catch (error) {
      console.error('加载聊天历史失败:', error)
    }
  }

  return {
    messages: computed(() => chatStore.messages),
    isStreaming: computed(() => chatStore.isStreaming),
    streamingText: computed(() => chatStore.streamingText),
    sendMessage,
    loadHistory
  }
}
