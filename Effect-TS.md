| Quirk                               | What it feels like in JS          | What’s *actually* happening                    | Why Effect does this                                  |
| ----------------------------------- | --------------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| **Nothing runs immediately**        | “Why didn’t my DB query execute?” | Effects are **descriptions**, not executions   | Makes side effects controllable, testable, replayable |
| **`Effect.gen(function* () {})`**   | Weird `async function`            | Generator used to model **sequential Effects** | Enables typed errors, cancellation, fibers            |
| **Always `yield*`, never `yield`**  | `yield` ≠ `await`                 | `yield*` runs an Effect and unwraps its value  | `yield` would emit raw values → invalid               |
| **`return` finishes the Effect**    | Like `return` in async            | Marks successful completion                    | Explicit success channel                              |
| **Errors are values**               | `throw` but typed                 | Failures live in the **error channel**         | Enables retries, recovery, pattern matching           |
| **`Effect.tryPromise` everywhere**  | “Why wrap Promises?”              | Promises are **impure**                        | Effect isolates side effects                          |
| **Context instead of parameters**   | DI without arguments              | Dependencies come from **environment**         | Enables swapping impls, testing                       |
| **`Context.Tag` isn’t a class**     | “Why is this a class?”            | It’s a **typed dependency key**                | TS limitation workaround                              |
| **Layers instead of constructors**  | No `new Service()`                | Layers **build & provide dependencies**        | Controlled lifecycle                                  |
| **No global singletons**            | `db.ts` import everywhere         | Globals break purity                           | Effect needs referential transparency                 |
| **Typed error channel**             | JS throws anything                | Errors are part of the type                    | Compile-time guarantees                               |
| **Fibers instead of threads**       | Async tasks                       | Lightweight, cancelable execution units        | Structured concurrency                                |
| **Retries are declarative**         | Try/catch loops                   | Policies applied to Effects                    | Composability                                         |
| **Logging is an Effect**            | `console.log()`                   | Logging is a side effect                       | Can be swapped, tested, disabled                      |
| **Tests don’t need mocks**          | Jest mocks                        | Swap Layers                                    | No runtime monkey-patching                            |
| **No `async/await` inside Effects** | Feels restrictive                 | Prevents uncontrolled effects                  | Determinism                                           |
