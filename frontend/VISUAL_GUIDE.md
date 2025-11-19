# Visual Guide - AI-Powered Software Architect

## 🎨 Application Screens & Features

### 1. 🔐 Login Screen

**Location**: `/login`

**Features:**

- Clean, centered login card with gradient background
- AI brain icon with blue accent color
- "AI Software Architect" branding
- Google OAuth "Sign in with Google" button
- Feature list showing capabilities:
  - Complete architecture design generation
  - UML diagram visualization with Mermaid
  - Issues & Q&A with contextual awareness
  - AI-powered prompt enhancement

**Color Scheme:**

- Background: Gradient from slate-900 via purple-900
- Card: Slate-800 with border
- Primary: Blue (0ea5e9)
- Text: White and gray

---

### 2. 📊 Dashboard

**Location**: `/dashboard`

**Header:**

- Left: AI logo + "AI Software Architect" title
- Right: User profile (avatar + name + email) + Logout button
- Sticky header with dark background

**Main Content:**

- Page title: "Your Projects"
- Subtitle: "Manage your architecture design projects"
- "New Project" button (blue, top right)

**Project Cards** (Grid layout):

- Project name (large, bold)
- Creation date with calendar icon
- Architecture Chats count
- Issue Chats count
- Delete button (red trash icon, top right)
- Hover effect: Blue border glow

**Empty State:**

- Large folder icon
- "No projects yet" message
- "Create your first project to get started"
- "Create Project" button

**New Project Modal:**

- Dark overlay
- Centered modal with slate background
- Input field for project name
- Cancel and Create buttons

---

### 3. 🏗️ Project View - Architecture Design Tab

**Location**: `/project/:projectId` (Architecture tab active)

**Header:**

- Back arrow button (left)
- Project name and creation date
- Tab navigation (centered-right):
  - "Architecture Design" tab (blue when active)
  - "Issues & Q&A" tab (gray when inactive)

**Chat Area:**

**Empty State:**

- Sparkles icon in blue circle
- "Architecture Design Assistant" title
- Description of features
- Feature list in blue box showing what you'll get:
  - Functional & Non-functional Requirements
  - Architectural Patterns & Styles
  - High-level Architecture with UML Diagrams
  - Technology Stack Recommendations
  - Data & Storage Management
  - Integration & Third-party Services
  - Deployment Strategies

**With Messages:**

- User messages: Right-aligned, blue background, rounded corners
- AI messages: Left-aligned, dark background with border, rounded corners
- AI responses show:
  - **Bold headings** (white text)
  - _Italic emphasis_ (gray text)
  - Code blocks (syntax highlighted, dark background)
  - Mermaid diagrams (white background, auto-rendered)
  - Tables with borders
  - Lists with bullets
  - Numbered sections

**Loading State:**

- Gray message box on left
- Spinner icon
- "Generating architecture design..." text

**Input Area:**

- Large textarea (3 rows)
- Placeholder: "Describe your project requirements..."
- Two buttons on right:
  - "Enhance" button (purple) with sparkles icon
  - "Send" button (blue) with send icon
- Helper text: "Press Enter to send, Shift+Enter for new line. Use 'Enhance' to get AI-powered detailed prompts."

---

### 4. 🐛 Project View - Issues & Q&A Tab

**Location**: `/project/:projectId` (Issues tab active)

**Header:**

- Same as Architecture tab
- "Issues & Q&A" tab (orange when active)
- "Architecture Design" tab (gray when inactive)

**Context Status Banner:**

**With Context (Green):**

- Green background (low opacity)
- Checkmark icon
- "Architecture context is available - Your questions will have full project context"

**Without Context (Yellow):**

- Yellow background (low opacity)
- Alert icon
- "No architecture context yet - Create an architecture design first for better answers"

**Chat Area:**

**Empty State:**

- Alert circle icon in orange
- "Issues & Q&A Assistant" title
- Description
- Example questions in orange box:
  - How can I improve the scalability of my architecture?
  - What security measures should I implement?
  - How do I handle real-time data synchronization?
  - What's the best caching strategy?
  - How can I optimize database queries?
- Green checkmark note if context available

**With Messages:**

- User messages: Right-aligned, orange background
- AI messages: Left-aligned, dark background with border
- Same rich formatting as Architecture chat
- AI responses reference architecture context when available

**Loading State:**

- Spinner + "Analyzing your question with architecture context..."

**Input Area:**

- Textarea (2 rows)
- Placeholder: "Ask a question about your architecture design..."
- Orange "Send" button
- Helper text with context status

---

## 🎨 Color Palette

### Primary Colors:

- **Blue (Primary)**: #0ea5e9 - Architecture features, main CTA
- **Orange**: #f97316 - Issues & Q&A features
- **Purple**: #7c3aed - Enhance feature
- **Green**: #10b981 - Success states (context available)
- **Yellow**: #f59e0b - Warning states (no context)
- **Red**: #ef4444 - Delete actions

