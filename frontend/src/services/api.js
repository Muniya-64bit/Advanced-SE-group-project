import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatAPI = {
  // Send message to architecture design chat
  sendArchitectureMessage: async (message, projectId) => {
    const response = await api.post("/chat/ask/", {
      query: message,
      projectId,
      chatType: "architecture",
    });
    return response.data;
  },

  // Send message to issues Q&A chat with architecture context
  sendIssueMessage: async (message, projectId, architectureContext) => {
    const response = await api.post("/chat/ask/", {
      query: message,
      projectId,
      chatType: "issue",
      context: architectureContext, // Include architecture context
    });
    return response.data;
  },

  // Enhance prompt using LLM
  enhancePrompt: async (prompt) => {
    const response = await api.post("/chat.py", {
      message: prompt,
      action: "enhance",
    });
    return response.data;
  },
};

export const authAPI = {
  googleLogin: async (credential) => {
    const response = await api.post("/auth/google", { credential });
    return response.data;
  },
};

export default api;
