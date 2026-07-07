# Next.js App Router Reference

Quick reference for Next.js 16 App Router patterns, caching, and common mistakes.

---

## Critical Mental Model

**Everything is a Server Component by default.** Only add `"use client"` when you need interactivity.

```
Server Component (default) → Can fetch data, access DB, use secrets
Client Component ("use client") → Can use useState, onClick, browser APIs
```

---

## Decision Trees

### When to Use What

```
Need useState, useEffect, onClick, browser APIs?
  YES → "use client"
   NO ↓

Need direct DB access or secrets?
  YES → Server Component (default)
   NO ↓

Is it a form submission or mutation?
  YES → Server Action ("use server")
   NO ↓

Is it an external API endpoint (webhook, mobile app)?
  YES → Route Handler
   NO → Server Component (default)
```

### Caching Decision

```
Is the data static/rarely changes?
  YES → cache: 'force-cache' or 'use cache' directive
   NO ↓

Does it need periodic refresh?
  YES → revalidate: <seconds>
   NO ↓

Is it user-specific or always fresh?
  YES → No caching (default in Next.js 16)
```

---

## Server Components (Default)

```tsx
// No directive needed - this is a Server Component
export default async function Page() {
  // Direct DB access
  const posts = await db.posts.findMany();

  // Or fetch with caching
  const data = await fetch("https://api.example.com/data", {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  return (
    <div>
      {posts.map((p) => (
        <div key={p.id}>{p.title}</div>
      ))}
    </div>
  );
}
```

**Can do:**

- `async/await` directly in component
- Access database, secrets, environment variables
- Import large dependencies (not shipped to client)

**Cannot do:**

- useState, useEffect, useContext
- onClick, onChange, event handlers
- Browser APIs (localStorage, window)

---

## Client Components

```tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>;
}
```

**MUST use when you need:**

- React hooks (useState, useEffect, useContext)
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)

---

## Server Actions

```tsx
// actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function createPost(formData: FormData) {
  const post = await db.posts.create({
    data: {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
    },
  });

  revalidatePath("/posts"); // Revalidate specific path
  // OR
  revalidateTag("posts"); // Revalidate all fetches with this tag

  return post;
}
```

**Usage in Client Component:**

```tsx
"use client";

import { useActionState } from "react";
import { createPost } from "./actions";

export function PostForm() {
  const [state, formAction, pending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <input name="title" required />
      <textarea name="content" required />
      <button disabled={pending}>
        {pending ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
```

---

## Caching

### Next.js 16: Caching is Opt-In

In Next.js 16, **nothing is cached by default**. You must explicitly opt in.

### Fetch-Level Caching

```tsx
// No caching (default in v16)
const res = await fetch("https://api.example.com/data");

// Cache indefinitely
const res = await fetch("https://api.example.com/data", {
  cache: "force-cache",
});

// Cache for 1 hour, then revalidate in background
const res = await fetch("https://api.example.com/data", {
  next: { revalidate: 3600 },
});

// Tag for on-demand revalidation
const res = await fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
});
```

### Component-Level Caching (v16)

```tsx
"use cache";

export default async function CachedPage() {
  const data = await getExpensiveData();
  return <div>{data}</div>;
}
```

### On-Demand Revalidation

| Method                               | Scope                | Use Case            |
| ------------------------------------ | -------------------- | ------------------- |
| `revalidatePath('/posts')`           | Specific route       | One page changed    |
| `revalidatePath('/posts', 'layout')` | Route + children     | Section changed     |
| `revalidateTag('posts')`             | All fetches with tag | Shared data changed |

```tsx
"use server";

export async function updatePost(id: string, data: any) {
  await db.posts.update({ where: { id }, data });

  // Option 1: Revalidate specific path
  revalidatePath(`/posts/${id}`);

  // Option 2: Revalidate by tag (preferred for shared data)
  revalidateTag("posts");
}
```

---

## Composition Patterns

### Pass Server Components as Children

```tsx
// page.tsx (Server Component)
import { ClientModal } from "./modal";
import { ServerContent } from "./content";

export default function Page() {
  return (
    <ClientModal>
      <ServerContent /> {/* Server Component passed as child */}
    </ClientModal>
  );
}

// modal.tsx (Client Component)
("use client");

export function ClientModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && children}
    </div>
  );
}

// content.tsx (Server Component)
export async function ServerContent() {
  const data = await db.getData(); // Fetches on server
  return <div>{data}</div>;
}
```

