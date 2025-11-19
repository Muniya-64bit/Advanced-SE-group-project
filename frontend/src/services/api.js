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

  sendIssueMessage: async (message, projectId, context, chatHistory = []) => {
    const response = await fetch(`${API_BASE_URL}/issues/chat`, { // Example URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,          // The new question
        projectId,        
        context,          // The architecture summary/JSON
        history: chatHistory // The array of previous messages
      }),
    });
    return response.json();
  },

  // Enhance prompt using LLM
  enhancePrompt: async (prompt) => {
    const response = await api.post("/enhance", {
      message: prompt,
      // action: "enhance",
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
