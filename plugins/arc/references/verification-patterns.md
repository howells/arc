# Verification Patterns: Detecting Stubs and Placeholders

Systematic patterns for detecting hollow implementations that pass linting but don't actually work. Complements the `verification-before-completion` discipline (which focuses on running commands and reading output) by defining WHAT to look for.

## The 4 Levels of Verification

Every piece of implementation should be checked at four levels:

| Level              | Question                                             | How to Check               |
| ------------------ | ---------------------------------------------------- | -------------------------- |
| 1. **Exists**      | Is the file present at the expected path?            | `ls`, glob                 |
| 2. **Substantive** | Is the content real implementation, not placeholder? | Grep for stub patterns     |
| 3. **Wired**       | Is it connected to the rest of the system?           | Grep for imports/usage     |
| 4. **Functional**  | Does it actually work when invoked?                  | Run the app, execute tests |

Levels 1-3 can be checked programmatically. Level 4 often requires running the application or targeted tests.

**Most stub bugs live at levels 2 and 3.** Code exists but is hollow, or code is substantive but nothing calls it.

## Universal Stub Detection

### Comment Stubs

```bash
# Search for TODO/placeholder comments in new or modified files
grep -rn "TODO\|FIXME\|PLACEHOLDER\|HACK\|XXX\|implement later\|coming soon\|not yet implemented" src/
```

Red flags:

- `// TODO: implement this`
- `// PLACEHOLDER — replace with real logic`
- `/* coming soon */`

### Placeholder Text

```bash
grep -rni "lorem ipsum\|coming soon\|under construction\|sample text\|example text\|placeholder" src/
```

### Empty Implementations

```bash
# Functions that return nothing useful
grep -rn "return null\|return undefined\|return {}\|return \[\]\|=> null\|=> undefined" src/

# Empty function bodies (arrow functions)
grep -rn "=> {}" src/

# Python pass statements
grep -rn "^\s*pass$" src/
```

Red flags:

- `export function handleSubmit() { return null; }`
- `const fetchData = async () => {}`
- `onChange={() => {}}`

### Hardcoded Values Where Dynamic Data Expected

```bash
# Hardcoded counts, IDs, display values
grep -rn "= 42\|= 100\|count: [0-9]\|total: [0-9]\|\"user-123\"\|\"fake-id\"" src/
```

Red flag: A dashboard showing `totalUsers: 42` instead of querying the database.

### Log-Only Functions

```bash
# Handlers that only log
grep -rn "console.log\|console.warn\|console.error" src/ | grep -v "node_modules"
```

Red flag: An onClick handler whose entire body is `console.log('clicked')`.

## Technology-Specific Patterns

### React Components

**Level 2 — Substantive checks:**

```bash
# Stub JSX returns
grep -rn "return <div>.*</div>" src/ --include="*.tsx" | grep -i "placeholder\|component\|todo\|coming"

# Empty fragment returns
grep -rn "return <></>" src/ --include="*.tsx"

# Null returns (sometimes valid, often a stub)
grep -rn "return null" src/ --include="*.tsx"
```

Stub examples:

```tsx
// Stub: renders nothing meaningful
export function UserProfile() {
  return <div>UserProfile</div>;
}

// Stub: empty fragment
export function Dashboard() {
  return <></>;
}
```

Substantive indicators:

- Uses props or state in the JSX
- Has event handlers with real logic (not empty or log-only)
- Renders dynamic content from data fetching or state
- More than a single wrapper div with text

**Level 2 — Event handler checks:**

```bash
# Empty handlers
grep -rn "onClick={() => {}}\|onChange={() => {}}\|onSubmit={() => {}}" src/

# Log-only handlers
grep -rn "onClick={() => console.log\|onChange={() => console.log" src/

# preventDefault-only handlers
grep -rn "onSubmit={(e) => e.preventDefault()}" src/
```

**Level 3 — Wiring checks:**

```bash
# Is the component imported anywhere?
grep -rn "import.*ComponentName" src/

# Does it receive and use props?
grep -rn "props\.\|{ .*}" src/ComponentName.tsx

# Does it call APIs or use data hooks?
grep -rn "fetch\|useSWR\|useQuery\|trpc\|api\." src/ComponentName.tsx
```

### API Routes

**Level 2 — Substantive checks:**

```bash
# Stub responses
grep -rn "Not implemented\|not yet\|TODO" src/app/api/ --include="*.ts"

# Empty or meaningless responses
grep -rn "Response.json({})\|Response.json({ message:" src/app/api/

# Routes shorter than 5 lines (likely stubs)
wc -l src/app/api/**/route.ts | sort -n | head -20
```

Stub examples:

```typescript
// Stub: returns static message
export async function GET() {
  return Response.json({ message: "Not implemented" });
}

// Stub: logs and returns empty
export async function POST(req: Request) {
  console.log("POST received");
  return Response.json({});
}
```

Substantive indicators:

