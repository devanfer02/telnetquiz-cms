# CLAUDE.md

This file contains **rules and constraints** for Claude Code when working in this repository. For project overview, commands, architecture, tech stack, and code style conventions, see [`README.md`](../README.md).

Framework API reference is auto-loaded from `.claude/skills/`: `effect-ts`, `tanstack-start`, `drizzle-orm`.

## Quick Navigation — Rules & Constraints

Read the relevant section **before** writing code. These are mandatory, not suggestions.

| Section | What it covers |
|---------|---------------|
| [Rules](#rules) | **Must** check for running build processes before starting a new build |
| [Auto-Imports](#auto-imports-srctypes) | **Do NOT** manually export/import from `src/types/` — handled by `unplugin-auto-import` |
| [Code Quality](#code-quality--bun-run-check) | Fix ALL Biome warnings (`noExplicitAny`, `noUnusedVariables`, etc.) |
| [Code Quality > Exceptions](#exceptions) | Files to skip when fixing warnings (e.g. `use-custom-form.ts`, `http.ts`) |
| [Build Verification](#build-verification) | **Must** run `bun run build` after every change and fix errors |
| [Implementation Patterns](#implementation-patterns--adding-a-new-module) | Step-by-step guide for adding a new module (schema → service → types → actions → routes) |
| [Key Infrastructure Files](#key-infrastructure-files-dont-re-read-these-patterns-are-stable) | Stable files — don't re-read, patterns won't change |

## Code Knowledge Graph

This project has a **code-review-graph** knowledge graph at `.code-review-graph/graph.db`. Use it instead of scanning the whole codebase:

- **Before exploring code**, query the graph (`query_graph_tool`, `semantic_search_nodes_tool`, `get_review_context_tool`) to find relevant files, functions, and their relationships.
- **After every code change**, run `build_or_update_graph_tool` (incremental) with `repo_root` set to this project's directory to keep the graph in sync.
- **For code reviews**, use `get_impact_radius_tool` to understand blast radius of changes instead of manually tracing imports/calls.
- **To find large/complex functions**, use `find_large_functions_tool` instead of grepping the codebase.

This saves significant time and tokens compared to re-reading files to understand the codebase structure.

## Auto-Imports (`src/types/`)

**Do NOT manually `import` from `@/types/` in consuming files.** The project uses `unplugin-auto-import` (configured in `vite.config.ts` with `dirs: ["./src/types"]`), which makes all exports from `src/types/` available globally. Definitions in `src/types/` still need `export` — but consumers use them directly without an import statement.

## Code Quality — `bun run check`

**After writing or modifying code, fix ALL Biome warnings before considering the task done.** Run `bun run check` and resolve every warning. If a fix is ambiguous or would require a significant refactor, ask the user before proceeding.

### Warning rules and how to fix them

| Rule | Fix | Example |
|------|-----|---------|
| `noExplicitAny` | **Never use `any`.** Use the real type, a generic, `unknown`, or infer from Drizzle/Zod. If the type is truly unknowable, use `unknown` and narrow with a type guard. | `Record<string, unknown>` instead of `Record<string, any>` |
| `noUnusedVariables` | Remove the variable, or prefix with `_` only if destructuring requires it. | `const { used, _unused } = obj` |
| `noUnusedFunctionParameters` | Remove the parameter if possible. If the signature is required (callback/middleware), prefix with `_`. | `(_req, res) => ...` |
| `noArrayIndexKey` | Use a stable unique identifier as the React key (e.g. `item.id`). | `key={item.id}` instead of `key={index}` |
| `noNonNullAssertion` | Replace `!` with a null check, optional chaining, or an early return/throw. | `if (!val) return; val.prop` instead of `val!.prop` |
| `useButtonType` | Always add `type="button"` or `type="submit"` to `<button>`. | `<button type="button">` |
| `useAltText` | Add meaningful `alt` text to `<img>`. Use `alt=""` only for decorative images. | `<img alt="User avatar" />` |
| `noRedundantAlt` | Don't include "image", "photo", "picture" in `alt` text. | `alt="Dashboard chart"` not `alt="Image of dashboard chart"` |
| `useValidAnchor` | `<a>` must have `href`. If it's a button, use `<button>` instead. | Replace `<a onClick={...}>` with `<button>` |
| `noSvgWithoutTitle` | Add `<title>` inside `<svg>`, or `aria-hidden="true"` if decorative. | `<svg aria-hidden="true">` |
| `noStaticElementInteractions` | If a `<div>`/`<span>` has `onClick`, add `role` + keyboard handler, or use `<button>`. | Replace `<div onClick>` with `<button>` |

### Exceptions

These files will report Biome warnings but **must not be modified** to fix them:

- `src/hooks/use-custom-form.ts` — custom form hook with intentional API shape; ignore its warnings
- `src/lib/http.ts` — `response()` uses `Record<string, any>` intentionally because API routes return varying data shapes; do not change its signature

## Rules

### Code Comments

**Do NOT add unnecessary comments to code.** Remove comments that merely restate what the code does (e.g., `// increment counter`, `// return result`). Only add comments when:
- You are documenting a workaround for a bug or loop you ran into during implementation
- You are explaining a non-obvious solution to a problem that was solved after investigation
- The logic is genuinely subtle and would confuse a reader without context

When editing existing code, remove any unnecessary comments you encounter in the lines you touch.

### Build Safety

**BEFORE running `bun run build`, check for conflicts:**
1. Run `pgrep -f 'bun run build'` — if a build process is already running, **DO NOT** run another build. Notify the user that a build is already in progress.

## Build Verification

**After completing any code change, run `bun run build` to verify the project compiles successfully.** This is mandatory — do not consider a task done until the build passes.

If the build fails:
1. Read the error output carefully — it contains the file path, line number, and error message.
2. Fix the reported errors (type errors, missing imports, syntax issues, etc.).
3. Run `bun run build` again to confirm the fix.
4. Repeat until the build succeeds with no errors.

If a build error is unrelated to your changes (pre-existing), inform the user and ask whether to fix it or skip.

## Implementation Patterns — Adding a New Module

When implementing a new module (e.g. a new entity like "schools"), follow the layers below **in order**. Use the referenced canonical files as your template — read the specific file, replicate its pattern, don't re-explore the codebase.

### Step 1: DB Schema (`src/database/schema.ts`)

Add the table + relations at the bottom of `schema.ts`. Follow `quizzes` table as reference.

```
table definition → uses `serial().primaryKey()`, `...timestamps`, appropriate column types
relations        → defined with `relations()` helper, placed after all table definitions
```

Then run `bun run db:migrate` to generate and push migrations.

### Step 2: Service Layer (`src/services/<module>.ts`)

Create a new service file. Follow `src/services/quizzes.ts` as reference.

```
every function → returns Effect.gen(function* () { ... })
db access      → const { db } = yield* Db
db calls       → wrapped in dbTryPromise({ try: () => ..., catch: (err) => new DatabaseError(...) })
not found      → yield* Effect.fail(new NotFoundError({ id, entity: "EntityName" }))
```

Standard CRUD functions: `fetchAll*`, `fetch*ById`, `create*`, `patch*`, `delete*`.

### Step 3: Zod Schemas (`src/types/`)

- **CMS form schemas** → `src/types/zod.ts` (camelCase fields, Indonesian error messages)
- **API request schemas** → `src/types/zod.api.ts` (snake_case fields for mobile consumption)
- **TypeScript types** → `src/types/types.ts` (if needed beyond Drizzle inference)

Follow existing schemas in each file as reference.

### Step 4: Actions (`src/actions/<module>.ts`)

Create server functions for CMS pages. Follow `src/actions/quizzes.ts` as reference.

```typescript
export const addEntity = createServerFn({ method: "POST" })
  .inputValidator(entitySchema)       // Zod schema from step 3export
  .handler(async ({ data }) => {
    return Effect.runPromise(
      createEntity(data).pipe(        // Service from step 2
        Effect.provide(DbLayer),
        Effect.catchAll((err) => {
          console.error("Failed to create entity. ERR:", err);
          return Effect.succeed(null); // null = error signal to caller
        }),
      ),
    );
  });
```

### Step 5a: API Routes (`src/routes/api/(internal)/<module>/`)

For routes consumed by the mobile app. Follow `src/routes/api/(internal)/chapters/index.ts` (GET list) and `src/routes/api/(internal)/quiz/verify.ts` (POST with body) as reference.

```
middleware      → inherits [apiKeyMiddleware, loggerMiddleware] from parent route.ts
                  add authMiddleware per-route if needed
body parsing    → const data = yield* parseBody(zodSchema, body)  (from src/lib/http.ts)
response        → return response({ message, data }, HttpStatus.OK)
error handling  → Effect.catchTags({ ValidationError, NotFoundError, DatabaseError })
                  then Effect.catchAll for unexpected errors
params          → Number(params.id) for route params
query           → new URL(request.url).searchParams for query params
```

### Step 5b: CMS Pages (`src/routes/(web)/<module>/`)

For admin UI pages. Follow `src/routes/(web)/quiz/` directory as the canonical module:

```
index.tsx       → list page: loader prefetches with queryClient, useSuspenseQuery for data
add.tsx         → create form: useCustomForm + action call + flashState + navigate
edit.$id.tsx    → edit form: same as add but loads existing data into defaultValues
$id.tsx         → detail page: loader fetches by ID, displays read-only data
-sections/      → route-specific components (form, list, header) — NOT routes
```

**Data flow in pages:**
```
loader          → queryClient.prefetchQuery({ queryKey: [QUERY_KEYS.X], queryFn })
component       → useSuspenseQuery({ queryKey: [QUERY_KEYS.X], queryFn })
mutation        → call action → invalidateQueries → navigate → setFlashState
```

### Step 6: Register in Constants (`src/lib/constant.ts`)

- Add `QUERY_KEYS.<MODULE>` for React Query cache keys
- Add sidebar entry to `sidebarItems` array (title, url, lucide-react icon)

### Layer Connection Summary

```
CMS Page → action (createServerFn) → service (Effect.gen) → db (Drizzle) → schema
API Route → parseBody + service (Effect.gen) → db (Drizzle) → schema
                ↑ middleware: apiKey + logger (+ auth if needed)
```

## Gotchas

- **Don't add `authMiddleware` to public-facing API endpoints.** If an endpoint doesn't need the user's session/context (e.g. `/api/schools` is called during registration before login), only rely on the parent route's `apiKeyMiddleware`. Adding `authMiddleware` to these endpoints causes 401 responses, which triggers the mobile app's global session-expiration handler and kicks the user back to the login screen.

### Key Infrastructure Files (don't re-read these, patterns are stable)

| File | Purpose |
|------|---------|
| `src/lib/http.ts` | `HttpStatus`, `parseBody()`, `response()` |
| `src/lib/db.ts` | Drizzle pool setup, `Db` Effect context tag, `DbLayer` |
| `src/lib/retry.ts` | `dbTryPromise()` — wraps DB calls with retry + error typing |
| `src/services/errors/errors.ts` | `DatabaseError`, `NotFoundError`, `ValidationError`, `AuthError` |
| `src/lib/constant.ts` | `QUERY_KEYS`, `sidebarItems` |
| `src/middlewares/` | `apiKeyMiddleware`, `authMiddleware`, `loggerMiddleware` |
| `src/routes/api/(internal)/route.ts` | Parent route applying middleware to all internal API routes |
