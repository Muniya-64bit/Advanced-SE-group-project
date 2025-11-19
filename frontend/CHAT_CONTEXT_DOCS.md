# ChatContext Documentation

## Overview

The `ChatContext` provides centralized chat message management with automatic localStorage persistence. All chat messages for both Architecture Design and Issues & Q&A are automatically saved and restored across page refreshes.

## Features

✅ **Automatic Persistence** - Messages saved to localStorage automatically
✅ **Per-Project Storage** - Each project has separate chat history
✅ **Dual Chat Support** - Handles both architecture and issues chats
✅ **Message Statistics** - Get chat counts per project
✅ **Easy Cleanup** - Clear messages for specific chats or entire projects

## Usage

### 1. Setup (Already Done)

The `ChatContext` is already wrapped around the app in `App.jsx`:

```jsx
<AuthProvider>
  <ProjectProvider>
    <ChatProvider>
      <Router>{/* Routes */}</Router>
    </ChatProvider>
  </ProjectProvider>
</AuthProvider>
```

### 2. Using in Components

```jsx
import { useChat } from "../../contexts/ChatContext";

const MyComponent = ({ projectId }) => {
  const { getMessages, addMessage, clearMessages } = useChat();

  // Get messages for a specific chat type
  const messages = getMessages(projectId, "architecture"); // or 'issues'

  // Add a new message
  const newMessage = {
    id: Date.now().toString(),
    role: "user", // or 'assistant'
    content: "Message content",
    timestamp: new Date().toISOString(),
  };
  addMessage(projectId, "architecture", newMessage);

  // Clear messages
  clearMessages(projectId, "architecture");
};
```

## API Reference

### `getMessages(projectId, chatType)`

Retrieves all messages for a specific project and chat type.

**Parameters:**

- `projectId` (string) - The project identifier
- `chatType` (string) - Either `'architecture'` or `'issues'`

**Returns:** Array of message objects

**Example:**

```jsx
const messages = getMessages("proj_123", "architecture");
// Returns: [{ id: '1', role: 'user', content: 'Hello', timestamp: '...' }, ...]
```

---

### `addMessage(projectId, chatType, message)`

Adds a single message to the chat history. Automatically saves to localStorage.

**Parameters:**

- `projectId` (string) - The project identifier
- `chatType` (string) - Either `'architecture'` or `'issues'`
- `message` (object) - Message object with structure:
  ```typescript
  {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string (ISO format)
  }
  ```

**Example:**

```jsx
addMessage("proj_123", "architecture", {
  id: Date.now().toString(),
  role: "user",
  content: "Design a microservices architecture",
  timestamp: new Date().toISOString(),
});
```

---

### `addMessages(projectId, chatType, messages)`

Adds multiple messages at once. Useful for bulk operations.

**Parameters:**

- `projectId` (string) - The project identifier
- `chatType` (string) - Either `'architecture'` or `'issues'`
- `messages` (array) - Array of message objects

**Example:**

```jsx
addMessages("proj_123", "issues", [
  { id: "1", role: "user", content: "Question 1", timestamp: "..." },
  { id: "2", role: "assistant", content: "Answer 1", timestamp: "..." },
]);
```

---

### `clearMessages(projectId, chatType)`

Clears all messages for a specific chat type within a project.

**Parameters:**

- `projectId` (string) - The project identifier
- `chatType` (string) - Either `'architecture'` or `'issues'`

**Example:**

```jsx
clearMessages("proj_123", "architecture"); // Clears only architecture chat
```

---

### `clearProjectChats(projectId)`

Removes all chat history for a project (both architecture and issues).

**Parameters:**

- `projectId` (string) - The project identifier

**Example:**

```jsx
clearProjectChats("proj_123"); // Removes all chats for this project
```

---

### `getChatStats(projectId)`

Gets statistics about chat messages for a project.

**Parameters:**

- `projectId` (string) - The project identifier

**Returns:** Object with:

