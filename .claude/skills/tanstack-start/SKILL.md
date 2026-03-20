---
name: tanstack-start
description: TanStack Start (React metaframework) patterns for file-based routing, server functions, middleware, loaders, and API routes. Use when writing or modifying routes, pages, actions, or middleware.
user-invocable: false
---

# TanStack Start Reference

TanStack Start is a full-stack React metaframework built on TanStack Router + Nitro. It uses file-based routing, server functions, and middleware.

## File-Based Routing

Routes live in `src/routes/`. File path = URL path.

```
src/routes/
├── __root.tsx              → Root layout (wraps everything)
├── (web)/                  → Route group (no URL segment)
│   ├── route.tsx           → Layout for all (web) children
│   ├── dashboard.tsx       → /dashboard
│   ├── quiz/
│   │   ├── index.tsx       → /quiz
│   │   ├── add.tsx         → /quiz/add
│   │   ├── $id.tsx         → /quiz/:id (dynamic param)
│   │   ├── edit.$id.tsx    → /quiz/edit/:id
│   │   └── -sections/      → NOT a route (- prefix = ignored)
│   │       ├── quiz-form.tsx
│   │       └── quiz-list.tsx
├── api/
│   ├── (internal)/         → Route group with middleware
│   │   ├── route.ts        → Parent applying apiKey + logger middleware
│   │   ├── chapters/
│   │   │   ├── index.ts    → GET /api/chapters
│   │   │   └── $id.ts      → GET /api/chapters/:id
│   │   └── quiz/
│   │       └── verify.ts   → POST /api/quiz/verify
│   └── (public)/           → No middleware
```

### Key conventions
- `(groupName)/` — Route group: applies layout/middleware but no URL segment
- `-folderName/` — Ignored by router: for co-located components
- `$param` — Dynamic route parameter
- `index.tsx` — Index route for parent path
- `route.tsx` — Layout route (wraps children, provides shared UI/middleware)

## createFileRoute — Route Definition

Every route file exports a `Route` using `createFileRoute`:

### Page Route (with loader + component)

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/(web)/quiz/")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.QUIZZES],
      queryFn: () => getAllQuizzes(),
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery({
    queryKey: [QUERY_KEYS.QUIZZES],
    queryFn: () => getAllQuizzes(),
  });
  return <div>{/* render data */}</div>;
}
```

### Detail Route (with params)

```typescript
export const Route = createFileRoute("/(web)/quiz/$id")({
  loader: async ({ context, params }) => {
    const id = Number(params.id);
    await context.queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.QUIZZES, id],
      queryFn: () => getQuizById({ data: id }),
    });
  },
  component: DetailComponent,
});
```

### Layout Route (wraps children)

```typescript
export const Route = createFileRoute("/(web)")({
  beforeLoad: async ({ context }) => {
    // auth check, redirect, etc.
  },
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <SidebarLayout>
      <Outlet /> {/* child routes render here */}
    </SidebarLayout>
  );
}
```

## API Routes — Server Handlers

API routes use `server.handlers` to define HTTP method handlers:

### GET Handler

```typescript
export const Route = createFileRoute("/api/(internal)/chapters/")({
  server: {
    middleware: [apiKeyMiddleware, loggerMiddleware],
    handlers: {
      GET: async () =>
        Effect.runPromise(
          Effect.gen(function* () {
            const data = yield* fetchAllChapters;
            return response({ message: "OK", data }, HttpStatus.OK);
          }).pipe(
            Effect.provide(DbLayer),
            Effect.catchAll((err) =>
              Effect.succeed(response({ message: "Error" }, HttpStatus.INTERNAL_SERVER_ERROR)),
            ),
          ),
        ),
    },
  },
});
```

### POST Handler (with body parsing)

```typescript
export const Route = createFileRoute("/api/(internal)/quiz/verify")({
  server: {
    middleware: [apiKeyMiddleware, loggerMiddleware],
    handlers: {
      POST: async ({ request }) =>
        Effect.runPromise(
          Effect.gen(function* () {
            const body = yield* Effect.tryPromise(() => request.json());
            const data = yield* parseBody(verifyAnswerSchema, body);
            const result = yield* serviceFunction(data.field1, data.field2);
            return response({ message: "OK", data: result }, HttpStatus.OK);
          }).pipe(
            Effect.provide(DbLayer),
            Effect.catchTags({
              ValidationError: (err) =>
                Effect.succeed(response({ message: "Validation failed", error: err.errors }, HttpStatus.BAD_REQUEST)),
              NotFoundError: (err) =>
                Effect.succeed(response({ message: `${err.entity} not found` }, HttpStatus.NOT_FOUND)),
              DatabaseError: (err) =>
                Effect.succeed(response({ message: "Database error" }, HttpStatus.INTERNAL_SERVER_ERROR)),
            }),
            Effect.catchAll((err) =>
              Effect.succeed(response({ message: "Internal error" }, HttpStatus.INTERNAL_SERVER_ERROR)),
            ),
          ),
        ),
    },
  },
});
```

### Route with Params

```typescript
export const Route = createFileRoute("/api/(internal)/chapters/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = Number(params.id);
        // ...
      },
    },
  },
});
```

### Query Parameters

```typescript
GET: async ({ request }) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  // ...
},
```

## Middleware — createMiddleware

### Defining Middleware

```typescript
import { createMiddleware } from "@tanstack/react-start";

