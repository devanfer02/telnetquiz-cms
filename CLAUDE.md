# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

# Utilities
bun run api:route    # List all API routes with methods
```

## Architecture

### Layered Structure

1. **Routes** (`src/routes/`) - TanStack Router file-based routing
   - `(web)/` - Admin UI pages (dashboard, chapters, quiz, questions, users, etc.)
   - `api/(internal)/` - Protected API routes (requires x-api-key header)
   - `api/(public)/` - Public API routes (health, OAuth callbacks)

2. **Actions** (`src/actions/`) - Server functions using `createServerFn` from TanStack React Start

3. **Services** (`src/services/`) - Business logic layer using Effect-TS
   - Returns `Effect` computations with typed errors
   - Consumed via `Effect.runPromise()` with `DbLayer` provided

4. **Database** (`src/database/`) - Drizzle ORM with PostgreSQL (Supabase)
   - Schema: `src/database/schema.ts`
   - Migrations: `src/database/drizzle/`

### Key Patterns

**Effect-TS for Error Handling:**
```typescript
// Services return Effect with typed errors
export const fetchChapterById = (id: number) =>
  Effect.gen(function* () {
    const { db } = yield* Db;
    // ... database operations
  });

// Actions provide DbLayer and handle errors
Effect.runPromise(
  fetchChapterById(id).pipe(
    Effect.provide(DbLayer),
    Effect.catchAll((err) => Effect.succeed(null))
  )
);
```

**Custom Error Classes** (`src/services/errors/errors.ts`):
- `DatabaseError`, `NotFoundError`, `ValidationError`, `AuthError`, `CloudflareR2Error`

**Route Grouping:**
- `(internal)` routes have API key middleware (`x-api-key` header validation)
- `(web)` routes are admin UI pages
- `-sections/` folders contain route-specific components (not routes themselves)

### Database Schema

Main entities: `users`, `chapters`, `quizzes`, `questions`, `options`, `submissions`, `pretestSubmissions`, `studyMaterials`

Relations are defined with Drizzle's `relations()` helper at the bottom of `schema.ts`.

## Tech Stack

- **Framework:** TanStack Start + React 19 + Nitro
- **Routing:** TanStack Router (file-based)
- **State:** TanStack Query (server) + Zustand (client)
- **Database:** Drizzle ORM + PostgreSQL (Supabase)
- **Auth:** Better Auth (email/password + Google OAuth)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Validation:** Zod v4
- **Error Handling:** Effect-TS
- **File Storage:** Cloudflare R2 (S3-compatible)

## Configuration

- **Path Alias:** `@/*` maps to `./src/*`
- **Formatter:** Biome with tabs, double quotes
- **Environment:** See `.env.example` for required variables

## Code Style

- Use Biome for formatting (tabs) and linting
- Zod schemas in `src/types/zod.ts` for form validation
- Type definitions in `src/types/types.ts`
- UI components from shadcn/ui are in `src/components/ui/` (excluded from linting)
- Route-specific sections go in `-sections/` folders within route directories
