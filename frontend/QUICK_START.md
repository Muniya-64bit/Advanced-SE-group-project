# Quick Start Guide

## 🎯 Overview

This AI-Powered Software Architect application helps you design comprehensive software architectures with AI assistance. It features:

1. **Architecture Design Chat** - Generate complete architecture recommendations with UML diagrams
2. **Issues & Q&A Chat** - Ask questions with full context awareness
3. **Prompt Enhancement** - Get AI-powered detailed prompts
4. **Mermaid Diagrams** - Visualize architectures with auto-rendered diagrams
5. **Rich Formatting** - Bold, italic, tables, and more

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Edit `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
VITE_API_URL=http://localhost:8000
```

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Open Browser

Navigate to: `http://localhost:3000`

## 📱 Using the Application

### 1. Login

- Click "Sign in with Google"
- Authorize the application
- You'll be redirected to the dashboard

### 2. Create a Project

- Click "New Project" button
- Enter a project name
- Click "Create"

### 3. Architecture Design Chat

**Basic Usage:**

1. Click on "Architecture Design" tab
2. Enter your requirements: "Build a social media platform"
3. Click "Send" or press Enter

**Using Prompt Enhancement:**

1. Enter basic requirements: "E-commerce website"
2. Click "Enhance" button
3. Wait for AI to enhance your prompt
4. Edit the enhanced prompt if needed
5. Click "Send"

**Example Prompts:**

- "Design a real-time chat application"
- "Create architecture for a video streaming platform"
- "Build a microservices-based e-commerce system"

**What You'll Get:**

- ✅ Functional & Non-functional Requirements
- ✅ Architectural Patterns & Styles
- ✅ **UML Diagrams** (rendered as Mermaid)
- ✅ Technology Stack Recommendations
- ✅ Data Management Strategies
- ✅ Deployment Plans

### 4. Issues & Q&A Chat

**After creating architecture design:**

1. Switch to "Issues & Q&A" tab
2. Notice the green banner: "Architecture context is available"
3. Ask questions like:
   - "How can I improve scalability?"
   - "What security measures should I add?"
   - "How do I handle real-time updates?"
4. Get **context-aware answers** based on your architecture

**Without architecture context:**

- You can still ask questions
- Answers will be general (not project-specific)
- Yellow banner shows: "No architecture context yet"

## 💡 Pro Tips

### For Better Architecture Design:

1. **Be Specific**: Include scale, users, and key features

   - ❌ "Build a website"
   - ✅ "Build a job portal for 100k users with real-time chat and video interviews"

2. **Use Enhance Feature**: Get comprehensive prompts automatically

3. **Iterate**: Ask follow-up questions in Issues chat

### For Mermaid Diagrams:

- Diagrams are auto-rendered from code blocks
- Look for visual graphs in responses
- Diagrams show:
  - System architecture
  - Component relationships
  - Data flow
  - Deployment structure

### For Context-Aware Q&A:

- Always create architecture design first
- Context is automatically saved
- Each question includes full project context
- Get specific answers tailored to your design

## 🎨 Understanding the UI

### Color Coding:

- **Blue (Primary)** - Architecture Design features
- **Orange** - Issues & Q&A features
- **Green** - Success states (context available)
- **Yellow** - Warning states (no context)

### Tab System:

- **Architecture Design Tab**: Create and view architecture
- **Issues & Q&A Tab**: Ask questions with context

### Message Styles:

- **User Messages**: Right-aligned, colored background
- **AI Responses**: Left-aligned, formatted with markdown

## 📊 Example Workflow

### Complete Project Example:

**Step 1: Create Project**

```
Project Name: "Food Delivery App"
```

**Step 2: Architecture Design**

```
Prompt: "Design a food delivery application"
↓ Click "Enhance"
Enhanced: "Design a comprehensive food delivery application
supporting 50,000+ daily orders with real-time tracking,
payment integration, and restaurant management..."
↓ Click "Send"
Result: Complete architecture with diagrams
```

**Step 3: Ask Questions**

```
Switch to Issues & Q&A tab

Q: "How do I handle real-time order tracking?"
A: Context-aware answer with specific implementation for YOUR architecture

Q: "What caching strategy should I use?"
A: Recommendations based on YOUR tech stack
```

## 🔧 Backend Integration

### Expected Backend Endpoint: `/chat.py`

**Architecture Chat Request:**

```json
POST /chat.py
{
  "message": "Design a social network",
  "projectId": "123",
  "chatType": "architecture"
}
```

**Issues Chat Request:**

```json
POST /chat.py
{
  "message": "How to scale this?",
  "projectId": "123",
  "chatType": "issue",
  "context": {
    "lastUpdate": "2025-11-19T...",
    "summary": "Architecture design content...",
    "messages": [...]
  }
}
```

**Prompt Enhancement Request:**

```json
POST /chat.py
{
  "message": "Build an app",
  "action": "enhance"
}
```

### Expected Response Format:

```json
{
  "message": "Architecture design content...",
  "enhancedPrompt": "For enhancement requests"
}
```

## 🐛 Common Issues

### "No architecture context" in Issues chat

- **Solution**: Create an architecture design first
- Context is automatically saved after generating architecture

### Mermaid diagrams not showing

- **Solution**: Check that your response includes proper mermaid code blocks:
  ````markdown
  ```mermaid
  graph TB
      A --> B
  ```
  ````

### Google OAuth not working

- **Solution**: Add your Google Client ID to `.env`
- Get it from: https://console.cloud.google.com/

## 📚 Next Steps

1. ✅ Set up your Google OAuth credentials
2. ✅ Connect to your backend API
3. ✅ Create your first project
4. ✅ Generate an architecture design
5. ✅ Ask questions with context

## 🎓 Learning Resources

- **Mermaid Syntax**: https://mermaid.js.org/
- **Markdown Guide**: https://www.markdownguide.org/
- **React Router**: https://reactrouter.com/
- **Tailwind CSS**: https://tailwindcss.com/

---

**Need Help?** Check the main README.md for detailed documentation.

**Enjoy designing amazing architectures! 🚀**
