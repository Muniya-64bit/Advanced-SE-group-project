import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useProject } from "../../contexts/ProjectContext";
import { useTheme } from "../../contexts/ThemeContext";
import { ArrowLeft, Layers, MessageSquare, Moon, Sun } from "lucide-react";
import ArchitectureChat from "../Chat/ArchitectureChat";
import IssuesChat from "../Chat/IssuesChat";

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { projects } = useProject();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("architecture");
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const currentProject = projects.find((p) => p.id === projectId);
    if (!currentProject) {
      navigate("/dashboard");
      return;
    }

    setProject(currentProject);
  }, [projectId, projects, isAuthenticated, navigate]);

  if (!project) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center transition-colors duration-200">
        <div className="text-theme-text text-xl animate-pulse-subtle">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-theme-bg transition-colors duration-200">
      {/* Header */}
      <header className="bg-theme-bg-alt border-b border-theme-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 text-theme-text-muted hover:text-theme-text hover:bg-theme-bg-dark rounded-lg transition-all duration-200"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-theme-text">
                  {project.name}
                </h1>
                <p className="text-sm text-theme-text-muted">
                  Created on {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-theme-bg-dark p-1 rounded-lg border border-theme-border">
                <button
                  onClick={() => setActiveTab("architecture")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 relative overflow-hidden group ${
                    activeTab === "architecture"
                      ? "bg-teal-500 text-white"
                      : "text-theme-text-muted hover:text-theme-text"
                  }`}
                >
                  {activeTab !== "architecture" && (
                    <div className="absolute inset-0 bg-theme-text-dark/0 group-hover:bg-theme-text-dark/30 transition-all duration-300"></div>
                  )}
                  <Layers className="w-4 h-4 relative z-10" />
                  <span className="font-medium text-sm relative z-10">
                    Architecture
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("issues")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 relative overflow-hidden group ${
                    activeTab === "issues"
                      ? "bg-teal-500 text-white"
                      : "text-theme-text-muted hover:text-theme-text"
                  }`}
                >
                  {activeTab !== "issues" && (
                    <div className="absolute inset-0 bg-theme-text-dark/0 group-hover:bg-theme-text-dark/30 transition-all duration-300"></div>
                  )}
                  <MessageSquare className="w-4 h-4 relative z-10" />
                  <span className="font-medium text-sm relative z-10">
                    Issues & Q&A
                  </span>
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-theme-text-muted hover:text-theme-text hover:bg-theme-bg-dark rounded-lg transition-all duration-200"
                title="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "architecture" ? (
          <ArchitectureChat projectId={projectId} />
        ) : (
          <IssuesChat projectId={projectId} />
        )}
      </div>
    </div>
  );
};

export default ProjectView;