### Keep Client Islands Small

```tsx
// WRONG: Entire layout is client-side
"use client";
export default function Layout({ children }) {
  return <div>{children}</div>; // Ships JS for everything
}

// CORRECT: Only interactive parts are client
export default function Layout({ children }) {
  return (
    <div>
      {children}
      <InteractiveNav /> {/* Only this is 'use client' */}
    </div>
  );
}
```

---

## Route Handlers

**Use for:** External APIs, webhooks, mobile apps.

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const posts = await db.posts.findMany();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const post = await db.posts.create({ data });
  return NextResponse.json(post, { status: 201 });
}
```

**Don't use for:** Internal data fetching (use Server Components instead).

---

## Proxy (formerly Middleware)

Next.js 16 renamed `middleware.ts` to `proxy.ts`. It lives at the project root (or `src/`, beside `app/` — never inside `app/`).

```tsx
// proxy.ts (project root, or src/proxy.ts — beside app/)
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Auth check
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("auth");
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

---

## Anti-Patterns

### NEVER: Fetch client-side with useEffect

```tsx
// WRONG: Breaks streaming, creates waterfall
"use client";
export default function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then(setPosts);
  }, []);

  return (
    <div>
      {posts.map((p) => (
        <div>{p.title}</div>
      ))}
    </div>
  );
}

// CORRECT: Use Server Component
export default async function Posts() {
  const posts = await db.posts.findMany();
  return (
    <div>
      {posts.map((p) => (
        <div key={p.id}>{p.title}</div>
      ))}
    </div>
  );
}
```

### NEVER: Wrap layout in "use client"

```tsx
// WRONG: Ships JS for entire app
"use client";
export default function Layout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

// CORRECT: Keep layout as Server Component
export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ClientOnlyModal />
      </body>
    </html>
  );
}
```

### NEVER: Forget to revalidate after mutations

```tsx
// WRONG: UI shows stale data
"use server";
export async function createPost(data: any) {
  await db.posts.create({ data });
  // Missing revalidation!
}

// CORRECT
("use server");
export async function createPost(data: any) {
  await db.posts.create({ data });
  revalidatePath("/posts");
}
```

### NEVER: Use browser APIs without hydration check

```tsx
// WRONG: Errors during SSR
"use client";
export default function Theme() {
  const theme = localStorage.getItem("theme"); // SSR error!
  return <div>{theme}</div>;
}

// CORRECT: Check after mount
("use client");
export default function Theme() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(localStorage.getItem("theme") || "light");
  }, []);

  return <div>{theme}</div>;
}
```

### NEVER: Create unnecessary Route Handlers for internal data

```tsx
// WRONG: Extra network hop
'use client'
export default function Users() {
  useEffect(() => {
    fetch('/api/users').then(...)  // Client → Server → API → DB
  }, [])
}

// CORRECT: Direct DB access in Server Component
export default async function Users() {
  const users = await db.users.findMany()  // Server → DB
  return <UserList users={users} />
}
```

### NEVER: Over-fragment into tiny client islands

```tsx
// WRONG: 100+ tiny client components
<Button1 />  {/* 'use client' */}
<Button2 />  {/* 'use client' */}
<Button3 />  {/* 'use client' */}

// CORRECT: Group related interactivity
'use client'
function InteractiveToolbar() {
  return (
    <div>
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  )
}
```

---

## Parallel Data Fetching

```tsx
// Sequential (waterfall) - AVOID when possible
const user = await getUser(id);
const posts = await getPosts(user.id); // Waits for user

// Parallel - PREFERRED
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

---

## Quick Reference

### File Conventions

| File            | Purpose                                     |
| --------------- | ------------------------------------------- |
| `page.tsx`      | Route UI                                    |
| `layout.tsx`    | Shared layout (persists across navigations) |
| `loading.tsx`   | Loading UI (Suspense boundary)              |
| `error.tsx`     | Error UI (Error boundary)                   |
| `not-found.tsx` | 404 UI                                      |
| `route.ts`      | API endpoint                                |
| `proxy.ts`      | Request interception (auth, redirects)      |

### State Management Decision

| Need                   | Solution                       |
| ---------------------- | ------------------------------ |
| Server data display    | Server Component with fetch    |
| User input/interaction | Client Component with useState |
| Form submission        | Server Action                  |
| Shared client state    | Context in Client Component    |
| URL state              | useSearchParams                |
