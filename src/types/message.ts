export interface Message {
  id: string
  chat_id: string
  role: 'human' | 'ai'
  content: string
  timestamp: string
}
