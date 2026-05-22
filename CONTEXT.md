# Arc Context

This is the canonical source for Arc's product definition, domain language, and operating boundary. README, agent instructions, website copy, and individual skills may summarize Arc, but they should not introduce competing definitions.

Arc is a self-contained software development lifecycle for coding agents. It helps move work from idea to shipped code through explicit workflows for vision, ideation, implementation, review, testing, launch readiness, commit hygiene, and package publishing when a change includes a publishable package.

Arc should stay focused on the development cycle. It is not a general-purpose catalogue of every useful agent skill, and it should not require external personal skill collections to make its core workflows understandable or usable.

## Language

- **Arc**: The lifecycle system. It provides the spine of software work from early thinking through implementation and release.
- **Workflow**: A user-facing Arc skill that owns a recurring phase or cross-cutting concern in the development cycle.
- **Phase**: A lifecycle stage such as vision, ideation, implementation, review, testing, or release readiness.
- **Control plane**: The lightweight routing layer that decides which workflow applies without loading every workflow into context.
- **Supporting skill**: An internal or enabling Arc skill that helps workflows run but is not itself a user-facing lifecycle workflow.
- **Review**: An advisory workflow for evaluating plans, specs, or implementation approaches before deciding what to change.
- **Refactor**: A codebase-structure workflow for inspecting existing code with the explicit goal of producing a refactoring plan or RFC, including module/package extraction, god-file decomposition, duplication reduction, and testable interface design.
- **Audit**: A verification and assessment workflow that combines mechanical checks with specialist review to report current codebase health.
- **Publish**: Releasing a changed package to its registry after the corresponding commit has been pushed and the package version is confirmed unpublished.
- **Specialist lens**: A focused way of inspecting lifecycle work, such as reuse, API documentation, architecture boundaries, test quality, security, or performance.
- **Self-contained**: Arc workflows may absorb useful patterns from adjacent tools, but they should explain and execute those patterns in Arc's own language.
- **Full-runtime**: An install that includes Arc-owned agents, references, disciplines, templates, scripts, rules, and skills.
- **Prompt-only**: An install that includes skill prompts only. Prompt-only installs support lightweight guidance but may not support workflows that rely on Arc-owned files.

## Workflow Map

Arc's public workflow surface is organized around the lifecycle:

- **Why**: clarify project purpose, goals, and constraints.
- **What**: turn ideas into validated specs or plans.
- **Do**: implement, test, and verify the change.
- **Review**: inspect plans, code, architecture, implementation approach, and launch readiness.
- **Ship**: prepare the project for release, commit work cleanly, and preserve progress.

Cross-cutting workflows can run at any point, but they should still serve the lifecycle rather than becoming unrelated utilities.

`detail`, `progress`, and `using-arc` are supporting skills, not workflows. They should be documented as internal routing, planning, or persistence mechanisms rather than as public lifecycle stages.

## Product Boundary

Arc owns the software development cycle:

1. Clarify why the work matters.
2. Shape the idea into a feature spec.
3. Implement with tests and verification.
4. Review the plan, code, and rendered experience.
5. Prepare the project to ship.
6. Commit cleanly, push when requested, publish changed packages when requested, and keep progress legible.

Launch readiness means the project is visitable, shareable, and ready for a first real audience. It covers go-live basics such as deployment, domain, HTTPS, environment variables, access gates, metadata, social previews, favicons, obvious placeholders, accidental robots/noindex blockers, and production settings for detected services. It should not expand into responsive, testing, security, code-health, or deep search-optimization work; those belong outside launch or Arc.

Arc may include specialist checks when they are part of that cycle. For example, implementation and review workflows can check for reusable components, concise public API docs, architecture boundaries, oversized files, testability, security, and performance risk.

