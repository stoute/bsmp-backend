# Project Analysis: Astro Sphere

## Core Architecture

### Frontend Layer
- **Framework**: Astro with SSR
- **UI Components**: 
  - React for interactive features
  - Solid.js for performance-critical components
- **Styling**: Tailwind CSS
- **Content**: MDX/Markdown for blog posts and projects

### State Management
- **Core**: Nanostores (`src/lib/appStore.ts`)
- **Key Stores**:
  ```typescript
  appState: PersistentStore<{
    apiBaseUrl: string
    environment: string
    selectedModel?: string
    currentChat?: ChatState
  }>
  ```
- **Persistence**: `@nanostores/persistent` for critical data
- **Pattern**: Centralized state with type safety

### AI Integration
- **Core**: `ChatManager` (Singleton pattern)
- **Components**:
  - `ChatParser`: Handles message processing
  - `MarkdownRenderer`: Renders AI responses
  - Template system for structured prompts
- **Integration**: LangChain/OpenAI via proxy

### Data Layer
- **Database**: Astro DB
- **Content**: File-based MDX/Markdown
- **Collections**:
  - Blog posts
  - Projects
  - Legal documents

## Key Features

### Content Management
- Structured frontmatter
- Tag system
- Draft support
- SEO optimization

### AI Chat System
```typescript
class ChatManager {
  private static instance: ChatManager;
  private llm: ChatOpenAI;
  public messages: Message[] = [];
  private parser: ChatParser;
}
```

### Template System
```typescript
interface IPromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt?: string;
  template?: string;
  variables?: string[];
}
```

## Development Features
- TypeScript support
- ESLint configuration
- Network-enabled development mode
- Multiple deployment targets

## Project Structure
```
/
├── src/
│   ├── components/    # UI components
│   ├── content/       # MDX content
│   ├── layouts/       # Page layouts
│   ├── lib/          # Core logic
│   ├── pages/        # Routes
│   └── styles/       # Global styles
```

## State Flow
1. Component triggers action
2. `ChatManager` processes request
3. State updates via nanostores
4. UI reacts to state changes
5. Persistence handled automatically

## Deployment
- Multi-platform support
  - Netlify
  - Vercel
  - Firebase
- Environment-specific configurations