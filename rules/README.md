# Complete Ruleset

These rules are Arc-owned reference material for workflows and agents. They capture coding standards that remain relevant, but they should be loaded selectively instead of copied wholesale into every project context.

Arc no longer exposes a public workflow for installing these rules into `.ruler/` or distributing them through Ruler. Use them as internal guidance when a workflow needs a specific standard.

## Rule Index

All rule docs use RFC 2119 terms (MUST/SHOULD/NEVER). Files are lowercase/kebab-case.

### Core Rules
| File | Purpose |
|------|---------|
| [stack.md](stack.md) | **Preferred technologies and rejected alternatives** |
| [versions.md](versions.md) | **Mandatory version requirements** |
| [code-style.md](code-style.md) | Formatting, syntax, naming |
| [typescript.md](typescript.md) | Type definitions and safety |
| [react.md](react.md) | Component patterns and hooks |
| [react-correctness.md](react-correctness.md) | Hook rules, effects, state correctness |
| [react-performance.md](react-performance.md) | Memoization, re-render, bundle discipline |
| [nextjs.md](nextjs.md) | App Router, assets, structure, and server-owned route shape (`page.tsx`/`layout.tsx`) |
| [tailwind.md](tailwind.md) | Tailwind v4 configuration |

### Workflow Rules
| File | Purpose |
|------|---------|
| [testing.md](testing.md) | Unit, integration, E2E tests |
| [git.md](git.md) | Commits, PRs, workflow |
| [env.md](env.md) | Environment variable handling |
| [security.md](security.md) | Auth, input validation, headers, CSRF |
| [auth.md](auth.md) | Clerk, WorkOS, provider-agnostic auth |
| [error-handling.md](error-handling.md) | Error boundaries, logging, error pages |
| [database.md](database.md) | Schema design, migrations, queries |
| [turborepo.md](turborepo.md) | Monorepo package patterns |
| [integrations.md](integrations.md) | External service adapters |
| [api.md](api.md) | API design, tRPC, error formats |
| [cloudflare-workers.md](cloudflare-workers.md) | Workers runtime, KV, R2, wrangler |
| [cli.md](cli.md) | CLI patterns, dual-mode, agent friendliness |
| [tooling.md](tooling.md) | Issue tracking, Linear, MCP integrations |

### Interface Guidelines
| File | Purpose |
|------|---------|
| [interface/index.md](interface/index.md) | Interface rules index |
| [interface/design.md](interface/design.md) | Visual design, contrast, shadows |
| [interface/colors.md](interface/colors.md) | Color palettes and methodology |
| [interface/spacing.md](interface/spacing.md) | Spacing system and layout |
| [interface/typography.md](interface/typography.md) | Type hierarchy and rendering |
| [interface/tailwind-authoring.md](interface/tailwind-authoring.md) | Tailwind class-level authoring discipline |
| [interface/layout.md](interface/layout.md) | Alignment, responsive, safe areas |
| [interface/responsive.md](interface/responsive.md) | Responsive design, input detection, safe areas |
| [interface/buttons.md](interface/buttons.md) | Button sizing, hierarchy, focus, touch targets |
| [interface/surfaces.md](interface/surfaces.md) | Surface hierarchy, cards, dividers |
| [interface/sections.md](interface/sections.md) | Section composition and consistency |
| [interface/app-ui.md](interface/app-ui.md) | App UI (dashboards, SaaS, data tools) |
| [interface/forms.md](interface/forms.md) | Form behavior and validation |
| [interface/interactions.md](interface/interactions.md) | Keyboard, touch, navigation |
| [interface/animation.md](interface/animation.md) | Motion and transitions |
| [interface/performance.md](interface/performance.md) | Rendering, loading, CLS |
| [interface/content-accessibility.md](interface/content-accessibility.md) | ARIA, content, a11y |
| [interface/marketing.md](interface/marketing.md) | Marketing pages, distinctive design |

## Customization

If a project intentionally adopts these rules, adapt them before use:

1. **Remove unused rules** - Delete files for tech you don't use
2. **Update package names** - Replace `@project/ui`, `@project/env` with your actual package names
3. **Add project-specific rules** - Create new `.md` files as needed

## Notes

- Internationalization: Intentionally out-of-scope (add if needed)
- Deployment: `vercel.md` covers Vercel project and deployment conventions
- Background reading beyond these enforceable rules is catalogued in `references/index.md`