```typescript
{
  architectureCount: number; // Number of architecture messages
  issuesCount: number; // Number of issues messages
  totalMessages: number; // Total message count
}
```

**Example:**

```jsx
const stats = getChatStats("proj_123");
// Returns: { architectureCount: 10, issuesCount: 5, totalMessages: 15 }
```

## Data Structure

### localStorage Key

All chats are stored under a single key: `projectChats`

### Storage Format

```json
{
  "proj_123": {
    "architecture": [
      {
        "id": "1732012345678",
        "role": "user",
        "content": "Design a social network",
        "timestamp": "2025-11-19T10:30:00.000Z"
      },
      {
        "id": "1732012345679",
        "role": "assistant",
        "content": "# Software Architecture Design\n...",
        "timestamp": "2025-11-19T10:30:05.000Z"
      }
    ],
    "issues": [
      {
        "id": "1732012400000",
        "role": "user",
        "content": "How to scale this?",
        "timestamp": "2025-11-19T10:35:00.000Z"
      }
    ]
  },
  "proj_456": {
    "architecture": [...],
    "issues": [...]
  }
}
```

## Integration Points

### Architecture Chat (`ArchitectureChat.jsx`)

```jsx
const { getMessages, addMessage } = useChat();

// Load messages
const messages = getMessages(projectId, "architecture");

// Add new message after API response
addMessage(projectId, "architecture", assistantMessage);
```

### Issues Chat (`IssuesChat.jsx`)

```jsx
const { getMessages, addMessage } = useChat();

// Load messages
const messages = getMessages(projectId, "issues");

// Add new message after API response
addMessage(projectId, "issues", assistantMessage);
```

### Dashboard (`Dashboard.jsx`)

```jsx
const { getChatStats, clearProjectChats } = useChat();

// Show message counts
const stats = getChatStats(project.id);

// Clean up when deleting project
const handleDeleteProject = (projectId) => {
  deleteProject(projectId);
  clearProjectChats(projectId); // Remove chat history
};
```

## Benefits

### 1. **Persistence**

- Messages survive page refreshes
- No data loss on accidental tab closure
- Continue conversations across sessions

### 2. **Performance**

- Single localStorage write per message
- Efficient message retrieval
- No unnecessary re-renders

### 3. **Separation of Concerns**

- Chat logic separated from UI components
- Easy to test and maintain
- Reusable across different chat types

### 4. **Data Management**

- Centralized storage management
- Consistent data structure
- Easy to migrate to backend storage later

## Migration Path

Currently using localStorage. To migrate to backend:

1. **Keep the same API** - `getMessages`, `addMessage`, etc.
2. **Replace implementation** - Fetch from API instead of localStorage
3. **Add sync logic** - Sync localStorage with backend
4. **No component changes needed** - Same hooks, same interface

Example future implementation:

```jsx
const addMessage = async (projectId, chatType, message) => {
  // Add to state
  setChats(prev => ({...prev, ...}))

  // Sync to backend
  await api.post('/chats', { projectId, chatType, message })

  // Still save to localStorage for offline support
  localStorage.setItem('projectChats', JSON.stringify(chats))
}
```

## Troubleshooting

### Messages not persisting?

Check browser's localStorage:

```javascript
// In browser console
console.log(localStorage.getItem("projectChats"));
```

### Clear all chat data?

```javascript
// In browser console
localStorage.removeItem("projectChats");
```

### Corrupted data?

The context handles JSON parse errors gracefully. If data is corrupted, it will reset.

---

## Summary

The `ChatContext` provides a clean, efficient way to manage chat messages with automatic persistence. It's already integrated into the application and works seamlessly with both chat types. Messages are automatically saved as you chat, and restored when you return to a project.

**Key Points:**

- ✅ Automatic localStorage persistence
- ✅ Per-project message storage
- ✅ Simple, consistent API
- ✅ Already integrated in all components
- ✅ Easy to migrate to backend later
