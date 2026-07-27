# Audit Reviewer Rules

Which project coding rules each reviewer receives, and the frontend implementation checks that
ride along with the frontend reviewers.

**Check for project coding rules:**

**Use Glob tool:** `.ruler/*.md`

**Determine rules source:**

- **If `.ruler/` exists:** Read rules from `.ruler/`
- **If `.ruler/` doesn't exist:** Read rules from `rules/`

**Detect stack and read relevant rules from the rules source:**

| Check                                 | Read                    |
| ------------------------------------- | ----------------------- |
| Always                                | code-style.md, stack.md |
| `next.config.*` exists                | nextjs.md               |
| `react` in package.json               | react.md                |
| `tailwindcss` in package.json         | tailwind.md             |
| `.ts` or `.tsx` files                 | typescript.md           |
| `vitest` or `jest` in package.json    | testing.md              |
| `drizzle` or `prisma` in package.json | database.md             |
| `.env*` files exist                   | env.md                  |

Pass relevant rules to each reviewer agent.

**For each reviewer, pass domain-specific core rules:**

| Reviewer                | Core Rules to Pass                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| security-engineer       | api.md, env.md, integrations.md, auth.md (if Clerk/WorkOS), react-correctness.md (security section) |
| architecture-engineer   | stack.md, turborepo.md                                                                              |
| lee-nextjs-engineer     | nextjs.md, api.md, react-correctness.md (Next.js-specific rules)                                    |
| senior-engineer         | code-style.md, typescript.md, react.md, error-handling.md                                           |
| data-engineer           | database.md, testing.md, api.md                                                                     |
| daniel-product-engineer | react.md, typescript.md, react-performance.md, react-correctness.md                                 |
| mastra-agent-engineer   | api.md, integrations.md, typescript.md, error-handling.md                                           |
| performance-engineer    | react-performance.md                                                                                |

**For frontend implementation audits, also load code-level interface rules:**

| Reviewer                | Interface Rules to Pass                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| daniel-product-engineer | forms.md, interactions.md, performance.md, tailwind-authoring.md, buttons.md |
| lee-nextjs-engineer     | performance.md                                                               |

Interface rules location: `rules/interface/`

Pass relevant rules to each frontend reviewer in their prompt. These inform implementation and accessibility checks only. Do not score visual taste, invent a visual direction, or create redesign findings; defer visual design direction to the project's design source of truth.

**Frontend implementation checks — include in prompts for daniel-product-engineer and accessibility-engineer:**

In addition to their domain-specific rules, frontend reviewers should verify:

- No layout shift on dynamic content (hardcoded dimensions, `tabular-nums`, no font-weight changes on hover)
- Animations have `prefers-reduced-motion` support
- Touch targets are 44px minimum
- Hover effects gated behind `@media (hover: hover)`
- Keyboard navigation works (tab order, focus trap in modals, arrow keys in lists)
- Icon-only buttons have `aria-label`
- Forms submit with Enter; textareas with ⌘/Ctrl+Enter
- Inputs are `text-base` (16px+) to prevent iOS zoom
- No `transition: all` — specify exact properties
- z-index uses fixed scale or `isolation: isolate`
- No flash on refresh for interactive state (tabs, theme, toggles)
- Destructive actions require confirmation (`AlertDialog`, not `confirm()`)