- Parses request body or query parameters
- Queries a database or external service
- Has input validation
- Has error handling (try/catch with meaningful responses)
- Returns data derived from a query, not hardcoded

**Level 3 — Wiring checks:**

```bash
# Does it import a DB client?
grep -rn "import.*db\|import.*prisma\|import.*drizzle" src/app/api/**/route.ts

# Is it called from the frontend?
grep -rn "api/route-name\|/api/route-name" src/ --include="*.ts" --include="*.tsx"
```

### Database Schema

**Level 2 — Substantive checks:**

Stub indicators:

- Model with only an `id` field
- All fields typed as `String` (no proper types)
- Missing critical fields: `userId`, `createdAt`, `updatedAt`, `status`
- TODO comments in schema files

Substantive indicators:

- Has relationships (foreign keys, references)
- Appropriate field types (not all String)
- Indexes on fields used in queries
- Constraints (unique, not null)

### Hooks and Utilities

**Level 2 — Substantive checks:**

```bash
# Returns hardcoded values
grep -rn "return \".*\"\|return [0-9]\|return true\|return false" src/hooks/ src/lib/

# Empty function bodies
grep -rn "() => {}" src/hooks/ src/lib/
```

Stub examples:

```typescript
// Stub: hardcoded return
export function useUser() {
  return { name: "John", email: "john@example.com" };
}

// Stub: empty body
export function formatCurrency(amount: number): string {
  return "";
}
```

Substantive indicators:

- Uses React hooks (useState, useEffect, useMemo)
- Has conditional logic
- Has error handling
- Returns values derived from computation, not hardcoded
- More than 10 lines of logic

**Level 3 — Wiring checks:**

```bash
# Is the hook/utility imported anywhere?
grep -rn "import.*hookName\|import.*utilName" src/

# Are its return values consumed?
grep -rn "= useHookName()\|= utilName(" src/
```

## Wiring Verification Patterns

These patterns catch a specific class of bug: code that looks complete in isolation but isn't connected to anything.

### Component to API

**Check:** Does the component actually make the API call, and does it use the response?

```bash
# Find fetch/mutation calls in the component
grep -rn "fetch\|mutate\|useMutation\|trpc\.\|api\." src/components/FeatureName/

# Verify response is used (not just fire-and-forget)
grep -A5 "await fetch\|\.mutate(" src/components/FeatureName/
```

Red flags:

- `fetch` exists but response is not awaited or assigned
- Response assigned to variable but variable never used
- Fetch URL is commented out or points to a placeholder endpoint
- Fetch call exists inside a function that is never called

### API to Database

**Check:** Does the API route query the database, and does it return the result?

```bash
# Find DB queries in the route
grep -rn "db\.\|prisma\.\|drizzle\.\|\.findMany\|\.select\|\.insert" src/app/api/

# Verify query result is returned
grep -A3 "await.*db\.\|await.*prisma\.\|await.*drizzle\." src/app/api/
```

Red flags:

- Query exists but result is not returned in the response
- Query is not awaited (returns a Promise instead of data)
- Route imports DB client but never uses it

### Form to Handler

**Check:** Does the form's onSubmit trigger a real action?

```bash
# Find form handlers
grep -rn "onSubmit\|handleSubmit" src/ --include="*.tsx"
```

Red flags:

- Handler only calls `e.preventDefault()` with nothing else
- Handler only logs to console
- Handler is an empty function
- Handler calls a function that itself is a stub

### State to Render

**Check:** Does the component render its state, or is content hardcoded?

Red flags:

- State variable exists (`useState`, `useQuery`) but JSX has hardcoded text
- `.map()` call exists but maps over an empty array literal, not state
- Loading/error states handled but success state renders placeholder

## Quick Verification Checklists

### Component Checklist

1. File exists at expected path
2. Exports a named component
3. Returns JSX (not `null`, not `<></>`, not `<div>ComponentName</div>`)
4. No placeholder text in rendered output
5. Uses props or state to render dynamic content
6. Event handlers contain real logic
7. Imported and rendered somewhere in the app

### API Route Checklist

1. File exists at expected path
2. Exports HTTP method handlers (GET, POST, etc.)
3. Handler body is more than 5 lines
4. Queries a database or external service
5. Returns data from the query (not hardcoded)
6. Has error handling with meaningful error responses
7. Validates input from request
8. Called from at least one frontend component

### Hook/Utility Checklist

1. File exists at expected path
2. Exports named function(s)
3. Implementation has real logic (not hardcoded return)
4. Imported and called in at least one consumer
5. Return values are consumed by the caller (not discarded)

### Full Feature Checklist

For a complete feature (e.g., "users can update their profile"):

1. **UI exists:** Form component renders input fields from state
2. **Handler works:** onSubmit calls an API endpoint with form data
3. **API processes:** Route validates input, queries DB, returns result
4. **DB updates:** Schema has the right fields, migration has run
5. **Response flows back:** API response updates UI state
6. **Errors handled:** Validation errors shown to user, server errors caught

If any link in this chain is a stub, the feature does not work.
