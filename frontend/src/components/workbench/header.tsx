import { useState } from "react"
import { LogOut, Settings, Moon, Sun, Info } from "lucide-react"

interface HeaderProps {
  onLogout: () => void
}

export default function Header({ onLogout }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Update document class for dark mode
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.add("dark")
    }
  }

  return (
    <>
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-primary">DesignForge</div>
          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">v1.0</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-background rounded-lg transition text-foreground"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Settings Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-background rounded-lg transition text-foreground"
              title="Settings"
            >
              <Settings size={20} />
            </button>

            {showMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setShowSettings(true)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition first:rounded-t-lg"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
                >
                  <Info size={16} />
                  <span>About</span>
                </button>
                <div className="border-t border-border" />
                <button
                  onClick={() => {
                    onLogout()
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition last:rounded-b-lg"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Settings</h2>

            {/* Theme Setting */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Theme</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsDarkMode(true)
                      if (!document.documentElement.classList.contains("dark")) {
                        document.documentElement.classList.add("dark")
                      }
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                      isDarkMode
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => {
                      setIsDarkMode(false)
                      if (document.documentElement.classList.contains("dark")) {
                        document.documentElement.classList.remove("dark")
                      }
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                      !isDarkMode
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>

              {/* App Info */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">About DesignForge</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>Version: 1.0.0</p>
                  <p>
                    A Claude-like chat application for design and architecture discussions with Markdown and Mermaid
                    support.
                  </p>
                  <p>Features: Project management, real-time chat, syntax highlighting, and diagram rendering.</p>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Keyboard Shortcuts</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Send message</span>
                    <kbd className="px-2 py-1 bg-muted rounded font-mono">Enter</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>New line</span>
                    <kbd className="px-2 py-1 bg-muted rounded font-mono">Shift + Enter</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 px-4 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition font-medium text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onLogout()
                  setShowSettings(false)
                }}
                className="flex-1 py-2 px-4 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
