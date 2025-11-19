# Backend API Documentation

## Overview

This document describes the API endpoints that the frontend expects from the backend. The main endpoint is `/chat.py` which handles all AI chat interactions.

## Base Configuration

```javascript
// Frontend expects these environment variables
VITE_API_URL=http://localhost:8000  // Your backend URL
VITE_GOOGLE_CLIENT_ID=xxx           // Google OAuth Client ID
```

## Authentication

### Headers

All requests (except auth) should include:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Google OAuth Login

**Endpoint:** `POST /auth/google`

**Request:**

```json
{
  "credential": "google_oauth_credential_token"
}
```

**Response:**

```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "picture": "https://..."
  },
  "token": "jwt_token_here"
}
```

## Main Chat Endpoint

### POST /chat.py

This single endpoint handles three different types of requests based on the payload.

---

## 1. Architecture Design Chat

Generate comprehensive architecture recommendations.

### Request

```json
{
  "message": "Design a real-time chat application",
  "projectId": "project_123",
  "chatType": "architecture"
}
```

### Request Fields

| Field     | Type   | Required | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| message   | string | Yes      | User's architecture requirements |
| projectId | string | Yes      | Unique project identifier        |
| chatType  | string | Yes      | Must be "architecture"           |

### Expected Response

```json
{
  "message": "# Software Architecture Design\n\n## 1. **Functional Requirements**\n- Real-time messaging\n- User authentication\n...",
  "status": "success"
}
```

### Response Format

The `message` field should contain markdown-formatted text with:

1. **Headers**: Use `#`, `##`, `###` for sections
2. **Bold**: Use `**text**` for important items
3. **Italic**: Use `*text*` for emphasis
4. **Code blocks**: Use triple backticks for code
5. **Mermaid diagrams**: Use triple backticks with `mermaid` language tag
6. **Lists**: Use `-` or `1.` for lists
7. **Tables**: Use markdown table syntax

### Example Response with Mermaid

````json
{
  "message": "# Architecture Design\n\n## High-Level Architecture\n\n```mermaid\ngraph TB\n    Client[Client App]\n    API[API Gateway]\n    Auth[Auth Service]\n    Chat[Chat Service]\n    DB[(Database)]\n    \n    Client -->|HTTPS| API\n    API --> Auth\n    API --> Chat\n    Chat --> DB\n```\n\n## Components\n\n**API Gateway**\n- Routes requests\n- Handles authentication\n- Rate limiting\n\n**Chat Service**\n- *Real-time messaging*\n- WebSocket connections\n- Message persistence\n\n..."
}
````

### Sections to Include

Your response should cover:

1. ✅ **Functional Requirements** - What the system should do
2. ✅ **Non-Functional Requirements** - Performance, security, scalability
3. ✅ **Architectural Patterns & Styles** - Microservices, event-driven, etc.
4. ✅ **High-Level Architecture Diagram** - Mermaid diagram showing components
5. ✅ **Component Diagram** - Detailed component interactions (Mermaid)
6. ✅ **Technology Stack** - Recommended technologies
   - Backend frameworks
   - Frontend frameworks
   - Databases
   - Infrastructure
7. ✅ **Data & Storage Management** - Database design, caching
8. ✅ **Integration & Third-party Services** - External APIs, services
9. ✅ **Deployment Strategy** - CI/CD, containerization, orchestration
10. ✅ **Security Considerations** - Authentication, encryption, etc.
11. ✅ **Monitoring & Observability** - Logging, metrics, alerts

---

## 2. Issues & Q&A Chat

Answer questions with architecture context.

### Request

```json
{
  "message": "How can I improve the scalability of my chat service?",
  "projectId": "project_123",
  "chatType": "issue",
  "context": {
    "lastUpdate": "2025-11-19T10:30:00Z",
    "summary": "Architecture design content...",
    "messages": [
      {
        "id": "1",
        "role": "user",
        "content": "Design a chat app",
        "timestamp": "2025-11-19T10:00:00Z"
      },
      {
        "id": "2",
        "role": "assistant",
        "content": "# Architecture Design\n...",
        "timestamp": "2025-11-19T10:00:30Z"
      }
    ]
  }
}
```

