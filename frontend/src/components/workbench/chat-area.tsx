import { useState, useRef, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"
import MessageRenderer from "@/components/workbench/message-renderer"
import type { Project, Chat } from "@/types"

interface ChatAreaProps {
  chat?: Chat
  project?: Project
  onSendMessage: (content: string) => void
}

export default function ChatArea({ chat, project, onSendMessage }: ChatAreaProps) {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat?.messages, isLoading])

  const handleSend = () => {
    if (inputValue.trim()) {
      setIsLoading(true)
      onSendMessage(inputValue)
      setInputValue("")
      setTimeout(() => setIsLoading(false), 800)
    }
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">DesignForge</div>
          <p className="text-muted-foreground">Select or create a chat to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="border-b border-border px-6 py-4 bg-card">
        <h1 className="text-lg font-semibold text-foreground">{chat.title}</h1>
        {project && <p className="text-sm text-muted-foreground mt-1">{project.name}</p>}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chat.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <>
            {chat.messages.map((message) => (
              <MessageRenderer key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-lg rounded-tl-none p-4 flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Describe your architecture requirements..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-2 font-medium"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
