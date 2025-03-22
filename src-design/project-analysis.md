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
    selectedTemplate?: PromptTemplate
    currentUser?: User
  }>
  ```
- **Persistence**: `@nanostores/persistent` for critical data
- **Pattern**: Centralized state with type safety

### AI Integration
- **Core**: `ChatManager` (Singleton pattern)
- **Components**:
  - `ChatParser`: Handles message processing
  - `MarkdownRenderer`: Renders AI responses
  - `TemplateParser`: Processes prompt templates
- **Integration**: LangChain/OpenAI via OpenRouter proxy
- **Models**: Dynamic model selection via OpenRouter API

### Data Layer
- **Database**: Astro DB with Turso backend
- **Content**: File-based MDX/Markdown
- **Collections**:
  - Blog posts
  - Projects
  - Legal documents
  - Chat sessions
  - Prompt templates

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
  private model: string;
  private template?: PromptTemplate;
}
```

### Template System
```typescript
interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  systemPrompt?: string;
  tags?: string[];
  llmConfig?: LLMConfig;
  variables?: string[];
}
```

### Internationalization
- Paraglide.js integration
- Middleware for locale detection
- Translated UI components

## Development Features
- TypeScript support
- ESLint configuration
- Network-enabled development mode
- Multiple deployment targets (Netlify, Vercel, Firebase)
- GitHub Actions for maintenance

## Project Structure
```
/
├── src/
│   ├── components/    # UI components
│   ├── content/       # MDX content
│   │   ├── blog/      # Blog posts
│   │   ├── projects/  # Project showcases
│   │   └── legal/     # Legal documents
│   ├── layouts/       # Page layouts
│   ├── lib/           # Core logic
│   │   ├── ai/        # AI integration
│   │   └── appStore.ts # State management
│   ├── pages/         # Routes
│   │   └── api/       # API endpoints
│   ├── paraglide/     # i18n
│   └── styles/        # Global styles
└── public/            # Static assets
```

## State Flow
1. Component triggers action
2. `ChatManager` processes request
3. State updates via nanostores
4. UI reacts to state changes
5. Persistence handled automatically

## API Integration
- OpenRouter for LLM model access
- API proxy to secure credentials
- Dynamic model selection
- Template-based prompt system

## Deployment
- Multi-platform support
  - Netlify (primary)
  - Vercel
  - Firebase
- Environment-specific configurations
- Database synchronization tools