### Request Fields

| Field              | Type   | Required | Description                    |
| ------------------ | ------ | -------- | ------------------------------ |
| message            | string | Yes      | User's question                |
| projectId          | string | Yes      | Unique project identifier      |
| chatType           | string | Yes      | Must be "issue"                |
| context            | object | No       | Architecture design context    |
| context.lastUpdate | string | No       | ISO timestamp of last update   |
| context.summary    | string | No       | Summary of architecture design |
| context.messages   | array  | No       | Full conversation history      |

### Response Format

````json
{
  "message": "# Solution to Your Question\n\n## Problem Analysis\n\nYour question about scalability is important. Based on your existing architecture...\n\n## Recommended Approach\n\n### 1. Horizontal Scaling\n\n**Implementation:**\n- Add load balancer\n- Scale chat service instances\n- Use Redis for session state\n\n```mermaid\ngraph LR\n    LB[Load Balancer]\n    CS1[Chat Service 1]\n    CS2[Chat Service 2]\n    CS3[Chat Service 3]\n    Redis[(Redis)]\n    \n    LB --> CS1\n    LB --> CS2\n    LB --> CS3\n    CS1 --> Redis\n    CS2 --> Redis\n    CS3 --> Redis\n```\n\n### 2. Database Optimization\n\n- Add indexes\n- Implement caching\n- Use read replicas\n\n...",
  "status": "success"
}
````

### Context Usage

**Important:** Use the provided context to:

- Reference existing architecture decisions
- Provide specific recommendations
- Ensure consistency with previous responses
- Offer tailored solutions

**Example of context-aware response:**

```markdown
Based on your microservices architecture with Node.js and PostgreSQL,
I recommend using Redis for caching and implementing the following
patterns that align with your existing tech stack...
```

---

## 3. Prompt Enhancement

Enhance basic prompts into detailed requirements.

### Request

```json
{
  "message": "Build an e-commerce website",
  "action": "enhance"
}
```

### Request Fields

| Field   | Type   | Required | Description                  |
| ------- | ------ | -------- | ---------------------------- |
| message | string | Yes      | Basic user prompt to enhance |
| action  | string | Yes      | Must be "enhance"            |

### Response Format

```json
{
  "enhancedPrompt": "Design a comprehensive e-commerce platform with the following requirements:\n\n**Core Features:**\n- User authentication and authorization (Google, Email)\n- Product catalog with search and filtering\n- Shopping cart and checkout process\n- Payment integration (Stripe, PayPal)\n- Order management and tracking\n- Admin dashboard for inventory management\n\n**Scale Requirements:**\n- Support 50,000+ concurrent users\n- Handle 10,000+ daily transactions\n- 99.9% uptime SLA\n\n**Technical Considerations:**\n- Real-time inventory updates\n- Responsive design for mobile and desktop\n- SEO optimization\n- Multi-region deployment\n- CDN for static assets\n\n**Security:**\n- PCI DSS compliance\n- Secure payment processing\n- Data encryption at rest and in transit\n- OWASP security best practices\n\nPlease provide a complete architecture design including diagrams, technology stack recommendations, and deployment strategy.",
  "status": "success"
}
```

### Enhancement Guidelines

Transform basic prompts by adding:

1. **Specific features** - Break down vague requirements
2. **Scale requirements** - Add user counts, performance targets
3. **Technical details** - Specify integrations, technologies
4. **Security considerations** - Include security requirements
5. **Non-functional requirements** - Performance, availability, etc.
6. **Request format** - Ask for specific deliverables

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error message description",
  "status": "error",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code            | Description               | HTTP Status |
| --------------- | ------------------------- | ----------- |
| INVALID_REQUEST | Missing or invalid fields | 400         |
| UNAUTHORIZED    | Invalid or missing token  | 401         |
| NOT_FOUND       | Resource not found        | 404         |
| RATE_LIMIT      | Too many requests         | 429         |
| SERVER_ERROR    | Internal server error     | 500         |

