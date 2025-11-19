import { useState, useRef, useEffect } from "react";
import { chatAPI } from "../../services/api";
import { Send, Sparkles, Loader2, MessageSquare } from "lucide-react";
import MessageRenderer from "../Common/MessageRenderer";
import { useProject } from "../../contexts/ProjectContext";
import { useChat } from "../../contexts/ChatContext";

const ArchitectureChat = ({ projectId }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);
  const [viewMode, setViewMode] = useState("full"); // "full", "description", "diagrams"
  const messagesEndRef = useRef(null);
  const responseEndRef = useRef(null);
  const { updateArchitectureContext } = useProject();
  const { getMessages, addMessage } = useChat();

  // Load messages from ChatContext
  const messages = getMessages(projectId, "architecture");

  // Get only assistant messages for the response panel
  const assistantMessages = messages.filter((msg) => msg.role === "assistant");

  // Debug: Log messages when they change
  useEffect(() => {
    console.log("Total messages:", messages.length);
    console.log("Assistant messages:", assistantMessages.length);
    console.log("Selected index:", selectedMessageIndex);
  }, [messages.length, assistantMessages.length, selectedMessageIndex]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollResponseToBottom = () => {
    responseEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollResponseToBottom();
  }, [selectedMessageIndex]);

  useEffect(() => {
    // Auto-select the latest response when new assistant messages arrive
    if (assistantMessages.length > 0) {
      setSelectedMessageIndex(assistantMessages.length - 1);
      setViewMode("full"); // Reset to full view when new message arrives
    }
  }, [assistantMessages.length]);

  // Function to extract content parts (description and diagrams)
  const extractContentParts = (content) => {
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    const diagrams = [];
    let match;

    while ((match = mermaidRegex.exec(content)) !== null) {
      diagrams.push(match[0]);
    }

    // Remove mermaid diagrams from content to get description
    const description = content.replace(mermaidRegex, "").trim();

    return { description, diagrams };
  };

  // Get filtered content based on view mode
  const getFilteredContent = (content) => {
    if (viewMode === "full") return content;

    const { description, diagrams } = extractContentParts(content);

    if (viewMode === "description") return description;
    if (viewMode === "diagrams") return diagrams.join("\n\n");

    return content;
  };

  const handleEnhancePrompt = async () => {
    if (!input.trim()) return;

    setEnhancing(true);
    try {
      const response = await chatAPI.enhancePrompt(input);
      // Set the enhanced prompt in the input field for editing
      setInput(response.enhancedPrompt || response.message);
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      // Fallback enhancement for demo
      const enhanced = `Please design a comprehensive software architecture for: ${input}\n\nInclude:\n- Functional and non-functional requirements\n- Architectural patterns and styles\n- High-level architecture diagram\n- Technology stack recommendations\n- Data management strategies\n- Integration approaches\n- Deployment considerations\n- Scalability and performance aspects`;
      setInput(enhanced);
    } finally {
      setEnhancing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    // Add user message to chat context (saves to localStorage)
    addMessage(projectId, "architecture", userMessage);
    setInput("");
    setLoading(true);

    try {
      const response = await chatAPI.sendArchitectureMessage(input, projectId);
      response = "djwbdbwudw";
      console.log("API Response:", response);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message || response.response,
        timestamp: new Date().toISOString(),
      };

      console.log("Assistant message created:", assistantMessage);

      // Add assistant message to chat context (saves to localStorage)
      addMessage(projectId, "architecture", assistantMessage);

      // Get updated messages for context
      const updatedMessages = [...messages, userMessage, assistantMessage];

      // Update architecture context for use in Issues chat
      updateArchitectureContext(projectId, {
        lastUpdate: new Date().toISOString(),
        summary: response.message || response.response,
        messages: updatedMessages,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Fallback response for demo
      const demoResponse = generateDemoArchitectureResponse(input);
      console.log("Using demo response");
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: demoResponse,
        timestamp: new Date().toISOString(),
      };

      console.log("Demo assistant message created:", assistantMessage);

      // Add assistant message to chat context (saves to localStorage)
      addMessage(projectId, "architecture", assistantMessage);

      // Get updated messages for context
      const updatedMessages = [...messages, userMessage, assistantMessage];

      // Update architecture context
      updateArchitectureContext(projectId, {
        lastUpdate: new Date().toISOString(),
        summary: demoResponse,
        messages: updatedMessages,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-theme-bg transition-colors duration-200">
      {/* Left Panel - Chat History */}
      <div className="flex flex-col w-[45%] border-r border-theme-border bg-theme-bg-alt">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-500/10 rounded-lg mb-3 relative overflow-hidden group">
                <div className="absolute inset-0 bg-teal-500/5 blur-lg group-hover:bg-teal-500/10 transition-all duration-500"></div>
                <MessageSquare className="w-6 h-6 text-teal-500 relative z-10" />
              </div>
              <h3 className="text-base font-medium text-theme-text mb-2">
                Start Architecture Design
              </h3>
              <p className="text-sm text-theme-text-muted px-4">
                Describe your project and get comprehensive architecture
                recommendations
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={message.id}>
                {message.role === "user" ? (
                  <div className="flex justify-start mb-4">
                    <div className="bg-theme-bg-dark border border-theme-border rounded-lg px-4 py-2.5 max-w-[85%] hover:border-teal-500/50 transition-all duration-300">
                      <p className="text-sm text-theme-text whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2 mb-3 group">
                    <div className="flex-shrink-0 w-7 h-7 rounded bg-teal-500/10 flex items-center justify-center mt-1">
                      <Sparkles className="w-4 h-4 text-teal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() =>
                          setSelectedMessageIndex(
                            assistantMessages.findIndex(
                              (m) => m.id === message.id
                            )
                          )
                        }
                        className="w-full text-left bg-theme-bg-dark hover:bg-theme-border border border-theme-border rounded-lg px-3 py-2 transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/5 transition-all duration-500"></div>
                        <p className="text-xs text-theme-text-muted mb-1 relative z-10">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm text-theme-text line-clamp-2 relative z-10">
                          Architecture design generated
                        </p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-7 h-7 rounded bg-teal-500/10 flex items-center justify-center mt-1">
                <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
              </div>
              <div className="bg-theme-bg-dark border border-theme-border rounded-lg px-3 py-2">
                <p className="text-sm text-theme-text-muted">
                  Generating architecture...
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-theme-border bg-theme-bg p-3">
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
              placeholder="Describe your requirements..."
              rows={3}
              className="flex-1 bg-theme-bg-dark border border-theme-border rounded-lg px-3 py-2 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-teal-500 transition-all duration-200 resize-none"
            />
            <div className="flex flex-col space-y-1.5">
              <button
                onClick={handleEnhancePrompt}
                disabled={!input.trim() || enhancing || loading}
                className="px-3 py-1.5 bg-gray-500 disabled:bg-theme-border disabled:cursor-not-allowed text-white rounded text-xs transition-all duration-200 flex items-center space-x-1.5 relative overflow-hidden group"
                title="Enhance prompt"
              >
                {!input.trim() && !enhancing && !loading && (
                  <div className="absolute inset-0 transition-all duration-300"></div>
                )}
                {enhancing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Enhance</span>
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 disabled:bg-theme-border disabled:cursor-not-allowed text-white rounded text-xs transition-all duration-200 flex items-center justify-center flex-1 relative overflow-hidden group"
                title="Send"
              >
                {!input.trim() && !loading && (
                  <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/10 transition-all duration-300"></div>
                )}
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-theme-text-muted mt-1.5 px-0.5">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Right Panel - Response Display */}
      <div className="flex-1 flex flex-col bg-theme-bg-dark">
        {selectedMessageIndex !== null &&
          assistantMessages[selectedMessageIndex] && (
            <div className="border-b border-theme-border bg-theme-bg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-teal-500/5 blur-lg group-hover:bg-teal-500/10 transition-all duration-500"></div>
                    <Sparkles className="w-5 h-5 text-teal-500 relative z-10" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-theme-text">
                      Architecture Design
                    </h3>
                    <p className="text-xs text-theme-text-muted">
                      {new Date(
                        assistantMessages[selectedMessageIndex].timestamp
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* View Mode Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("full")}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 ${
                      viewMode === "full"
                        ? "bg-teal-500 text-white"
                        : "bg-theme-bg-dark text-theme-text-muted hover:bg-theme-border hover:text-theme-text"
                    }`}
                  >
                    Full View
                  </button>

                  <button
                    onClick={() => setViewMode("diagrams")}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 ${
                      viewMode === "diagrams"
                        ? "bg-teal-500 text-white"
                        : "bg-theme-bg-dark text-theme-text-muted hover:bg-theme-border hover:text-theme-text"
                    }`}
                  >
                    Diagrams Only
                  </button>
                  <button
                    onClick={() => setViewMode("description")}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 ${
                      viewMode === "description"
                        ? "bg-teal-500 text-white"
                        : "bg-theme-bg-dark text-theme-text-muted hover:bg-theme-border hover:text-theme-text"
                    }`}
                  >
                    Description
                  </button>
                </div>
              </div>
            </div>
          )}

        <div className="flex-1 overflow-y-auto">
          {selectedMessageIndex !== null &&
          assistantMessages[selectedMessageIndex] ? (
            <div className="p-6">
              <div className="prose-invert max-w-none">
                <MessageRenderer
                  content={getFilteredContent(
                    assistantMessages[selectedMessageIndex].content
                  )}
                />
              </div>
              <div ref={responseEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 rounded-lg mb-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-teal-500/5 blur-xl group-hover:bg-teal-500/10 transition-all duration-500"></div>
                  <Sparkles className="w-8 h-8 text-teal-500 relative z-10" />
                </div>
                <h3 className="text-lg font-medium text-theme-text mb-2">
                  Architecture Design Panel
                </h3>
                <p className="text-sm text-theme-text-muted max-w-md">
                  Your architecture designs with diagrams and detailed
                  recommendations will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Demo response generator
function generateDemoArchitectureResponse(prompt) {
  return `# Software Architecture Design

## 1. **Functional Requirements**
- User authentication and authorization
- Data processing and management
- Real-time notifications
- RESTful API endpoints
- Admin dashboard for monitoring

## 2. **Non-Functional Requirements**
- **Performance**: Response time < 200ms for 95% of requests
- **Scalability**: Support 10,000+ concurrent users
- **Availability**: 99.9% uptime
- **Security**: End-to-end encryption, OWASP compliance
- **Maintainability**: Modular architecture with clear separation of concerns

## 3. **Architectural Patterns & Styles**
- **Microservices Architecture**: For scalability and independent deployment
- **Event-Driven Architecture**: For real-time updates and decoupling
- **CQRS Pattern**: Separate read and write operations
- **API Gateway Pattern**: Single entry point for clients

## 4. **High-Level Architecture Diagram**

\`\`\`mermaid
graph TB
    Client[Client Applications]
    Gateway[API Gateway]
    Auth[Auth Service]
    User[User Service]
    Data[Data Service]
    Event[Event Bus]
    DB1[(User DB)]
    DB2[(Data DB)]
    Cache[(Redis Cache)]
    
    Client -->|HTTPS| Gateway
    Gateway --> Auth
    Gateway --> User
    Gateway --> Data
    Auth --> DB1
    User --> DB1
    Data --> DB2
    User --> Cache
    Data --> Event
    Event --> User
\`\`\`

## 5. **Component Diagram**

\`\`\`mermaid
classDiagram
    class APIGateway {
        +routeRequest()
        +authenticate()
        +rateLimit()
    }
    class AuthService {
        +login()
        +register()
        +validateToken()
    }
    class UserService {
        +getUser()
        +updateUser()
        +deleteUser()
    }
    class DataService {
        +createData()
        +getData()
        +processData()
    }
    
    APIGateway --> AuthService
    APIGateway --> UserService
    APIGateway --> DataService
    UserService --> AuthService
    DataService --> UserService
\`\`\`

## 6. **Technology Stack Recommendations**

### **Backend**
- **Framework**: Node.js with Express or NestJS
- **Language**: TypeScript for type safety
- **API**: GraphQL or REST with OpenAPI specification

### **Frontend**
- **Framework**: React with Next.js for SSR
- **State Management**: Redux Toolkit or Zustand
- **UI Library**: TailwindCSS with Radix UI

### **Database**
- **Primary**: PostgreSQL for relational data
- **Cache**: Redis for session and frequently accessed data
- **Search**: Elasticsearch for full-text search

### **Infrastructure**
- **Cloud Provider**: AWS or Google Cloud Platform
- **Container Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions or GitLab CI

## 7. **Data & Storage Management**

### **Database Schema Design**
- Normalized relational schema for transactional data
- Denormalized read models for query optimization
- Partitioning strategy for large tables

### **Caching Strategy**
- Cache-aside pattern for frequently accessed data
- Write-through cache for critical updates
- TTL-based expiration policies

### **Backup & Recovery**
- Daily automated backups
- Point-in-time recovery capability
- Multi-region replication for disaster recovery

## 8. **Integration & Third-party Services**
- **Authentication**: OAuth 2.0 with Google, GitHub
- **Payment Processing**: Stripe or PayPal integration
- **Email Service**: SendGrid or AWS SES
- **Monitoring**: Datadog or New Relic
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

## 9. **Deployment Strategy**

### **Containerization**
- Docker containers for all services
- Multi-stage builds for optimized images
- Health checks and readiness probes

### **Orchestration**
- Kubernetes for container orchestration
- Horizontal Pod Autoscaling based on CPU/memory
- Blue-green deployment for zero downtime

### **CI/CD Pipeline**
\`\`\`mermaid
graph LR
    A[Code Commit] --> B[Build]
    B --> C[Test]
    C --> D[Security Scan]
    D --> E[Deploy to Staging]
    E --> F[Integration Tests]
    F --> G[Deploy to Production]
    G --> H[Monitor]
\`\`\`

## 10. **Security Considerations**
- **Authentication**: JWT tokens with short expiration
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: TLS 1.3 in transit, AES-256 at rest
- **API Security**: Rate limiting, input validation, SQL injection prevention
- **Secrets Management**: HashiCorp Vault or AWS Secrets Manager

## 11. **Monitoring & Observability**
- **Metrics**: Prometheus for metrics collection
- **Tracing**: Jaeger for distributed tracing
- **Logging**: Centralized logging with correlation IDs
- **Alerting**: PagerDuty for incident management

This architecture provides a solid foundation for building a scalable, secure, and maintainable system. Adjust based on specific requirements and constraints of your project.`;
}

export default ArchitectureChat;
