# Authentication Patterns Reference

Comprehensive auth patterns for Clerk, WorkOS, and provider-agnostic implementations. Load this when building or reviewing auth features.

<mental_model>

## Mental Model

Authentication has two planes:

**Server plane** — the source of truth. Middleware, Server Components, Server Actions, API routes. Auth checks here protect data. If this plane is wrong, you have a vulnerability.

**Client plane** — for UX only. `useAuth()`, `useUser()`, conditional rendering. Auth checks here improve experience (show/hide UI, redirect). If this plane is wrong, you have a bad UX, not a vulnerability.

**The rule:** Server plane gates data. Client plane gates UI. Never reverse this.

**Proxy/middleware vs data-layer auth:**

The proxy layer (Next.js `proxy.ts`, formerly `middleware.ts`) is a convenience — it redirects unauthenticated users before they hit the page. But it can be bypassed (direct API calls, revalidation, server actions called from other contexts). Always add auth checks at the data layer:

```typescript
// ✅ Data-layer auth — cannot be bypassed
export async function getProject(projectId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
  });
}

// ❌ Relying only on middleware — can be bypassed via server actions
// middleware.ts protects /dashboard, but getProject() trusts the caller
export async function getProject(projectId: string) {
  return db.query.projects.findFirst({
    where: eq(projects.id, projectId), // No userId check!
  });
}
```

</mental_model>

<clerk_patterns>

## Clerk Patterns

### Server Auth (App Router)

```typescript
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth(); // ← async in Next.js 15+
  if (!userId) redirect("/sign-in");

  const data = await getUserData(userId);
  return <Dashboard data={data} />;
}
```

Anti-pattern:

```typescript
// ❌ Forgetting await — auth() returns a Promise in Next.js 15+
const { userId } = auth(); // This is a Promise, not the auth object!
if (!userId) redirect("/sign-in"); // Never redirects — Promise is truthy
```

### Proxy Config (Middleware)

```typescript
// proxy.ts (formerly middleware.ts — renamed in Next.js 16; lives at project root or src/, beside app/)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)", // ← Webhooks MUST be public
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

Anti-pattern:

```typescript
// ❌ Blocking webhooks with auth middleware
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)"]);
// /api/webhooks is now protected — Clerk can't reach it!
```

### Server Actions with auth.protect()

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";

export async function deleteProject(projectId: string) {
  const { userId } = await auth.protect(); // Throws if not authenticated

  // Also verify ownership at data layer
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
  });

  if (!project) throw new Error("Not found");
  await db.delete(projects).where(eq(projects.id, projectId));
}
```

Anti-pattern:

```typescript
// ❌ Using auth() instead of auth.protect() in Server Actions
export async function deleteProject(projectId: string) {
  const { userId } = await auth(); // Returns null if not authed — doesn't throw
  // Continues execution with userId = null!
}
```

### Caching with Auth

```typescript
import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

// ✅ Include userId in cache key
export async function getCachedProjects() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return unstable_cache(
    () => db.query.projects.findMany({ where: eq(projects.userId, userId) }),
    [`projects-${userId}`], // ← userId in cache key
    { revalidate: 60, tags: [`user-${userId}`] }
  )();
}
```

Anti-pattern:

```typescript
// ❌ Missing userId in cache key — users see each other's data
return unstable_cache(
  () => db.query.projects.findMany({ where: eq(projects.userId, userId) }),
  ["projects"] // Shared cache key — first user's data served to everyone
)();
```

### Organizations & RBAC

```typescript
import { auth } from "@clerk/nextjs/server";

export async function updateOrgSettings(orgId: string, settings: OrgSettings) {
  const { userId, orgId: activeOrgId, orgRole } = await auth.protect();

  if (activeOrgId !== orgId) throw new Error("Wrong organization");
  if (orgRole !== "org:admin") throw new Error("Admin access required");

  await db
    .update(organizations)
    .set(settings)
    .where(eq(organizations.id, orgId));
}
```