### Example Error Handling

```json
{
  "error": "Invalid chat type. Must be 'architecture' or 'issue'",
  "status": "error",
  "code": "INVALID_REQUEST"
}
```

---

## Rate Limiting

Recommended rate limits:

- **Architecture Chat**: 10 requests per minute per user
- **Issues Chat**: 20 requests per minute per user
- **Prompt Enhancement**: 5 requests per minute per user

---

## CORS Configuration

The backend should allow requests from:

```
http://localhost:3000
https://yourdomain.com
```

Required headers:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Example Implementation (Python/Flask)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

app = Flask(__name__)
CORS(app)

@app.route('/chat.py', methods=['POST'])
def chat():
    data = request.json

    # Check action type
    if data.get('action') == 'enhance':
        return enhance_prompt(data['message'])

    # Check chat type
    chat_type = data.get('chatType')
    message = data['message']
    project_id = data['projectId']

    if chat_type == 'architecture':
        return generate_architecture(message, project_id)
    elif chat_type == 'issue':
        context = data.get('context')
        return answer_issue(message, project_id, context)
    else:
        return jsonify({'error': 'Invalid chat type'}), 400

def generate_architecture(message, project_id):
    # Your AI logic here
    prompt = f"""Generate a comprehensive software architecture design for: {message}

    Include:
    - Functional and non-functional requirements
    - Architectural patterns
    - High-level architecture with Mermaid diagrams
    - Technology stack recommendations
    - Data management strategies
    - Deployment strategies

    Format the response in markdown with Mermaid diagrams."""

    response = call_llm(prompt)
    return jsonify({'message': response, 'status': 'success'})

def answer_issue(message, project_id, context):
    # Use context for better answers
    context_summary = context.get('summary', '') if context else ''

    prompt = f"""Answer this question: {message}

    Architecture Context:
    {context_summary}

    Provide a detailed solution with code examples and diagrams."""

    response = call_llm(prompt)
    return jsonify({'message': response, 'status': 'success'})

def enhance_prompt(basic_prompt):
    prompt = f"""Enhance this basic prompt into detailed requirements: {basic_prompt}

    Add:
    - Specific features
    - Scale requirements
    - Technical details
    - Security considerations"""

    enhanced = call_llm(prompt)
    return jsonify({'enhancedPrompt': enhanced, 'status': 'success'})

def call_llm(prompt):
    # Your LLM integration (OpenAI, Claude, etc.)
    # Return the generated text
    pass

if __name__ == '__main__':
    app.run(port=8000)
```

---

## Testing Endpoints

### Using cURL

**Architecture Chat:**

```bash
curl -X POST http://localhost:8000/chat.py \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "message": "Design a social network",
    "projectId": "123",
    "chatType": "architecture"
  }'
```

**Issues Chat:**

```bash
curl -X POST http://localhost:8000/chat.py \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "message": "How to scale this?",
    "projectId": "123",
    "chatType": "issue",
    "context": {
      "summary": "Architecture using microservices..."
    }
  }'
```

**Enhance Prompt:**

```bash
curl -X POST http://localhost:8000/chat.py \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Build a mobile app",
    "action": "enhance"
  }'
```

---

## Best Practices

1. **Always include Mermaid diagrams** in architecture responses
2. **Use context** when available in issue responses
3. **Format responses** with proper markdown
4. **Be specific** - avoid generic answers
5. **Include code examples** where appropriate
6. **Add visual diagrams** for complex concepts
7. **Use proper headers** for organization
8. **Bold important points**
9. **Italicize** for emphasis
10. **Structure responses** with clear sections

---

## Support

For frontend integration issues, refer to:

- `README.md` - Full documentation
- `QUICK_START.md` - Quick setup guide
- `FEATURES.md` - Feature descriptions
- `src/services/api.js` - API client implementation

---

**This API documentation ensures seamless integration between frontend and backend! 🚀**
