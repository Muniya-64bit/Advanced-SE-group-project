import { createContext, useContext, useState, useEffect } from "react";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState({});
  const [issueThreads, setIssueThreads] = useState({});

  useEffect(() => {
    // Load all chats from localStorage on mount
    const storedChats = localStorage.getItem("projectChats");
    if (storedChats) {
      try {
        setChats(JSON.parse(storedChats));
      } catch (error) {
        console.error("Error loading chats from localStorage:", error);
      }
    }

    // Load issue threads from localStorage
    const storedThreads = localStorage.getItem("issueThreads");
    if (storedThreads) {
      try {
        setIssueThreads(JSON.parse(storedThreads));
      } catch (error) {
        console.error("Error loading issue threads from localStorage:", error);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(chats).length > 0) {
      localStorage.setItem("projectChats", JSON.stringify(chats));
    }
  }, [chats]);

  // Save issue threads to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(issueThreads).length > 0) {
      localStorage.setItem("issueThreads", JSON.stringify(issueThreads));
    }
  }, [issueThreads]);

  // Get messages for a specific project and chat type
  const getMessages = (projectId, chatType) => {
    return chats[projectId]?.[chatType] || [];
  };

  // Add a message to a specific project and chat type
  const addMessage = (projectId, chatType, message) => {
    setChats((prevChats) => ({
      ...prevChats,
      [projectId]: {
        ...prevChats[projectId],
        [chatType]: [...(prevChats[projectId]?.[chatType] || []), message],
      },
    }));
  };

  // Add multiple messages at once
  const addMessages = (projectId, chatType, messages) => {
    setChats((prevChats) => ({
      ...prevChats,
      [projectId]: {
        ...prevChats[projectId],
        [chatType]: [...(prevChats[projectId]?.[chatType] || []), ...messages],
      },
    }));
  };

  // Clear all messages for a specific project and chat type
  const clearMessages = (projectId, chatType) => {
    setChats((prevChats) => ({
      ...prevChats,
      [projectId]: {
        ...prevChats[projectId],
        [chatType]: [],
      },
    }));
  };

  // Clear all messages for a project
  const clearProjectChats = (projectId) => {
    setChats((prevChats) => {
      const newChats = { ...prevChats };
      delete newChats[projectId];
      return newChats;
    });
  };

  // Get chat statistics for a project
  const getChatStats = (projectId) => {
    const projectChats = chats[projectId] || {};
    return {
      architectureCount: projectChats.architecture?.length || 0,
      issuesCount: projectChats.issues?.length || 0,
      totalMessages:
        (projectChats.architecture?.length || 0) +
        (projectChats.issues?.length || 0),
    };
  };

  // Get issue threads for a project
  const getIssueThreads = (projectId) => {
    return (
      issueThreads[projectId] || [{ id: 1, title: "New Chat", messages: [] }]
    );
  };

  // Set issue threads for a project
  const setProjectIssueThreads = (projectId, threads) => {
    console.log(threads);

    setIssueThreads((prev) => ({
      ...prev,
      [projectId]: threads,
    }));
  };

  // Clear issue threads for a project
  const clearIssueThreads = (projectId) => {
    setIssueThreads((prev) => {
      const newThreads = { ...prev };
      delete newThreads[projectId];
      return newThreads;
    });
  };

  const value = {
    getMessages,
    addMessage,
    addMessages,
    clearMessages,
    clearProjectChats,
    getChatStats,
    getIssueThreads,
    setProjectIssueThreads,
    clearIssueThreads,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