### Webhook Handling

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error("Missing CLERK_WEBHOOK_SECRET");

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (evt.type) {
    case "user.created":
      await db.insert(users).values({
        id: evt.data.id,
        email: evt.data.email_addresses[0]?.email_address,
      });
      break;
    case "user.updated":
      await db
        .update(users)
        .set({ email: evt.data.email_addresses[0]?.email_address })
        .where(eq(users.id, evt.data.id));
      break;
    case "user.deleted":
      await db.delete(users).where(eq(users.id, evt.data.id!));
      break;
  }

  return new Response("OK", { status: 200 });
}
```

### Testing with Clerk

```typescript
// playwright.config.ts — use Clerk testing tokens
import { clerkSetup } from "@clerk/testing/playwright";

export default defineConfig({
  globalSetup: clerkSetup,
});

// tests/auth.spec.ts
import { setupClerkTestingToken } from "@clerk/testing/playwright";

test("authenticated flow", async ({ page }) => {
  await setupClerkTestingToken({ page });

  await page.goto("/dashboard");
  await expect(page.getByText("Welcome")).toBeVisible();
});
```

</clerk_patterns>

<workos_patterns>

## WorkOS AuthKit Patterns

### Next.js Setup

```typescript
// app/layout.tsx
import { AuthKitProvider } from "@workos-inc/authkit-nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthKitProvider>{children}</AuthKitProvider>
      </body>
    </html>
  );
}
```

Anti-pattern:

```typescript
// ❌ Missing AuthKitProvider — auth silently fails, no error thrown
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body>{children}</body></html>;
}
```

### Proxy (Middleware)

```typescript
// proxy.ts (formerly middleware.ts)
import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
```

Anti-pattern:

```typescript
// ❌ No proxy/middleware — auth state never populated, fails silently
// (Just forgetting to create proxy.ts)
```

### Page Protection

```typescript
// app/dashboard/page.tsx
import { withAuth } from "@workos-inc/authkit-nextjs";

export default async function DashboardPage() {
  const { user } = await withAuth({ ensureSignedIn: true });

  return <Dashboard user={user} />;
}
```

Anti-pattern:

```typescript
// ❌ Forgetting ensureSignedIn — returns null user instead of redirecting
const { user } = await withAuth(); // user can be null!
return <Dashboard user={user} />; // Crashes on user.name
```

### React SPA (Vite)

```typescript
// src/main.tsx
import { AuthKitProvider } from "@workos-inc/authkit-react";

createRoot(document.getElementById("root")!).render(
  <AuthKitProvider
    clientId={import.meta.env.VITE_WORKOS_CLIENT_ID}
    apiHostname="api.workos.com"
    redirectUri={import.meta.env.VITE_WORKOS_REDIRECT_URI}
  >
    <App />
  </AuthKitProvider>
);
```

### Environment Variables

```bash
# .env.local
WORKOS_CLIENT_ID=client_...
WORKOS_API_KEY=sk_...
WORKOS_REDIRECT_URI=http://localhost:3000/callback
WORKOS_COOKIE_PASSWORD=must-be-at-least-32-characters-long  # ← 32+ chars required!

# For client-side access (provider-specific prefix):
NEXT_PUBLIC_WORKOS_CLIENT_ID=client_...  # Next.js
VITE_WORKOS_CLIENT_ID=client_...          # Vite
REACT_APP_WORKOS_CLIENT_ID=client_...     # CRA
```

### Common Gotcha: Async Client

```typescript
// ✅ Correct — await the client
import { WorkOS } from "@workos-inc/node";
const workos = await createClient();

