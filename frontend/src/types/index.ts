export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface Chat {
  id: string
  projectId: string
  title: string
  messages: Message[]
}

export interface Project {
  id: string
  name: string
  description: string
  chats: Chat[]
}