Refactoring is inside Arc when it serves codebase structure: finding where concerns belong, extracting coherent grouped behavior into discrete modules or packages, breaking up god components/scripts/modules, reducing real duplication, and creating a safe test-backed decomposition order. Arc should stop at a refactoring plan or RFC unless the user explicitly asks for implementation.

Brand identity creation is outside Arc's core lifecycle. Arc implementation workflows may consume an existing `docs/brand-system.md`, but Arc should not own brand discovery, identity direction generation, or brand asset production.

Project, product, package, and feature naming is outside Arc's core lifecycle. Arc vision or ideation workflows may ask for or use an existing name, but Arc should not own naming strategy, domain availability checks, GitHub conflict checks, or product-name validation.

Project hook installation and machine/editor automation are outside Arc's core lifecycle. Arc may recommend verification commands during implementation or commit workflows, but it should not own installing Claude hooks, git hooks, shell automation, editor configuration, or personal environment guardrails.

Project-wide rule installation is outside Arc's core lifecycle because copied rule bundles can clog agent context and become another environment setup surface. Arc may keep its own `rules/` corpus as internal reference material for workflows, but it should not expose a public workflow that copies those rules into a user's project or distributes them to other tools.

Machine process cleanup is outside Arc's core lifecycle. Arc workflows may finish cleanly and report spawned work, but they should not expose commands that kill local Claude, shell, editor, or background processes.

Plan cleanup is outside Arc's public workflow surface. Arc may create and reference plans during implementation, but it should not expose a separate command for deleting, archiving, or housekeeping old planning files.

Next-work suggestion and generic session routing are outside Arc's public workflow surface. Users should invoke the workflow they want directly, or use `/arc:help` to see the catalog.

Dependency and package maintenance are outside Arc's public workflow surface because Monogrove owns that space. Arc may notice dependency risk as part of broader audits, but it should not expose dependency update, CVE remediation, alternative discovery, or batch-upgrade workflows.

Deep SEO auditing is outside Arc's public workflow surface because other specialist skills own that space. Arc launch keeps basic shareability and accidental noindex/robots blocker checks, but it should not own sitemap depth, Search Console, structured data, canonical strategy, or search-optimization audits.

AI framework guidance is outside Arc's public workflow surface because the dedicated AI skill collection owns that space. Arc may implement AI-related product work when asked, but it should not maintain Vercel AI SDK references, migration rules, provider defaults, or AI-framework-specific setup workflows.

Feature/API documentation generation is outside Arc's public workflow surface because Marginalia owns concise code documentation and IDE-friendly JSDoc. Arc may still create lifecycle artifacts such as specs, plans, audit reports, and launch checklists, but it should not own general docs generation, feature docs, public API docs, or package documentation workflows.

Visual design direction, UI polish, and reusable Tailwind design systems are outside Arc's public workflow surface because Chiaroscuro owns that design truth. Arc can consume external design specs or Figma files during implementation, but it should not create independent visual direction, UI polish workflows, or design-review authorities.

Arc should not expose external skill dependencies for those checks. If a specialist practice matters to Arc, make it Arc-native: name it plainly, explain the judgment, and place it in the workflow where it belongs.

## Design Principles

- Review is woven throughout, not bolted on at the end.
- Keep the lifecycle visible. A user should understand where they are in the path from idea to shipped code.
- Use one focused question at a time when clarification is needed.
- Apply YAGNI when the proposed scope exceeds the user's goal.
- Use TDD and verification for implementation work.
- Keep quality continuous. Run relevant type, lint, build, and test checks during the work rather than only at the end.
- Let knowledge compound. Capture solved problems, decisions, and progress where future sessions can reuse them.
- Treat frontend implementation as part of software delivery, while deferring independent visual direction to the appropriate design source.
- Prefer routing to the smallest relevant Arc workflow over preloading broad context.
- Treat reviewers and audits as advisory. The user decides.
- Integrate quality checks into the relevant phase instead of bolting them on at the end.
- Absorb useful outside patterns only when they strengthen Arc's core lifecycle.
