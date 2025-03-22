![BSMP Logo](public/images/logo@2x.png)

# BSMP

A modern, server-side rendered website and api built with Astro, featuring dynamic content, 
AI-powered chat, state management, and optimal performance. 
Built on top of [Astro Sphere](https://github.com/markhorn-dev/astro-sphere), this project may serve as a guide on how to create full stack CRUD applications with Astro.

Please take note that this project is under active development. 
I'm using it to see just how far I can take the AI code assistant, or vise versa. 


## 🛠 Tech Stack

- **Framework:** [Astro](https://astro.build) with Server-Side Rendering (SSR)
- **State Management:** Nanostores for reactive, persistent state
- **UI Components:** 
  - React for interactive features
- **Styling:** Tailwind CSS
- **Content:** MDX with frontmatter
- **AI Integration:** LangChain/OpenAI via proxy
- **Database:** Astro DB
- **Deployment:** Multi-platform (Netlify, Vercel)

## ✨ Core Features

### State Management
- Centralized state using nanostores
- Persistent storage for critical data
- Type-safe state handling
- Cross-component reactivity
- Authentication state management

### AI Integration
- Singleton ChatManager pattern
- Template-based prompt system
- Message parsing and rendering
- Structured chat sessions

### Content System
- MDX/Markdown with frontmatter
- Blog posts and project showcases
- Draft support
- Tag-based organization
- SEO optimization
- RSS feed generation

### UI/UX
- Server-Side Rendering
- Dark/Light theme (persistent)
- Responsive Tailwind design
- Animated page transitions
- Code syntax highlighting
- Mobile-friendly drawer navigation

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev              # Local server
npm run dev:network      # Network-enabled server

# Production
npm run build           # Build for production
npm run preview         # Preview build
```

## 📁 Project Structure

```
/
├── src/
│   ├── components/    # UI components
│   ├── content/       # MDX content
│   │   ├── blog/     # Blog posts
│   │   ├── projects/ # Project showcases
│   │   ├── work/     # Work page content
│   │   └── legal/    # Legal documents
│   ├── layouts/      # Page layouts
│   ├── lib/          # Core logic + state
│   ├── pages/        # Routes
│   └── styles/       # Global styles
└── public/           # Static assets
    ├── images/       # Image assets
    ├── ui.svg        # UI icon sprite
    ├── social.svg    # Social media icon sprite
    └── open-graph.jpg # Default OG image
```

## 🔧 Configuration

### Core Config Files
- `astro.config.mjs` - Astro settings and integrations
- `tailwind.config.mjs` - Tailwind setup
- `db/config.ts` - Database configuration
- `src/lib/appStore.ts` - State management
- `src/consts.ts` - Site-wide constants and navigation

### State Configuration
```typescript
// src/lib/appStore.ts
export const appState = persistentMap<AppState>({
  apiBaseUrl: string,
  environment: string,
  selectedModel?: string,
  currentChat?: ChatState
});

// Authentication state
export const isLoggedIn = atom(false);
```

## 💻 Development

### Content Creation
Create new content in `src/content/{blog|projects}/`:

```yaml
---
title: "Your Title"
summary: "Brief description"
date: "YYYY-MM-DD"
draft: false
tags:
  - Tag1
  - Tag2
demoUrl: https://example.com  # Optional for projects
repoUrl: https://github.com/example/repo  # Optional for projects
---

Your markdown content here...
```

### State Management
```typescript
// In React components
import { useStore } from '@nanostores/react';
import { appState, isLoggedIn } from '../lib/appStore';

const state = useStore(appState);
const loggedIn = useStore(isLoggedIn);

// In Solid.js components
import { useStore } from '@nanostores/solid';
import { appState } from '../lib/appStore';

const state = useStore(appState);
```

## 🌐 Deployment

```bash
# Netlify (default)
npm run build
# Configure in netlify.toml

# Vercel
npm run deploy-vercel

```

## 🔄 Database Operations

```bash
npm run db-verify-remote  # Verify remote DB schema
npm run db-pull-remote    # Pull remote DB
npm run db-push-remote    # Push to remote DB
```

## 🧪 Quality Assurance

```bash
npm run lint       # Run linting
npm run lint:fix   # Fix lint issues
```

## License

MIT License

## 👤 Author

Bob Stoute - media programming
- Website: [www.bobstoute.nl](https://www.bobstoute.nl)
- GitHub: [github.com/stoute/bsmp-website](https://github.com/stoute/bsmp-website)
- Email: stoute.bob@gmail.com

