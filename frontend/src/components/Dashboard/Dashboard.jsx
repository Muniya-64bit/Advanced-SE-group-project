import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useProject } from "../../contexts/ProjectContext";
import { useChat } from "../../contexts/ChatContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Plus,
  LogOut,
  FolderOpen,
  Trash2,
  Calendar,
  Brain,
  Moon,
  Sun,
  Home,
} from "lucide-react";

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { projects, createProject, deleteProject } = useProject();
  const { getChatStats, clearProjectChats } = useChat();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const project = createProject(newProjectName);
      setNewProjectName("");
      setShowNewProjectModal(false);
      navigate(`/project/${project.id}`);
    }
  };

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(projectId);
      clearProjectChats(projectId); // Also clear chat history from localStorage
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force navigation even if logout fails
      navigate("/login");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-theme-bg transition-colors duration-200">
      {/* Header */}
      <header className="bg-theme-bg-alt border-b border-theme-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-teal-500/5 blur-lg group-hover:bg-teal-500/10 transition-all duration-500"></div>
                <img
                  src="/src/assets/architecture.png"
                  alt="AI Architect Logo"
                  className="w-6 h-6 object-contain relative z-10"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-theme-text">
                  AI Software Architect
                </h1>
                <p className="text-xs text-theme-text-muted">
                  Design intelligent architectures
                </p>
              </div>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate("/")}
                className="p-2 text-theme-text-muted hover:text-theme-text hover:bg-theme-bg-dark rounded-lg transition-colors"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-theme-text-muted hover:text-theme-text hover:bg-theme-bg-dark rounded-lg transition-colors"
                title="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <div className="flex items-center space-x-3 ml-2 pl-2 border-l border-theme-border">
                <div className="w-9 h-9 bg-teal-500/10 rounded-lg flex items-center justify-center border border-theme-border">
                  <Brain className="w-5 h-5 text-teal-500" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-theme-text">
                    {user?.user_metadata?.name ||
                      user?.name ||
                      user?.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-theme-text-muted">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-theme-text-muted hover:text-vscode-red hover:bg-theme-bg-dark rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-theme-text">
                Your Projects
              </h2>
              <p className="text-theme-text-muted mt-1">
                Manage your architecture design projects
              </p>
            </div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-bg-dark rounded-lg mb-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-teal-500/5 blur-xl group-hover:bg-teal-500/10 transition-all duration-500"></div>
                <FolderOpen className="w-8 h-8 text-theme-text-muted relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-theme-text mb-2">
                No projects yet
              </h3>
              <p className="text-theme-text-muted mb-6">
                Create your first project to get started
              </p>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="bg-theme-bg-alt border border-theme-border rounded-lg p-5 hover:border-teal-500 cursor-pointer transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/5 transition-all duration-500"></div>
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-theme-text mb-2 group-hover:text-teal-500 transition-colors duration-300">
                        {project.name}
                      </h3>
                      <div className="flex items-center text-xs text-theme-text-muted">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        <span>
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      className="p-1.5 text-theme-text-muted hover:text-vscode-red hover:bg-theme-bg-dark rounded transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-theme-text-muted">
                      <span>Architecture:</span>
                      <span className="text-theme-text font-medium">
                        {getChatStats(project.id).architectureCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-theme-text-muted">
                      <span>Issues:</span>
                      <span className="text-theme-text font-medium">
                        {getChatStats(project.id).issuesCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-theme-bg-alt rounded-lg p-6 max-w-md w-full border border-theme-border">
            <h3 className="text-xl font-semibold text-theme-text mb-4">
              Create New Project
            </h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreateProject()}
              placeholder="Enter project name..."
              className="w-full bg-theme-bg-dark border border-theme-border rounded-lg px-4 py-3 text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-teal-500 mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setNewProjectName("");
                }}
                className="flex-1 bg-theme-bg-dark hover:bg-theme-border text-theme-text px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-theme-border disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
