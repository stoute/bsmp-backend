![Astro Sphere Lighthouse Score](public/images/logo@3x.png)

#### BSMP - media programming

A modern, server-side rendered website built with Astro, featuring dynamic content, dark mode support, and optimal performance.

## 🛠 Tech Stack

- **Framework:** [Astro](https://astro.build) with Server-Side Rendering (SSR)
- **Styling:** Tailwind CSS
- **Components:** React for interactive components
- **Content:** MDX for rich content authoring
- **Deployment:** Multi-platform support (Netlify, Vercel, Firebase)
- **Database:** Astro DB integration

## ✨ Features

- Server-Side Rendering for optimal performance
- Dark/Light theme with persistent user preference
- Responsive design with Tailwind CSS
- Interactive chat component
- Blog with MDX support
- Projects showcase
- Content search functionality
- RSS Feed generation
- Automatic sitemap generation
- SEO optimization
- Animated UI elements
- Code syntax highlighting
- Network-enabled development mode

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start development server with network access
npm run dev:network

# Build for production
npm run build

# Preview production build
npm run preview

# Preview production build with network access
npm run preview:network
```

## 📁 Project Structure

```
/
├── public/           # Static assets
│   ├── fonts/       # Custom fonts
│   └── js/         # Client-side scripts
├── src/
│   ├── components/  # UI components
│   ├── content/     # MDX/Markdown content
│   │   ├── blog/   # Blog posts
│   │   ├── projects/ # Project showcases
│   │   └── legal/  # Legal documents
│   ├── layouts/    # Page layouts
│   ├── pages/      # Route pages
│   └── styles/     # Global styles
```

## 🔧 Configuration

Key configuration files:
- `astro.config.mjs` - Astro configuration
- `tailwind.config.mjs` - Tailwind CSS configuration
- `src/consts.ts` - Site-wide constants and metadata

## 💻 Development

### Content Management

Content is managed through Markdown and MDX files in the `src/content/` directory:
- Blog posts: `src/content/blog/`
- Projects: `src/content/projects/`
- Legal content: `src/content/legal/`

### Adding New Content

Create a new directory in the respective collection with an `index.md` or `index.mdx` file:

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

## 🌐 Deployment

The application supports multiple deployment platforms:

```bash
# Netlify deployment
npm run build
# Configure in netlify.toml

# Firebase deployment
npm run deploy-firebase
```

## 🔄 Database Operations

```bash
# Pull remote database
npm run db-pull-remote

# Push to remote database
npm run db-push-remote
```

## 🧪 Quality Assurance

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## License

MIT License

## 👤 Author

Bob Stoute - madia programming
- Website: [www.bobstoute.nl](https://www.bobstoute.nl)
- GitHub: [github.com/stoute/bsmp-website](https://github.com/stoute/bsmp-website)
- Email: stoute.bob@gmail.com

