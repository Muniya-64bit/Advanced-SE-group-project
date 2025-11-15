import { useState } from "react"
import Sidebar from "@/components/workbench/sidebar"
import ChatArea from "@/components/workbench/chat-area"
import Header from "@/components/workbench/header"
import type { Project, Chat } from "@/types"

interface WorkbenchLayoutProps {
  onLogout: () => void
}

export default function WorkbenchLayout({ onLogout }: WorkbenchLayoutProps) {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "E-Commerce Platform",
      description: "Design a scalable e-commerce solution",
      chats: [
        {
          id: "chat-1",
          projectId: "1",
          title: "Initial Architecture Discussion",
          messages: [
            {
              id: "msg-1",
              role: "user",
              content: "Design a scalable e-commerce platform that can handle 1M+ daily users",
              timestamp: new Date(),
            },
            {
              id: "msg-2",
              role: "assistant",
              content: `# Recommended E-Commerce Architecture

## Overview
A microservices-based architecture optimized for scalability, reliability, and performance.

## Components

### Frontend Layer
- **Web**: React/Next.js with SSR for SEO
- **Mobile**: React Native for iOS/Android

### API Gateway
- Kong or AWS API Gateway for request routing and rate limiting

### Core Services
\`\`\`mermaid
graph LR
    Client[Client Apps]
    Gateway[API Gateway]
    User[User Service]
    Product[Product Service]
    Cart[Shopping Cart Service]
    Order[Order Service]
    Payment[Payment Service]
    
    Client --> Gateway
    Gateway --> User
    Gateway --> Product
    Gateway --> Cart
    Gateway --> Order
    Gateway --> Payment
\`\`\`

### Database Strategy
- **PostgreSQL** for transactional data (Users, Orders)
- **MongoDB** for flexible product catalog
- **Redis** for caching and sessions
- **Elasticsearch** for product search

## Rationale
1. **Microservices**: Independent scaling and deployment
2. **Event-Driven**: Services communicate via message queues
3. **Caching**: Redis reduces DB load by 70%
4. **CDN**: CloudFront for static assets`,
              timestamp: new Date(Date.now() - 3600000),
            },
          ],
        },
        {
          id: "chat-2",
          projectId: "1",
          title: "Database Optimization",
          messages: [
            {
              id: "msg-3",
              role: "user",
              content: "How should we optimize the database for fast queries?",
              timestamp: new Date(Date.now() - 7200000),
            },
          ],
        },
      ],
    },
    {
      id: "2",
      name: "Real-time Collaboration Tool",
      description: "Build a collaborative document editing platform",
      chats: [],
    },
  ])

  const [selectedProjectId, setSelectedProjectId] = useState<string>("1")
  const [selectedChatId, setSelectedChatId] = useState<string>("chat-1")

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const selectedChat = selectedProject?.chats.find((c) => c.id === selectedChatId)

  const handleAddProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      chats: [],
    }
    setProjects([...projects, newProject])
    setSelectedProjectId(newProject.id)
  }

  const handleDeleteProject = (projectId: string) => {
    const newProjects = projects.filter((p) => p.id !== projectId)
    setProjects(newProjects)
    if (selectedProjectId === projectId && newProjects.length > 0) {
      setSelectedProjectId(newProjects[0].id)
      if (newProjects[0].chats.length > 0) {
        setSelectedChatId(newProjects[0].chats[0].id)
      }
    }
  }

  const handleRenameProject = (projectId: string, newName: string) => {
    setProjects(projects.map((p) => (p.id === projectId ? { ...p, name: newName } : p)))
  }

  const handleAddChat = (title: string) => {
    if (!selectedProject) return
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      projectId: selectedProjectId,
      title,
      messages: [],
    }
    setProjects(projects.map((p) => (p.id === selectedProjectId ? { ...p, chats: [...p.chats, newChat] } : p)))
    setSelectedChatId(newChat.id)
  }

  const handleDeleteChat = (chatId: string) => {
    setProjects(
      projects.map((p) =>
        p.id === selectedProjectId
          ? {
              ...p,
              chats: p.chats.filter((c) => c.id !== chatId),
            }
          : p,
      ),
    )
    if (selectedChatId === chatId && selectedProject?.chats.length! > 1) {
      const remainingChats = selectedProject.chats.filter((c) => c.id !== chatId)
      if (remainingChats.length > 0) {
        setSelectedChatId(remainingChats[0].id)
      }
    }
  }

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setProjects(
      projects.map((p) =>
        p.id === selectedProjectId
          ? {
              ...p,
              chats: p.chats.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c)),
            }
          : p,
      ),
    )
  }

  const handleSendMessage = (content: string) => {
    if (!selectedProject || !selectedChat) return

    const newMessage = {
      id: `msg-${Date.now()}`,
      role: "user" as const,
      content,
      timestamp: new Date(),
    }

    setProjects(
      projects.map((project) =>
        project.id === selectedProjectId
          ? {
              ...project,
              chats: project.chats.map((chat) =>
                chat.id === selectedChatId ? { ...chat, messages: [...chat.messages, newMessage] } : chat,
              ),
            }
          : project,
      ),
    )

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage = {
        id: `msg-${Date.now()}-response`,
        role: "assistant" as const,
        content:
          "I would analyze your requirements and provide a detailed architecture recommendation with diagrams and code examples.",
        timestamp: new Date(),
      }

      setProjects(
        projects.map((project) =>
          project.id === selectedProjectId
            ? {
                ...project,
                chats: project.chats.map((chat) =>
                  chat.id === selectedChatId ? { ...chat, messages: [...chat.messages, assistantMessage] } : chat,
                ),
              }
            : project,
        ),
      )
    }, 800)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header onLogout={onLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          selectedChatId={selectedChatId}
          onSelectProject={setSelectedProjectId}
          onSelectChat={setSelectedChatId}
          onAddProject={handleAddProject}
          onAddChat={handleAddChat}
          onDeleteProject={handleDeleteProject}
          onRenameProject={handleRenameProject}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
        <ChatArea chat={selectedChat} project={selectedProject} onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}
