# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskPriority AI is an AI-powered task management system for solo founders. It uses OpenAI's API to automatically analyze, categorize, and prioritize tasks while generating implementation specifications for AI coding tools.

Key features:
- Manual task input with quick-add modal
- AI-powered task analysis and prioritization (1-10 scale)
- Duplicate detection and task grouping
- AI-generated implementation specifications
- GTM manifest for personalized analysis

## Development Commands

### Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Development Workflow

The project runs on http://localhost:3000 in development mode with hot reload enabled.

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **React**: 19.1.0

### Project Structure
- `/src/app/` - Next.js app router pages and layouts
- `/ai_docs/` - Product documentation including PRD, GTM manifest, and ICP research
- `/public/` - Static assets

### Key Architectural Decisions
- Using Next.js App Router (not Pages Router)
- TypeScript strict mode enabled
- Path aliases configured: `@/*` maps to `./src/*`
- Tailwind CSS v4 with PostCSS

### Important Context from PRD
According to the PRD, the full tech stack includes:
- Backend: Node.js/Express or Next.js API routes
- Database: PostgreSQL with Prisma ORM
- Queue: BullMQ with Redis
- AI: OpenAI GPT-4 API
- Auth: NextAuth with Google/GitHub OAuth
- Hosting: Vercel (frontend) + Railway/Render (backend)

The product is designed to save solo founders 5-10 hours per week by automatically prioritizing tasks based on business impact.