### Background Colors:

- **Slate-900**: #0f172a - Main background
- **Slate-800**: #1e293b - Cards, modals
- **Slate-700**: #334155 - Inputs, secondary elements
- **Slate-600**: #475569 - Borders

### Text Colors:

- **White**: #ffffff - Primary text, headings
- **Gray-200**: #e5e7eb - Body text
- **Gray-400**: #9ca3af - Secondary text
- **Gray-500**: #6b7280 - Helper text

---

## 🎯 Key Visual Elements

### Mermaid Diagrams:

```
┌─────────────────────────────────────┐
│                                     │
│   ┌──────┐     ┌──────┐           │
│   │Client│────▶│Server│           │
│   └──────┘     └──────┘           │
│                   │                │
│                   ▼                │
│               ┌────────┐           │
│               │Database│           │
│               └────────┘           │
│                                     │
└─────────────────────────────────────┘
White background, blue/purple nodes
```

### Message Bubbles:

````
User Message (Right):
┌─────────────────────────────┐
│ How do I scale this?        │ ← Blue background
└─────────────────────────────┘

AI Response (Left):
┌─────────────────────────────────────┐
│ ## Scaling Strategy                 │
│                                     │
│ To scale your architecture:         │
│ - **Use load balancing**            │ ← White/Gray text
│ - *Consider microservices*          │   with formatting
│                                     │
│ ```mermaid                          │
│ graph TB                            │
│   A-->B                             │
│ ```                                 │ ← Rendered diagram
└─────────────────────────────────────┘
Dark background with border
````

### Project Cards:

```
┌──────────────────────────────────┐
│ E-commerce Platform         [×]  │ ← Delete button
│ 📅 11/19/2025                    │
│                                  │
│ Architecture Chats:    2         │
│ Issue Chats:          5         │
└──────────────────────────────────┘
Hover: Blue glow border
```

---

## 📱 Responsive Behavior

### Desktop (1024px+):

- 3-column project grid
- Full sidebar navigation
- Wide chat messages (max-width: 4xl)
- Side-by-side tab buttons

### Tablet (768px - 1023px):

- 2-column project grid
- Condensed header
- Medium chat messages (max-width: 3xl)
- Stacked tab buttons

### Mobile (<768px):

- 1-column project grid
- Minimal header (icon only)
- Full-width chat messages
- Vertical tab buttons
- Smaller input area

---

## ✨ Animations & Interactions

### Hover Effects:

- **Buttons**: Background color darkens
- **Project Cards**: Border glows blue
- **Links**: Color shifts lighter

### Loading States:

- **Spinner**: Rotating animation
- **Pulse**: For loading cards/placeholders

### Transitions:

- **Tab Switch**: Fade in/out (200ms)
- **Modal**: Fade + scale in (300ms)
- **Messages**: Slide up + fade in (200ms)
- **Hover**: All transitions 150ms

### Focus States:

- **Inputs**: Blue ring (2px)
- **Buttons**: Outline + ring
- **Links**: Underline + color

---

## 🎭 Theme & Style

### Design Philosophy:

- **Modern**: Clean lines, ample whitespace
- **Professional**: Dark theme for focus
- **Intuitive**: Clear visual hierarchy
- **Consistent**: Unified color system
- **Accessible**: High contrast ratios

### Typography:

- **Font Family**: Inter, system-ui
- **Headings**: Bold, larger sizes
- **Body**: Regular weight, comfortable line height
- **Code**: Monospace font, highlighted

### Spacing:

- **Compact**: Mobile-friendly spacing
- **Comfortable**: Desktop spacing (more padding)
- **Consistent**: 4px base unit (Tailwind scale)

---

## 🖼️ Icon Usage

### Navigation:

- ArrowLeft: Back to dashboard
- Plus: Create new project
- LogOut: Sign out

### Features:

- Brain: AI/Intelligence
- Layers: Architecture
- MessageSquare: Chat/Q&A
- Sparkles: Enhancement/Magic
- AlertCircle: Issues/Warnings
- CheckCircle: Success/Context

### Actions:

- Send: Submit message
- Trash2: Delete
- Loader2: Loading (animated)
- Calendar: Date

All icons from **Lucide React** library

---

## 💅 CSS Special Features

### Custom Scrollbar:

- Width: 8px
- Track: Dark gray
- Thumb: Light gray, rounded
- Hover: Lighter gray

### Markdown Content:

- Custom styles for all elements
- Proper spacing and hierarchy
- Syntax highlighting for code
- Table borders and padding
- List indentation

### Mermaid Diagrams:

- White background (contrast)
- Padding: 20px
- Rounded corners: 8px
- Dark theme colors
- Responsive (scrollable)

---

This visual guide describes the complete UI/UX of the application. The actual implementation matches these specifications exactly!
