---
description: Prime agent with codebase understanding
---

# Prime: Load Project Context

## Objective

Build comprehensive understanding of the codebase by analyzing structure, documentation, and key files.

## Process

### 1. Analyze Project Structure

List all tracked files:
!`git ls-files`

Show directory structure:
!`find . -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/.next/*' -not -path '*/dist/*' -not -path '*/_generated/*' | sort`

### 2. Read Core Documentation

- Read CLAUDE.md (global rules and conventions)
- Read README.md at project root
- Read any architecture documentation in docs/
- Read the Prisma schema so you understand the database (`prisma/schema.prisma`)

### 3. Identify Key Files

Based on the structure, identify and read:
- Main entry points (src/app/layout.tsx)
- Core configuration files (package.json, tsconfig.json, next.config.ts, components.json)
- Key schema/model definitions (prisma/schema.prisma)
- Auth configuration (src/lib/auth.ts, src/proxy.ts)
- Important service files (src/services/*.ts)
- Key validations (src/lib/validations/*.ts)

### 4. Understand Current State

Check recent activity:
!`git log -10 --oneline`

Check current branch and status:
!`git status`

## Output Report

Provide a concise summary covering:

### Project Overview
- Purpose and type of application
- Primary technologies and frameworks
- Current version/state

### Architecture
- Overall structure and organization
- Key architectural patterns identified
- Important directories and their purposes

### Tech Stack
- TypeScript + Next.js 16 (App Router) + React 19
- PostgreSQL (Neon) + Prisma 7
- NextAuth v5 (OTP via email)
- Resend + React Email
- Tailwind CSS 4 + shadcn/ui
- Vercel Blob (file storage)
- MercadoPago (payments)
- pnpm as package manager

### Database Schema
- Tables, relationships, and indexes
- Notable fields or conventions

### Core Principles
- Code style and conventions observed
- Component patterns (client vs server)
- Action patterns (ActionResult<T>)

### Current State
- Active branch
- Recent changes or development focus
- Any immediate observations or concerns

**Make this summary easy to scan - use bullet points and clear headers.**