// ❌ Missing await — workos is a Promise, method calls fail silently
const workos = createClient();
await workos.users.getUser(userId); // TypeError: workos.users is undefined
```

</workos_patterns>

<provider_agnostic>

## Provider-Agnostic Patterns

### Server Component Auth Pattern

```typescript
// lib/auth.ts — unified auth helper
export async function requireAuth(): Promise<{ userId: string }> {
  // Clerk
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const { userId } = await auth();
    if (!userId) throw new AuthError("Unauthorized");
    return { userId };
  }

  // WorkOS
  if (process.env.WORKOS_CLIENT_ID) {
    const { user } = await withAuth({ ensureSignedIn: true });
    return { userId: user.id };
  }

  throw new Error("No auth provider configured");
}
```

### Middleware Pattern

Regardless of provider, auth middleware should:

1. Run on all routes except static assets
2. Allow public routes (marketing, auth pages, webhooks)
3. Redirect unauthenticated users on protected routes
4. Set auth context for downstream use

Note: Next.js 16 renamed `middleware.ts` to `proxy.ts`. The file lives at the project root (or `src/`, beside `app/` — never inside `app/`). Clerk and WorkOS SDKs still export middleware-named functions — the file name changes but the API calls don't.

### Session Architecture

```
Request → Middleware (sets auth context)
  → Server Component (reads auth, fetches data)
    → Client Component (uses auth for UI only)
```

Never reverse this flow. Client components should not determine what data a Server Component fetches.

### RBAC at Data Layer

```typescript
// ✅ Authorization check at query level
export async function getTeamMembers(teamId: string) {
  const { userId } = await requireAuth();

  // Verify user belongs to team before returning members
  const membership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
  });
  if (!membership) throw new AuthError("Forbidden", 403);

  return db.query.teamMembers.findMany({
    where: eq(teamMembers.teamId, teamId),
  });
}

// ❌ Route-level only — any authenticated user sees any team
export async function getTeamMembers(teamId: string) {
  await requireAuth(); // Only checks "is logged in"
  return db.query.teamMembers.findMany({
    where: eq(teamMembers.teamId, teamId),
  });
}
```

### Multi-Tenant Data Isolation

```typescript
// ✅ Tenant-scoped queries
export async function getOrgProjects(orgId: string) {
  const { userId, activeOrgId } = await requireAuth();
  if (activeOrgId !== orgId) throw new AuthError("Forbidden", 403);

  return db.query.projects.findMany({
    where: eq(projects.orgId, orgId),
  });
}
```

### HTTP Status Codes

| Status | When to use                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------- |
| 401    | No valid auth credentials. User must log in.                                                                              |
| 403    | Valid credentials, insufficient permissions. User is logged in but can't access this resource.                            |
| 404    | Resource doesn't exist, OR resource exists but user shouldn't know about it (security through obscurity — use sparingly). |

### Webhook Security

```typescript
// Generic webhook signature verification pattern
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// ❌ String comparison — vulnerable to timing attacks
if (signature === expected) { ... }

// ✅ Timing-safe comparison
if (timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) { ... }
```

</provider_agnostic>

<e2e_auth_testing>

## E2E Auth Testing

### API-Based Auth (Fast Path)

Authenticate via API calls instead of UI login (~100ms vs 2-5s):

```typescript
// tests/auth.setup.ts
import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate via API", async ({ request }) => {
  await request.post("/api/auth/test-login", {
    data: { email: process.env.TEST_USER_EMAIL },
  });
  await request.storageState({ path: authFile });
});
```

### Storage State Reuse

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: { storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
  ],
});
```

### Clerk Testing Token

```typescript
import { setupClerkTestingToken } from "@clerk/testing/playwright";

test("authenticated page", async ({ page }) => {
  await setupClerkTestingToken({ page });
  await page.goto("/dashboard");
  // Page loads as authenticated user — no UI login needed
});
```

### WorkOS SSO Bypass

For testing, create a test-only endpoint that bypasses SSO:

```typescript
// app/api/auth/test-login/route.ts
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "test") {
    return new Response("Not found", { status: 404 });
  }
  const { email } = await request.json();
  // Create session directly, bypassing SSO flow
  return signIn({ email, bypassSSO: true });
}
```

### Anti-Pattern: UI Login in Every Test

```typescript
// ❌ Slow — logs in through UI for each test
test.beforeEach(async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/dashboard");
});

// ✅ Fast — reuses storage state from setup
// (No beforeEach needed — storageState in config handles auth)
```

</e2e_auth_testing>
