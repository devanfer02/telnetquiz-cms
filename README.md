# TelNetQuiz CMS Panel

Bootstrapped with [TanStack Start](https://tanstack.com/start/latest) App. Made as part of thesis.

## Project Overview

TelNetQuiz CMS is a full-stack web application built with TanStack Start (React 19 metaframework) serving as the admin panel for the TelNetQuiz mobile app. It manages quiz content, study materials, users, and analytics.

## Common Commands

```bash
# Development
bun run dev          # Start dev server on port 3000

# Building
bun run build        # Production build
bun run serve        # Preview built app

# Code Quality
bun run check        # Biome lint + format check
bun run format       # Format with Biome
bun run lint         # Lint with Biome

# Testing
bun test             # Run vitest

# Database
bun run db:migrate   # Generate + push Drizzle migrations
bun run db:generate  # Generate migrations only
bun run db:push      # Push migrations to database

# Seeding
bun cli/db-init.ts            # Seed essentials (2 chapters, 12 quizzes, ~89 questions)
bun cli/db-init.ts --scale    # Seed essentials + scale-test data (7 chapters, 112 quizzes, ~1100 questions, 100 users, ~3500 submissions)
bun cli/db-scale-rollback.ts  # Remove scale-test data, keep essentials

# Utilities
bun run api:route    # List all API routes with methods
```

## Architecture

### Layered Structure

```
src/
├── routes/                          # TanStack Router file-based routing
│   ├── (web)/                       # Admin UI pages
│   │   ├── dashboard/
│   │   ├── chapters/
│   │   ├── quiz/
│   │   ├── questions/
│   │   ├── schools/
│   │   ├── study-materials/
│   │   ├── submissions/
│   │   └── users/
│   ├── api/(internal)/              # Protected API routes (x-api-key header)
│   │   ├── activity/
│   │   ├── auth/
│   │   ├── chapters/
│   │   ├── materials/
│   │   ├── pretest/
│   │   ├── quiz/
│   │   ├── schools/
│   │   └── users/
│   └── api/(public)/                # Public API routes (health, OAuth)
│       └── auth/
├── actions/                         # Server functions (createServerFn)
│   ├── chapters.ts
│   ├── questions.ts
│   ├── quizzes.ts
│   ├── schools.ts
│   ├── study-material.ts
│   └── users.ts
├── services/                        # Business logic (Effect-TS)
│   ├── chapters.ts
│   ├── questions.ts
│   ├── quizzes.ts
│   ├── schools.ts
│   ├── study-material.ts
│   ├── users.ts
│   └── errors/
├── database/                        # Drizzle ORM + PostgreSQL (Supabase)
│   ├── schema.ts
│   └── drizzle/                     # Generated migrations
├── middlewares/                      # API middleware
│   ├── api-key.ts
│   ├── auth.ts
│   ├── logger.ts
│   └── sentry.ts
├── components/                      # Shared UI components
├── hooks/                           # Custom React hooks
├── lib/                             # Utilities (db, http, retry, constants)
├── types/                           # Zod schemas & TypeScript types
└── store/                           # Client state
```

## Tech Stack


![TanstackStart](https://img.shields.io/badge/TanStack%20Start-00C7B7?style=for-the-badge&logo=tanstack&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-%23000000?style=for-the-badge&logo=drizzle&logoColor=C5F74F)
![Effect-TS](https://img.shields.io/badge/Effect--TS-%23000000?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn/ui](https://img.shields.io/badge/shadcn/ui-%23000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare%20R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

