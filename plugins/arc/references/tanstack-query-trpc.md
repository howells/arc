# TanStack Query + tRPC Reference

Quick reference for TanStack Query v5 with tRPC integration using queryOptions/mutationOptions patterns.

---

## Critical Rule: Always Use queryOptions/mutationOptions

**MUST** use `queryOptions` and `mutationOptions` factories instead of inline configs. This is THE recommended v5 pattern.

## Audit Red Flags

- MUST NOT: Call queries from `useEffect` when a query hook, prefetch, loader, or Server Component should own the fetch.
- MUST NOT: Use `useQuery` for mutations. Use `useMutation` and invalidate/update affected queries.
- MUST: Query functions return useful data. A `void` query function usually means cache state is meaningless.
- MUST: Mutations that affect cached list/detail data either invalidate, update cache, or document why no cached view can be stale.
- MUST: `QueryClient` identity is stable across renders. In client providers, initialize it with lazy `useState` or an equivalent stable factory.
- SHOULD: Avoid rest destructuring query results when it disables tracked-property optimizations.
- SHOULD: Use generated tRPC query keys/options rather than hand-written string keys for invalidation.

```tsx
// WRONG: Inline config (duplicated, error-prone)
useQuery({
  queryKey: ["users", id],
  queryFn: () => fetchUser(id),
});

// CORRECT: queryOptions factory
const userOptions = (id: string) =>
  queryOptions({
    queryKey: ["users", id],
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000,
  });

// Reusable everywhere with full type safety
useQuery(userOptions(id));
useSuspenseQuery(userOptions(id));
queryClient.prefetchQuery(userOptions(id));
queryClient.invalidateQueries({ queryKey: userOptions(id).queryKey });
```

---

## Setup

### Installation

```bash
npm install @tanstack/react-query @trpc/client @trpc/server @trpc/tanstack-react-query
```

### Provider Setup

```tsx
// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import type { AppRouter } from "@/server/routers";

export const trpc = createTRPCReact<AppRouter>();

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

---

## queryOptions Pattern

### Basic Usage

```tsx
import { queryOptions, useQuery } from "@tanstack/react-query";

// Define once, use everywhere
function userQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["users", id],
    queryFn: () => api.getUser(id),
    staleTime: 5 * 60 * 1000,
  });
}

// In components
function UserProfile({ id }: { id: string }) {
  const { data, isLoading, error } = useQuery(userQueryOptions(id));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{data.name}</div>;
}
```

### With tRPC

```tsx
// tRPC generates queryOptions automatically
const { data } = useQuery(trpc.user.getById.queryOptions({ id: "123" }));

// Or create custom wrappers
function userOptions(id: string) {
  return trpc.user.getById.queryOptions({ id });
}
```

### Usage Across the App

```tsx
const options = userQueryOptions("123");

