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

![TanstackStart](https://img.shields.io/badge/TanStack%20Start-00C7B7?style=for-the-badge&logo=tanstack&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-%23000000?style=for-the-badge&logo=drizzle&logoColor=C5F74F)
![Effect-TS](https://img.shields.io/badge/Effect--TS-%23000000?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn/ui](https://img.shields.io/badge/shadcn/ui-%23000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare%20R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

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
