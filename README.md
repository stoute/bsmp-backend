![Astro Sphere Lighthouse Score](public/images/logo@2x.png)

# BSMP

A modern, server-side rendered website built with Astro, featuring dynamic content, AI-powered chat, state management, and optimal performance.

## 🛠 Tech Stack

- **Framework:** [Astro](https://astro.build) with Server-Side Rendering (SSR)
- **State Management:** Nanostores for reactive, persistent state
- **UI Components:** 
  - React for interactive features
  - Solid.js for performance-critical components
- **Styling:** Tailwind CSS
- **Content:** MDX with frontmatter
- **AI Integration:** LangChain/OpenAI via proxy
- **Database:** Astro DB
- **Deployment:** Multi-platform (Netlify, Vercel, Firebase)

## ✨ Core Features

### State Management
- Centralized state using nanostores
- Persistent storage for critical data
- Type-safe state handling
- Cross-component reactivity

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

### UI/UX
- Server-Side Rendering
- Dark/Light theme (persistent)
- Responsive Tailwind design
- Animated elements
- Code syntax highlighting

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
│   │   └── projects/ # Project showcases
│   ├── layouts/      # Page layouts
│   ├── lib/          # Core logic + state
│   ├── pages/        # Routes
│   └── styles/       # Global styles
└── public/           # Static assets
```

## 🔧 Configuration

### Core Config Files
- `astro.config.mjs` - Astro settings
- `tailwind.config.mjs` - Tailwind setup
- `src/lib/appStore.ts` - State management
- `src/consts.ts` - Site-wide constants

### State Configuration
```typescript
// src/lib/appStore.ts
export const appState = persistentMap<AppState>({
  apiBaseUrl: string,
  environment: string,
  selectedModel?: string,
  currentChat?: ChatState
});
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
---
```

### State Management
```typescript
// In components
import { useStore } from '@nanostores/react';
import { appState } from '../lib/appStore';

const state = useStore(appState);
```

## 🌐 Deployment

```bash
# Netlify
npm run build
# Configure in netlify.toml

# Vercel
npm run deploy-vercel

# Firebase
npm run deploy-firebase
```

## 🔄 Database Operations

```bash
npm run db-pull-remote  # Pull remote DB
npm run db-push-remote  # Push to remote DB
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