// All use the same config
useQuery(options);
useSuspenseQuery(options);
queryClient.prefetchQuery(options);
queryClient.setQueryData(options.queryKey, newData);
queryClient.invalidateQueries({ queryKey: options.queryKey });
queryClient.getQueryData(options.queryKey);
```

---

## mutationOptions Pattern

### Basic Usage

```tsx
import {
  mutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

function updateUserOptions() {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: (data: { id: string; name: string }) =>
      api.updateUser(data.id, data),
    onSuccess: (newUser) => {
      // Update cache
      queryClient.setQueryData(["users", newUser.id], newUser);
      // Or invalidate
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Usage
function EditUser({ id }: { id: string }) {
  const mutation = useMutation(updateUserOptions());

  return (
    <button onClick={() => mutation.mutate({ id, name: "New Name" })}>
      {mutation.isPending ? "Saving..." : "Save"}
    </button>
  );
}
```

### With tRPC

```tsx
const mutation = useMutation(trpc.user.update.mutationOptions());

mutation.mutate({ id: "123", name: "New Name" });
```

---

## Optimistic Updates

### The Pattern

```tsx
const utils = trpc.useUtils();

const updateMutation = trpc.user.update.useMutation({
  onMutate: async (newData) => {
    // 1. Cancel outgoing refetches
    await utils.user.getById.cancel({ id: newData.id });

    // 2. Snapshot previous data
    const previousData = utils.user.getById.getData({ id: newData.id });

    // 3. Optimistically update cache
    utils.user.getById.setData({ id: newData.id }, (old) => ({
      ...old!,
      ...newData,
    }));

    // 4. Return context for rollback
    return { previousData };
  },

  onError: (err, newData, context) => {
    // Rollback on error
    if (context?.previousData) {
      utils.user.getById.setData({ id: newData.id }, context.previousData);
    }
  },

  onSettled: (data, error, variables) => {
    // Always refetch after mutation settles
    utils.user.getById.invalidate({ id: variables.id });
  },
});
```

### Callback Summary

| Callback    | When                      | Use For                          |
| ----------- | ------------------------- | -------------------------------- |
| `onMutate`  | Before mutation           | Optimistic update, save snapshot |
| `onSuccess` | Mutation succeeded        | Update cache, show success toast |
| `onError`   | Mutation failed           | Rollback, show error toast       |
| `onSettled` | Always (success or error) | Cleanup, refetch                 |

---

## Invalidation Patterns

### With tRPC Utils

```tsx
const utils = trpc.useUtils();

// Invalidate specific query
utils.user.getById.invalidate({ id: "123" });

// Invalidate all queries for a procedure
utils.user.getById.invalidate();

// Invalidate entire router namespace
utils.user.invalidate();
```

### With QueryClient

```tsx
const queryClient = useQueryClient();

// Invalidate by exact key
queryClient.invalidateQueries({ queryKey: ["users", "123"] });

// Invalidate by prefix
queryClient.invalidateQueries({ queryKey: ["users"] });

// Invalidate everything
queryClient.invalidateQueries();
```

### After Mutations

```tsx
const createMutation = trpc.post.create.useMutation({
  onSuccess: () => {
    // Invalidate list queries
    utils.post.list.invalidate();
    // Don't invalidate getById - new post doesn't exist there yet
  },
});

const updateMutation = trpc.post.update.useMutation({
  onSuccess: (newPost) => {
    // Update specific cache entry
    utils.post.getById.setData({ id: newPost.id }, newPost);
    // Invalidate list (order might have changed)
    utils.post.list.invalidate();
  },
});

const deleteMutation = trpc.post.delete.useMutation({
  onSuccess: (_, { id }) => {
    // Remove from cache
    utils.post.getById.setData({ id }, undefined);
    // Invalidate list
    utils.post.list.invalidate();
  },
});
```

---

## Prefetching

### On Hover (Client-Side)

```tsx
function PostList() {
  const queryClient = useQueryClient();
  const { data: posts } = useQuery(trpc.post.list.queryOptions());

  const handleMouseEnter = (id: string) => {
    // Prefetch post details on hover
    queryClient.prefetchQuery(trpc.post.getById.queryOptions({ id }));
  };

  return (
    <ul>
      {posts?.map((post) => (
        <li key={post.id} onMouseEnter={() => handleMouseEnter(post.id)}>
          <Link href={`/posts/${post.id}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

### On Server (Next.js)

```tsx
// app/posts/[id]/page.tsx
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createServerHelpers } from "@/server/trpc";

export default async function PostPage({ params }: { params: { id: string } }) {
  const helpers = await createServerHelpers();

  // Prefetch on server
  await helpers.post.getById.prefetch({ id: params.id });

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <PostContent id={params.id} />
    </HydrationBoundary>
  );
}
```

### Set Data Directly

```tsx
const utils = trpc.useUtils();

// If you already have data, skip the fetch
utils.user.getById.setData({ id: "123" }, userData);

// Subsequent useQuery will use cached data immediately
const { data } = useQuery(trpc.user.getById.queryOptions({ id: "123" }));
// No loading state!
```

---

## Type Inference

### Router Types

```tsx
import type { AppRouter } from "@/server/routers";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

// Use in your app
type CreatePostInput = RouterInputs["post"]["create"];
type Post = RouterOutputs["post"]["getById"];
```

### Select with Type Safety

```tsx
const { data } = useQuery({
  ...trpc.user.getById.queryOptions({ id: "123" }),
  select: (user) => ({
    displayName: `${user.firstName} ${user.lastName}`,
    email: user.email,
  }),
});

// data is typed as { displayName: string; email: string }
```

### Global Error Type

```tsx
// types/react-query.d.ts
import "@tanstack/react-query";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/routers";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: TRPCClientErrorLike<AppRouter>;
  }
}
```

---

## Error Handling

### Per-Query

```tsx
const { data, error, isError } = useQuery({
  ...trpc.user.getById.queryOptions({ id: "123" }),
  retry: (failureCount, error) => {
    // Don't retry on 404
    if (error.data?.code === "NOT_FOUND") return false;
    return failureCount < 3;
  },
});

if (isError) {
  return <div>Error: {error.message}</div>;
}
```

### Per-Mutation

```tsx
const mutation = useMutation({
  ...trpc.user.update.mutationOptions(),
  onError: (error) => {
    if (error.data?.code === "CONFLICT") {
      toast.error("User was modified by someone else");
    } else {
      toast.error(error.message);
    }
  },
});
```

### Error Boundary

```tsx
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <p>Error: {error.message}</p>
              <button onClick={resetErrorBoundary}>Retry</button>
            </div>
          )}
        >
          <MyComponent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

---

## Anti-Patterns

### NEVER: Inline query configs

```tsx
// WRONG: Duplicated config, typo-prone
useQuery({ queryKey: ["users", id], queryFn: () => fetchUser(id) });
// Later...
queryClient.invalidateQueries({ queryKey: ["user", id] }); // Typo!

// CORRECT: Single source of truth
const options = userQueryOptions(id);
useQuery(options);
queryClient.invalidateQueries({ queryKey: options.queryKey });
```

### NEVER: Forget to invalidate after mutations

```tsx
// WRONG: Stale data in UI
const mutation = useMutation({
  mutationFn: updateUser,
  // No onSuccess!
});

// CORRECT
const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

### NEVER: Over-invalidate

```tsx
// WRONG: Invalidates everything, wasteful
onSuccess: () => {
  queryClient.invalidateQueries(); // All queries!
};

// CORRECT: Targeted invalidation
onSuccess: (newUser) => {
  utils.user.getById.invalidate({ id: newUser.id });
  utils.user.list.invalidate();
};
```

### NEVER: Use stale query keys

```tsx
// WRONG: Key doesn't include variable
useQuery({
  queryKey: ["user"],
  queryFn: () => fetchUser(userId), // userId not in key!
});

// CORRECT: All variables in key
useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
});
```

### NEVER: Mutate cache directly

```tsx
// WRONG: Direct mutation
const cached = queryClient.getQueryData(["users", id]);
cached.name = "New Name"; // Mutates in place!

// CORRECT: Immutable update
queryClient.setQueryData(["users", id], (old) => ({
  ...old,
  name: "New Name",
}));
```

---

## Quick Reference

### Query States

| State        | Meaning                                |
| ------------ | -------------------------------------- |
| `isLoading`  | First fetch, no data yet               |
| `isFetching` | Any fetch in progress                  |
| `isStale`    | Data is stale, will refetch on trigger |
| `isError`    | Query errored                          |
| `isSuccess`  | Query succeeded                        |

### Common Options

```tsx
queryOptions({
  queryKey: ["users", id],
  queryFn: () => fetchUser(id),
  staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  retry: 3, // Retry failed queries 3 times
  refetchOnWindowFocus: true, // Refetch when window regains focus
  enabled: !!id, // Only run when id exists
});
```

### tRPC Utils Methods

```tsx
const utils = trpc.useUtils();

utils.user.getById.getData({ id }); // Get cached data
utils.user.getById.setData({ id }, data); // Set cached data
utils.user.getById.invalidate({ id }); // Invalidate query
utils.user.getById.cancel({ id }); // Cancel in-flight query
utils.user.getById.prefetch({ id }); // Prefetch query
```