export const apiKeyMiddleware = createMiddleware().server(
  async ({ request, next }) => {
    const providedKey = request.headers.get("x-api-key") ?? "";
    if (!timingSafeEqual(Buffer.from(providedKey), Buffer.from(env.API_KEY))) {
      throw json({ message: "Unauthorized" }, { status: 401 });
    }
    return next();
  },
);
```

### Middleware with Context Injection

```typescript
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (session === null) {
    return response({ message: "Unauthorized" }, HttpStatus.UNAUTHORIZED);
  }
  return await next({
    context: {
      user: session.user,      // available as context.user in downstream handlers
      session: session.session,
    },
  });
});
```

### Applying Middleware

**Per-route**: in the route's `server.middleware` array.

**Parent route** (applies to all children):

```typescript
// src/routes/api/(internal)/route.ts
export const Route = createFileRoute("/api/(internal)")({
  server: {
    middleware: [apiKeyMiddleware, loggerMiddleware],
  },
});
```

## Server Functions — createServerFn

Server functions are RPC-style calls from client to server. Used in CMS pages for mutations.

```typescript
import { createServerFn } from "@tanstack/react-start";

// GET (no input)
export const getAllQuizzes = createServerFn({ method: "GET" }).handler(async () => {
  return Effect.runPromise(
    fetchAllQuizzes.pipe(
      Effect.provide(DbLayer),
      Effect.catchAll((err) => {
        console.error("Failed to get quizzes. ERR:", err);
        return Effect.succeed([]);
      }),
    ),
  );
});

// POST (with input validation)
export const addQuiz = createServerFn({ method: "POST" })
  .inputValidator(quizSchema)
  .handler(async ({ data }) => {
    return Effect.runPromise(
      createQuiz(data).pipe(
        Effect.provide(DbLayer),
        Effect.catchAll((err) => {
          console.error("Failed to create quiz. ERR:", err);
          return Effect.succeed(null);
        }),
      ),
    );
  });

// With route params
export const getQuizById = createServerFn({ method: "GET" })
  .inputValidator(z.number())
  .handler(async ({ data: id }) => {
    return Effect.runPromise(
      fetchQuizById(id).pipe(
        Effect.provide(DbLayer),
        Effect.catchAll((err) => {
          console.error("Failed to get quiz. ERR:", err);
          return Effect.succeed(null);
        }),
      ),
    );
  });
```

### Calling Server Functions from Components

```typescript
// In loader (prefetch)
loader: async ({ context }) => {
  await context.queryClient.prefetchQuery({
    queryKey: [QUERY_KEYS.QUIZZES],
    queryFn: () => getAllQuizzes(),
  });
},

// In component (via React Query)
const { data } = useSuspenseQuery({
  queryKey: [QUERY_KEYS.QUIZZES],
  queryFn: () => getAllQuizzes(),
});

// Direct call (mutations)
const result = await addQuiz({ data: formValues });
```

## Navigation

```typescript
import { useNavigate, Link } from "@tanstack/react-router";

// Programmatic
const navigate = useNavigate();
navigate({ to: "/quiz/$id", params: { id: "123" } });
navigate({ to: "/quiz" });

// Declarative
<Link to="/quiz/$id" params={{ id: quiz.id.toString() }}>View</Link>
```

## Route Configuration Options

```typescript
createFileRoute("/path")({
  // Server-side
  server: {
    middleware: [middleware1, middleware2],
    handlers: { GET, POST, PUT, DELETE },
  },

  // Client-side
  beforeLoad: async ({ context, params }) => { /* auth, redirects */ },
  loader: async ({ context, params }) => { /* data prefetching */ },
  component: MyComponent,
  errorComponent: ErrorBoundary,
  pendingComponent: LoadingSpinner,
});
```
