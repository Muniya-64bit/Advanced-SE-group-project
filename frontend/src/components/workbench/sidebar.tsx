import { useState } from "react"
import { Plus, ChevronDown, ChevronRight, MessageSquare, FolderOpen, Trash2, Edit2, X, Info } from "lucide-react"
import type { Project } from "@/types"

interface SidebarProps {
  projects: Project[]
  selectedProjectId: string
  selectedChatId: string
  onSelectProject: (projectId: string) => void
  onSelectChat: (chatId: string) => void
  onAddProject: (name: string, description: string) => void
  onAddChat: (title: string) => void
  onDeleteProject: (projectId: string) => void
  onRenameProject: (projectId: string, newName: string) => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, newTitle: string) => void
}

export default function Sidebar({
  projects,
  selectedProjectId,
  selectedChatId,
  onSelectProject,
  onSelectChat,
  onAddProject,
  onAddChat,
  onDeleteProject,
  onRenameProject,
  onDeleteChat,
  onRenameChat,
}: SidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(["1"]))
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newChatTitle, setNewChatTitle] = useState("")
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editProjectName, setEditProjectName] = useState("")
  const [editChatTitle, setEditChatTitle] = useState("")
  const [showProjectInfo, setShowProjectInfo] = useState(false)

  const toggleProjectExpanded = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName, "")
      setNewProjectName("")
      setShowNewProjectDialog(false)
    }
  }

  const handleCreateChat = () => {
    if (newChatTitle.trim()) {
      onAddChat(newChatTitle)
      setNewChatTitle("")
      setShowNewChatDialog(false)
    }
  }

  const handleRenameProject = (projectId: string) => {
    if (editProjectName.trim()) {
      onRenameProject(projectId, editProjectName)
      setEditingProjectId(null)
      setEditProjectName("")
    }
  }

  const handleRenameChat = (chatId: string) => {
    if (editChatTitle.trim()) {
      onRenameChat(chatId, editChatTitle)
      setEditingChatId(null)
      setEditChatTitle("")
    }
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const selectedChatData = selectedProject?.chats.find((c) => c.id === selectedChatId)

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Projects</h2>
        <button
          onClick={() => setShowNewProjectDialog(true)}
          className="p-1.5 hover:bg-sidebar-accent rounded-lg transition text-sidebar-foreground"
          title="Create new project"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* New Project Dialog */}
      {showNewProjectDialog && (
        <div className="p-3 border-b border-sidebar-border bg-sidebar-accent/10">
          <input
            autoFocus
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateProject()
              if (e.key === "Escape") setShowNewProjectDialog(false)
            }}
            placeholder="Project name..."
            className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
          />
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {projects.map((project) => (
          <div key={project.id}>
            {/* Project Item */}
            <div
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-sidebar-accent transition group ${
                selectedProjectId === project.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground"
              }`}
            >
              <button
                onClick={() => {
                  onSelectProject(project.id)
                  toggleProjectExpanded(project.id)
                }}
                className="flex items-center gap-2 flex-1"
              >
                {expandedProjects.has(project.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <FolderOpen size={16} />
                {editingProjectId === project.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editProjectName}
                    onChange={(e) => setEditProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameProject(project.id)
                      if (e.key === "Escape") setEditingProjectId(null)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-1.5 py-0.5 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1"
                  />
                ) : (
                  <span className="flex-1 text-left truncate font-medium">{project.name}</span>
                )}
              </button>
              <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                {editingProjectId === project.id ? (
                  <button
                    onClick={() => handleRenameProject(project.id)}
                    className="p-1 hover:bg-sidebar-accent-foreground/20 rounded transition"
                    title="Save rename"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowProjectInfo(!showProjectInfo)
                        setEditingProjectId(null)
                      }}
                      className="p-1 hover:bg-sidebar-accent-foreground/20 rounded transition"
                      title="Project details"
                    >
                      <Info size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingProjectId(project.id)
                        setEditProjectName(project.name)
                        setShowProjectInfo(false)
                      }}
                      className="p-1 hover:bg-sidebar-accent-foreground/20 rounded transition"
                      title="Rename project"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      className="p-1 hover:bg-destructive/20 rounded transition text-destructive"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {showProjectInfo && selectedProjectId === project.id && (
              <div className="px-3 py-2 bg-sidebar-accent/20 border-l-2 border-sidebar-primary text-xs space-y-1">
                <div className="text-sidebar-foreground/80">
                  <span className="font-semibold">Chats:</span> {project.chats.length}
                </div>
                {project.description && (
                  <div className="text-sidebar-foreground/70">
                    <span className="font-semibold">Desc:</span> {project.description}
                  </div>
                )}
              </div>
            )}

            {/* Chats for Project */}
            {expandedProjects.has(project.id) && (
              <div className="bg-sidebar-accent/30">
                {project.chats.map((chat) => (
                  <div key={chat.id} className="group flex items-center px-6 py-1.5 hover:bg-sidebar-accent transition">
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className={`flex-1 flex items-center gap-2 text-xs ${
                        selectedChatId === chat.id ? "text-sidebar-accent-foreground" : "text-sidebar-foreground"
                      }`}
                    >
                      <MessageSquare size={14} />
                      {editingChatId === chat.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={editChatTitle}
                          onChange={(e) => setEditChatTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameChat(chat.id)
                            if (e.key === "Escape") setEditingChatId(null)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 px-1.5 py-0.5 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1"
                        />
                      ) : (
                        <span className="flex-1 text-left truncate">{chat.title}</span>
                      )}
                    </button>
                    <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                      {editingChatId === chat.id ? (
                        <button
                          onClick={() => handleRenameChat(chat.id)}
                          className="p-1 hover:bg-sidebar-accent-foreground/20 rounded transition"
                          title="Save rename"
                        >
                          <X size={12} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingChatId(chat.id)
                              setEditChatTitle(chat.title)
                            }}
                            className="p-1 hover:bg-sidebar-accent-foreground/20 rounded transition"
                            title="Rename chat"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => onDeleteChat(chat.id)}
                            className="p-1 hover:bg-destructive/20 rounded transition text-destructive"
                            title="Delete chat"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Chat Button */}
                {selectedProjectId === project.id && !showNewChatDialog && (
                  <button
                    onClick={() => setShowNewChatDialog(true)}
                    className="w-full flex items-center gap-2 px-6 py-1.5 text-xs text-sidebar-foreground hover:bg-sidebar-accent transition"
                  >
                    <Plus size={14} />
                    <span>New chat</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Chat Dialog */}
      {showNewChatDialog && (
        <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/10">
          <input
            autoFocus
            type="text"
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateChat()
              if (e.key === "Escape") setShowNewChatDialog(false)
            }}
            placeholder="Chat title..."
            className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
          />
        </div>
      )}

      {/* Info Panel Footer */}
      {selectedChatData && (
        <div className="border-t border-sidebar-border p-3 bg-sidebar-accent/10 text-xs text-sidebar-foreground/70 space-y-1">
          <div className="truncate">
            <span className="font-semibold">Chat:</span> {selectedChatData.title}
          </div>
          <div>
            <span className="font-semibold">Messages:</span> {selectedChatData.messages.length}
          </div>
        </div>
      )}
    </aside>
  )
}
