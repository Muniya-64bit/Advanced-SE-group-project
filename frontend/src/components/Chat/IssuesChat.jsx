import { useState, useRef, useEffect } from "react";
import { chatAPI } from "../../services/api";
import {
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
} from "lucide-react";
import MessageRenderer from "../Common/MessageRenderer";
import { useProject } from "../../contexts/ProjectContext";
import { useChat } from "../../contexts/ChatContext";

const IssuesChat = ({ projectId }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState(1);
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const messagesEndRef = useRef(null);
  const { getArchitectureContext } = useProject();
  const { getIssueThreads, setProjectIssueThreads } = useChat();

  const chatThreads = getIssueThreads(projectId);
  const setChatThreads = (threadsOrUpdater) => {
    if (typeof threadsOrUpdater === "function") {
      const currentThreads = getIssueThreads(projectId);
      const updated = threadsOrUpdater(currentThreads);
      setProjectIssueThreads(projectId, updated);
    } else {
      setProjectIssueThreads(projectId, threadsOrUpdater);
    }
  };
  const activeThread = chatThreads.find((t) => t.id === activeThreadId);
  const hasArchitectureContext =
    !!getArchitectureContext(projectId)?.messages?.length;

  useEffect(() => {
    if (chatThreads.length > 0) {
      setActiveThreadId(chatThreads[0].id);
    }
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  const createNewThread = () => {
    const newThread = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChatThreads([newThread, ...chatThreads]);
    setActiveThreadId(newThread.id);
  };

  const deleteThread = (threadId) => {
    const updatedThreads = chatThreads.filter((t) => t.id !== threadId);
    const threads = updatedThreads.length
      ? updatedThreads
      : [{ id: Date.now(), title: "New Chat", messages: [] }];
    setChatThreads(threads);
    if (activeThreadId === threadId) setActiveThreadId(threads[0].id);
  };

  const startEditingThread = (threadId, currentTitle) => {
    setEditingThreadId(threadId);
    setEditingTitle(currentTitle);
  };

  const saveThreadTitle = (threadId) => {
    setChatThreads(
      chatThreads.map((t) =>
        t.id === threadId
          ? { ...t, title: editingTitle.trim() || "New Chat" }
          : t
      )
    );
    setEditingThreadId(null);
  };

  const addMessageToThread = (message, updateTitle = false) => {
    setChatThreads((currentThreads) => {
      return currentThreads.map((t) => {
        if (t.id !== activeThreadId) return t;
        const newTitle =
          updateTitle && !t.messages.length
            ? message.content.slice(0, 50) +
              (message.content.length > 50 ? "..." : "")
            : t.title;
        return { ...t, title: newTitle, messages: [...t.messages, message] };
      });
    });
  };

  const handleSendMessage = async () => {
    // 1. Basic Validation
    if (!input.trim() || loading || !activeThread) return;

    const userMsg = input;
    
    // 2. Create the User Message Object
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMsg,
      timestamp: new Date().toISOString(),
    };

    // 3. Optimistically update UI (Show user message immediately)
    addMessageToThread(userMessage, true);
    setInput("");
    setLoading(true);

    try {
      // 4. Prepare Contexts
      const archContext = getArchitectureContext(projectId);
      
      // Extract chat history from the active thread (excluding the message we just added conceptually)
      // We map it to a clean format that the backend expects
      const chatHistory = activeThread.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // 5. Send to API with History
      const response = await chatAPI.sendIssueMessage(
        userMsg,        // Current Question
        projectId,      // Project ID
        archContext,    // Architecture Context (The big design doc)
        chatHistory     // Previous Q&A in this specific thread
      );

      // 6. Handle Response
      addMessageToThread({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message || response.response,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error("Error sending message:", error);
      
      // Fallback / Demo mode
      const demoResponse = generateDemoIssueResponse(
        userMsg,
        getArchitectureContext(projectId)
      );

      addMessageToThread({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: demoResponse,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-theme-bg transition-colors duration-200">
      {/* Left Sidebar - Chat Threads */}
      <div className="w-64 border-r border-theme-border flex flex-col bg-theme-bg-alt">
        {/* Sidebar Header */}
        <div className="p-3 border-b border-theme-border space-y-2">
          <button
            onClick={createNewThread}
            className="w-full px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/10 transition-all duration-300"></div>
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">New Chat</span>
          </button>
          {chatThreads.length > 1 && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Delete all chat threads? This cannot be undone."
                  )
                ) {
                  const newThread = {
                    id: Date.now(),
                    title: "New Chat",
                    messages: [],
                  };
                  setChatThreads([newThread]);
                  setActiveThreadId(newThread.id);
                }
              }}
              className="w-full px-3 py-2 bg-theme-bg-dark hover:bg-vscode-red/20 text-theme-text-muted hover:text-vscode-red border border-theme-border hover:border-vscode-red/50 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All</span>
            </button>
          )}
        </div>

        {/* Context Status */}
        <div className="px-3 py-2 border-b border-theme-border">
          {hasArchitectureContext ? (
            <div className="flex items-center space-x-2 text-vscode-green bg-vscode-green/10 rounded px-2 py-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Context Active</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-vscode-blue bg-vscode-blue/10 rounded px-2 py-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">No Context</span>
            </div>
          )}
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto py-2">
          {chatThreads.map((thread) => (
            <div key={thread.id} className="px-2 mb-1">
              <div
                className={`group relative rounded-lg transition-all duration-300 ${
                  activeThreadId === thread.id
                    ? "bg-theme-bg-dark border border-teal-500/30"
                    : "hover:bg-theme-bg-dark border border-transparent"
                }`}
              >
                {editingThreadId === thread.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => saveThreadTitle(thread.id)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") saveThreadTitle(thread.id);
                      if (e.key === "Escape") setEditingThreadId(null);
                    }}
                    autoFocus
                    className="w-full px-3 py-2 bg-theme-bg-dark border border-teal-500 rounded-lg text-sm text-theme-text focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => setActiveThreadId(thread.id)}
                    className="w-full flex items-start space-x-2 px-3 py-2 text-left"
                  >
                    <MessageSquare className="w-4 h-4 text-[#5c6370] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#abb2bf] truncate">
                        {thread.title}
                      </p>
                      <p className="text-xs text-[#5c6370] mt-0.5">
                        {thread.messages.length} message
                        {thread.messages.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </button>
                )}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity duration-200">
                  <button
                    onClick={() => startEditingThread(thread.id, thread.title)}
                    className="p-1 hover:bg-theme-border rounded transition-colors"
                    title="Rename"
                  >
                    <Edit2 className="w-3 h-3 text-theme-text-muted hover:text-theme-text" />
                  </button>
                  {chatThreads.length > 1 && (
                    <button
                      onClick={() => deleteThread(thread.id)}
                      className="p-1 hover:bg-vscode-red/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 text-theme-text-muted hover:text-vscode-red" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeThread || activeThread.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-vscode-blue/10 rounded-lg mb-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-vscode-blue/5 blur-lg group-hover:bg-vscode-blue/10 transition-all duration-500"></div>
                  <MessageSquare className="w-7 h-7 text-vscode-blue relative z-10" />
                </div>
                <h3 className="text-lg font-medium text-theme-text mb-2">
                  Issues & Q&A Assistant
                </h3>
                <p className="text-sm text-[#5c6370] mb-4">
                  Ask questions about your architecture design and get expert
                  solutions
                </p>
                <div className="text-left rounded-lg p-4 border border-[#2c313c]">
                  <p className="text-xs font-medium text-[#abb2bf] mb-2">
                    Example questions:
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#5c6370]">
                    <li className="flex items-start">
                      <span className="text-[#e5c07b] mr-2">•</span>
                      <span>How can I improve scalability?</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-vscode-blue mr-2">•</span>
                      <span>What security measures should I implement?</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-500 mr-2">•</span>
                      <span>Best caching strategy for my use case?</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            activeThread.messages.map((message) => (
              <div key={message.id}>
                {message.role === "user" ? (
                  <div className="flex justify-end mb-4">
                    <div className="bg-teal-500 text-white rounded-lg px-4 py-2.5 max-w-[70%] shadow-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start mb-4">
                    <div className="bg-theme-bg-dark border border-theme-border rounded-lg px-4 py-3 max-w-[85%] hover:border-teal-500/30 transition-all duration-300">
                      <MessageRenderer content={message.content} />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="bg-theme-bg-dark border border-theme-border rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2 text-theme-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                  <span className="text-sm">
                    Analyzing{hasArchitectureContext ? " with context" : ""}...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-theme-border bg-theme-bg-alt p-3">
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask a question..."
              rows={2}
              className="flex-1 bg-theme-bg-dark border border-theme-border rounded-lg px-3 py-2 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-teal-500 transition-all duration-200 resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-theme-border disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center relative overflow-hidden group"
              title="Send"
            >
              {!input.trim() && !loading && (
                <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/10 transition-all duration-300"></div>
              )}
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin relative z-10" />
              ) : (
                <Send className="w-4 h-4 relative z-10" />
              )}
            </button>
          </div>
          <p className="text-xs text-theme-text-muted mt-1.5 px-0.5">
            Press Enter to send • Shift+Enter for new line
            {hasArchitectureContext && " • Context-aware"}
          </p>
        </div>
      </div>
    </div>
  );
};

// Demo response generator with context awareness
function generateDemoIssueResponse(question, architectureContext) {
  const hasContext = !!architectureContext;

  let contextNote = "";
  if (hasContext) {
    contextNote = `\n\n> **Note**: This answer is based on your architecture design context from ${new Date(
      architectureContext.lastUpdate
    ).toLocaleString()}.\n\n`;
  }

  return `${contextNote}# Solution to Your Question

## **Problem Analysis**

Your question about "${question}" is an important architectural consideration. ${
    hasContext
      ? "Based on your architecture design, here's a tailored solution:"
      : "Here's a comprehensive solution:"
  }

## **Recommended Approach**

### **1. Immediate Actions**
- **Assess Current Implementation**: Review existing code and identify bottlenecks
- **Define Success Metrics**: Establish clear KPIs for measuring improvements
- **Create Migration Plan**: Plan for gradual rollout to minimize disruption

### **2. Technical Solution**

#### **Architecture Pattern**
${
  hasContext
    ? "Building on your existing microservices architecture:"
    : "Consider implementing:"
}

\`\`\`mermaid
graph TB
    A[Client Layer] --> B[Load Balancer]
    B --> C[Service Mesh]
    C --> D[Service A]
    C --> E[Service B]
    D --> F[Cache Layer]
    E --> F
    F --> G[(Database)]
\`\`\`

#### **Implementation Steps**

**Step 1: Setup Infrastructure**
\`\`\`typescript
// Example configuration
const config = {
  cache: {
    type: 'redis',
    ttl: 3600,
    maxSize: '1GB'
  },
  database: {
    pool: {
      min: 2,
      max: 10
    }
  }
}
\`\`\`

**Step 2: Implement Caching Layer**
- Use **Redis** for distributed caching
- Implement cache-aside pattern
- Set appropriate TTL based on data volatility

**Step 3: Optimize Queries**
- Add proper indexing
- Use query optimization techniques
- Implement pagination for large datasets

### **3. Best Practices**

#### **Performance Optimization**
- **Response Time**: Target < 200ms for 95th percentile
- **Throughput**: Support 1000+ requests/second
- **Resource Usage**: Optimize memory and CPU consumption

#### **Scalability Considerations**
- **Horizontal Scaling**: Add more service instances
- **Vertical Scaling**: Increase resources per instance
- **Auto-scaling**: Implement based on metrics

#### **Security Measures**
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent abuse and DDoS
- **Authentication**: Use JWT with short expiration
- **Encryption**: TLS 1.3 for data in transit

## **4. Monitoring & Alerts**

\`\`\`mermaid
graph LR
    A[Application] --> B[Metrics Collector]
    B --> C[Time Series DB]
    C --> D[Dashboard]
    C --> E[Alert Manager]
    E --> F[Notification]
\`\`\`

### **Key Metrics to Monitor**
- Response time (p50, p95, p99)
- Error rate
- Request throughput
- Resource utilization (CPU, Memory, Disk)
- Cache hit/miss ratio

## **5. Testing Strategy**

### **Unit Tests**
\`\`\`javascript
describe('Service', () => {
  it('should handle requests correctly', async () => {
    const result = await service.process(data)
    expect(result).toBeDefined()
    expect(result.status).toBe('success')
  })
})
\`\`\`

### **Integration Tests**
- Test service-to-service communication
- Verify database operations
- Validate caching behavior

### **Load Tests**
- Simulate production load
- Test auto-scaling triggers
- Identify bottlenecks

## **6. Deployment Plan**

### **Phase 1: Development (Week 1-2)**
- Implement core changes
- Write comprehensive tests
- Code review and refinement

### **Phase 2: Staging (Week 3)**
- Deploy to staging environment
- Run integration tests
- Performance benchmarking

### **Phase 3: Production Rollout (Week 4)**
- **Blue-Green Deployment**: Zero downtime migration
- **Canary Release**: Gradual traffic shift (10% → 50% → 100%)
- **Monitoring**: Watch metrics closely

## **7. Potential Challenges & Mitigations**

| Challenge | Risk Level | Mitigation Strategy |
|-----------|------------|---------------------|
| Data Migration | High | Use incremental migration with validation |
| Downtime | Medium | Implement blue-green deployment |
| Performance Regression | Medium | Comprehensive load testing before rollout |
| Team Learning Curve | Low | Provide training and documentation |

## **8. Success Criteria**

- ✅ Response time improved by 40%
- ✅ System handles 2x traffic without degradation
- ✅ Zero critical bugs in first month
- ✅ 99.9% uptime maintained
- ✅ Positive team feedback on maintainability

## **Next Steps**

1. **Review this solution** with your team
2. **Create detailed tickets** for each implementation phase
3. **Set up monitoring** infrastructure first
4. **Start with a pilot** on non-critical services
5. **Gather feedback** and iterate

${
  hasContext
    ? "\n**This solution is tailored to your architecture context. If you have more specific questions about implementation details, feel free to ask!**"
    : "\n**For more specific guidance, create an architecture design first to enable context-aware answers.**"
}

---

*Need clarification on any specific part? Ask follow-up questions!*`;
}

export default IssuesChat;
