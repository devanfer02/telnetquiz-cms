# TelNetQuiz CMS

Admin panel, API backend, and TTS microservice for the **TelNetQuiz** educational quiz app. Built as part of a thesis project.

![TanstackStart](https://img.shields.io/badge/TanStack%20Start-00C7B7?style=for-the-badge&logo=tanstack&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-%23000000?style=for-the-badge&logo=drizzle&logoColor=C5F74F)
![Effect-TS](https://img.shields.io/badge/Effect--TS-%23000000?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn/ui](https://img.shields.io/badge/shadcn/ui-%23000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare%20R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

## What's Included

This repo contains three components:

| Component | Stack | Description |
|-----------|-------|-------------|
| **CMS Web App** | TanStack Start, React 19, Tailwind CSS, shadcn/ui | Admin dashboard for managing chapters, quizzes, questions, study materials, schools, users, achievements, and submissions |
| **API Backend** | TanStack Start API routes, Drizzle ORM, Effect-TS, PostgreSQL (Supabase) | REST API consumed by the Android mobile app, protected by API key + auth middleware |
| **TTS Service** | FastAPI, Edge TTS, Cloudflare R2 | Microservice that generates Indonesian speech audio from study materials using Microsoft Edge neural voices |

## Prerequisites

- [Bun](https://bun.sh/) (v1.x)
- [Python](https://www.python.org/) (3.12+) and [uv](https://docs.astral.sh/uv/) — for TTS service
- [Docker](https://www.docker.com/) — optional, for containerized deployment
- PostgreSQL database (e.g., [Supabase](https://supabase.com/))
- Cloudflare R2 bucket — for image and audio storage

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/devanfer02/telnetquiz-cms.git
cd telnetquiz-cms
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in all required values (database URL, auth secrets, R2 credentials, etc.)
```

### 3. Set up database

```bash
bun run db:migrate    # Generate and push Drizzle migrations
```

### 4. Seed content (optional)

```bash
bun cli/db-init.ts              # Seed essentials (2 chapters, 12 quizzes, ~89 questions)
bun cli/db-init.ts --scale      # Seed with scale-test data (7 chapters, 112 quizzes, ~1100 questions, 100 users)
```

### 5. Run development

```bash
# Start both CMS and TTS concurrently
make dev

# Or start individually
make dev:cms    # CMS on http://localhost:3000
make dev:tts    # TTS on http://localhost:8000
```

## Commands

### Development

| Command | Description |
|---------|-------------|
| `make dev` | Start CMS + TTS concurrently |
| `make dev:cms` | Start CMS dev server (port 3000) |
| `make dev:tts` | Start TTS dev server (port 8000) |

### Build & Quality

| Command | Description |
|---------|-------------|
| `bun run build` | Production build (Vite + Nitro) |
| `bun run check` | Biome lint + format check |
| `bun test` | Run Vitest |

### Database

| Command | Description |
|---------|-------------|
| `bun run db:migrate` | Generate + push Drizzle migrations |
| `bun run db:generate` | Generate migrations only |
| `bun run db:push` | Push migrations to database |

### Content & Utilities

| Command | Description |
|---------|-------------|
| `make seed:content` | Seed quiz content from CLI |
| `make seed:mock` | Seed mock data |
| `make img:upload` | Upload images to R2 |
| `make populate-content` | Upload images + seed content |
| `make tts:batch` | Batch generate TTS audio |
| `make tts:purge` | Purge generated TTS audio |
| `bun run api:route` | List all API routes |

### Docker

| Command | Description |
|---------|-------------|
| `make docker:build` | Build all containers |
| `make docker:up` | Start containers in background |
| `make docker:down` | Stop containers |
| `make docker:logs` | Tail container logs |

### GHCR (Container Registry)

| Command | Description |
|---------|-------------|
| `make ghcr:login` | Login to ghcr.io (requires `GHCR_TOKEN` in `.env`) |
| `make ghcr:build` | Build CMS + TTS images |
| `make ghcr:push` | Push images to GHCR |
| `make ghcr:build-push` | Build and push in one step |
| `make ghcr:build-push TAG=v1.0.0` | Build and push with custom tag |

## Docker Deployment

Both services are published to GitHub Container Registry:

```
ghcr.io/devanfer02/telnetquiz-cms:latest
ghcr.io/devanfer02/telnetquiz-tts:latest
```

To deploy with Docker Compose:

```bash
# Pull and start (images are public, no login needed)
docker compose pull
docker compose up -d
```

CI/CD is handled by GitHub Actions — pushing to `master` automatically builds both images, pushes to GHCR, and deploys via SSH.

## Folder Structure

```
src/
├── routes/                     # TanStack Router file-based routing
│   ├── (web)/                  # Admin UI pages (10 modules)
│   ├── api/(internal)/         # Protected API routes (x-api-key)
│   └── api/(public)/           # Public routes (health, OAuth)
├── actions/                    # Server functions (createServerFn)
├── services/                   # Business logic (Effect-TS)
├── database/                   # Drizzle ORM schema + migrations
│   ├── schema.ts
│   └── drizzle/
├── middlewares/                 # API key, auth, logger, sentry
├── components/                 # Shared UI + preview components
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities (db, http, retry, constants)
├── types/                      # Zod schemas & TypeScript types
└── store/                      # Client state (Zustand)

tts-api/                        # TTS microservice
├── src/
│   └── main.py                 # FastAPI app (Edge TTS + R2 upload)
├── Dockerfile
└── pyproject.toml
```