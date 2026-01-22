# Complete Ruleset

Copy this entire `rules/` directory to your project's `.ruler/` directory to use these rules.

## Quick Setup

```bash
# Copy rules to your project
cp -r /path/to/docs/rules/* /your-project/.ruler/

# Rename README.md to agents.md
mv /your-project/.ruler/README.md /your-project/.ruler/agents.md

# Apply rules
npx ruler apply
```

## Rule Index

All rule docs use RFC 2119 terms (MUST/SHOULD/NEVER). Files are lowercase/kebab-case.

### Core Rules
| File | Purpose |
|------|---------|
| [versions.md](versions.md) | **Mandatory version requirements** |
| [code-style.md](code-style.md) | Formatting, syntax, naming |
| [typescript.md](typescript.md) | Type definitions and safety |
| [react.md](react.md) | Component patterns and hooks |
| [nextjs.md](nextjs.md) | App Router, assets, structure |
| [tailwind.md](tailwind.md) | Tailwind v4 configuration |

### Workflow Rules
| File | Purpose |
|------|---------|
| [testing.md](testing.md) | Unit, integration, E2E tests |
| [git.md](git.md) | Commits, PRs, workflow |
| [env.md](env.md) | Environment variable handling |
| [turborepo.md](turborepo.md) | Monorepo package patterns |
| [integrations.md](integrations.md) | External service adapters |

### Interface Guidelines
| File | Purpose |
|------|---------|
| [interface/index.md](interface/index.md) | Interface rules index |
| [interface/design.md](interface/design.md) | Visual design, contrast, shadows |
| [interface/colors.md](interface/colors.md) | Color palettes and methodology |
| [interface/spacing.md](interface/spacing.md) | Spacing system and layout |
| [interface/typography.md](interface/typography.md) | Type hierarchy and rendering |
| [interface/layout.md](interface/layout.md) | Alignment, responsive, safe areas |
| [interface/forms.md](interface/forms.md) | Form behavior and validation |
| [interface/interactions.md](interface/interactions.md) | Keyboard, touch, navigation |
| [interface/animation.md](interface/animation.md) | Motion and transitions |
| [interface/performance.md](interface/performance.md) | Rendering, loading, CLS |
| [interface/content-accessibility.md](interface/content-accessibility.md) | ARIA, content, a11y |

## Customization

Adapt these rules to fit your project:

1. **Remove unused rules** - Delete files for tech you don't use
2. **Update package names** - Replace `@project/ui`, `@project/env` with your actual package names
3. **Add project-specific rules** - Create new `.md` files as needed

## Notes

- Internationalization: Intentionally out-of-scope (add if needed)
- Security: Folded into env.md and integrations.md
