import { createContext, useContext, useState, useEffect } from "react";

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [architectureContext, setArchitectureContext] = useState({}); // Store architecture context per project

  useEffect(() => {
    // Load projects from localStorage
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }

    // Load architecture context from localStorage
    const storedContext = localStorage.getItem("architectureContext");
    if (storedContext) {
      setArchitectureContext(JSON.parse(storedContext));
    }
  }, []);

  const createProject = (projectName) => {
    const newProject = {
      id: Date.now().toString(),
      name: projectName,
      createdAt: new Date().toISOString(),
      architectureChats: [],
      issueChats: [],
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    return newProject;
  };

  const deleteProject = (projectId) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));

    // Also remove architecture context for this project
    const updatedContext = { ...architectureContext };
    delete updatedContext[projectId];
    setArchitectureContext(updatedContext);
    localStorage.setItem("architectureContext", JSON.stringify(updatedContext));
  };

  const updateArchitectureContext = (projectId, context) => {
    const updatedContext = {
      ...architectureContext,
      [projectId]: context,
    };
    setArchitectureContext(updatedContext);
    localStorage.setItem("architectureContext", JSON.stringify(updatedContext));
  };

  const getArchitectureContext = (projectId) => {
    return architectureContext[projectId] || null;
  };

  const value = {
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    deleteProject,
    updateArchitectureContext,
    getArchitectureContext,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
